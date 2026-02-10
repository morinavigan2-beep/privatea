import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID fehlt" },
        { status: 400 }
      );
    }

    // Get the base URL
    const origin = request.headers.get("origin") || "https://bewertungenboost.de";

    // Create Stripe Checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "sepa_debit"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "BewertungenBoost Monatlich",
              description: "NFC-Stand + 3x Acryl-Sticker + 10x Google Sticker + Dashboard-Zugang",
            },
            unit_amount: 5000, // 50 EUR in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        business_id: businessId,
      },
      success_url: `${origin}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=true`,
      locale: "de",
      billing_address_collection: "required",
      customer_creation: "always",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
