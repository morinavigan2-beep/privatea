import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    // If webhook secret is configured, verify signature
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const businessId = session.metadata?.business_id;

          if (businessId) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            // Update business with stripe customer id
            await supabase
              .from("businesses")
              .update({ stripe_customer_id: customerId })
              .eq("id", businessId);

            // Create subscription record
            await supabase.from("subscriptions").upsert({
              business_id: businessId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            }, {
              onConflict: "stripe_subscription_id"
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Get our subscription record
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await supabase.from("payments").insert({
              subscription_id: sub.id,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
              paid_at: new Date((invoice.status_transitions?.paid_at || Date.now() / 1000) * 1000).toISOString(),
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status
          await supabase
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subscriptionId);

          // Get our subscription record
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await supabase.from("payments").insert({
              subscription_id: sub.id,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              amount_cents: invoice.amount_due,
              currency: invoice.currency,
              status: "failed",
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
