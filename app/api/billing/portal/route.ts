import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // Get admin's business
    const { data: admin } = await supabase
      .from("admins")
      .select("business_id")
      .eq("id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Admin nicht gefunden" }, { status: 404 });
    }

    // Get subscription with stripe customer id
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("business_id", admin.business_id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "Kein Stripe-Konto gefunden" }, { status: 404 });
    }

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.bewertungenboost.de"}/admin`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Portals" }, { status: 500 });
  }
}
