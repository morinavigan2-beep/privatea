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

    // Get subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("business_id", admin.business_id)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: "Kein aktives Abo gefunden" }, { status: 404 });
    }

    // Cancel at period end (don't cancel immediately)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update in database
    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("business_id", admin.business_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Fehler beim Kuendigen" }, { status: 500 });
  }
}
