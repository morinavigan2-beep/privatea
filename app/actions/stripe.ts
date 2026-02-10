"use server";

import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_PRODUCT } from "@/lib/products";

export async function createSubscriptionCheckout(
  customerEmail: string,
  businessName: string,
  successUrl: string,
  cancelUrl: string
) {
  // For subscriptions, we need to use a Price ID from Stripe
  // In test mode, we'll create a price on the fly
  // In production, you should use a pre-created Price ID

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "sepa_debit"],
    customer_email: customerEmail,
    metadata: {
      businessName: businessName,
    },
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: SUBSCRIPTION_PRODUCT.name,
            description: SUBSCRIPTION_PRODUCT.description,
          },
          unit_amount: SUBSCRIPTION_PRODUCT.priceInCents,
          recurring: {
            interval: SUBSCRIPTION_PRODUCT.interval,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        businessName: businessName,
      },
    },
  });

  return { url: session.url, sessionId: session.id };
}

export async function createEmbeddedCheckout(
  customerEmail: string,
  businessName: string
) {
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    metadata: {
      businessName: businessName,
    },
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: SUBSCRIPTION_PRODUCT.name,
            description: SUBSCRIPTION_PRODUCT.description,
          },
          unit_amount: SUBSCRIPTION_PRODUCT.priceInCents,
          recurring: {
            interval: SUBSCRIPTION_PRODUCT.interval,
          },
        },
        quantity: 1,
      },
    ],
    redirect_on_completion: "never",
    subscription_data: {
      metadata: {
        businessName: businessName,
      },
    },
  });

  return session.client_secret;
}

export async function getCustomerPortalUrl(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
