import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { userId, businessName, address, googleReviewUrl, email } = await request.json();

    if (!userId || !businessName || !googleReviewUrl || !email) {
      return NextResponse.json(
        { error: "Fehlende Pflichtfelder" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists and make it unique
    const { data: existingBusiness } = await supabase
      .from("businesses")
      .select("slug")
      .eq("slug", slug)
      .single();

    const finalSlug = existingBusiness 
      ? `${slug}-${Date.now().toString(36)}` 
      : slug;

    // Create business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        name: businessName,
        slug: finalSlug,
        address: address || null,
        google_review_url: googleReviewUrl,
      })
      .select()
      .single();

    if (businessError) {
      console.error("Business creation error:", businessError);
      return NextResponse.json(
        { error: "Geschaft konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    // Create admin link
    const { error: adminError } = await supabase
      .from("admins")
      .insert({
        id: userId,
        business_id: business.id,
        email: email,
        is_super_admin: false,
      });

    if (adminError) {
      console.error("Admin creation error:", adminError);
      // Cleanup: delete the business if admin creation fails
      await supabase.from("businesses").delete().eq("id", business.id);
      return NextResponse.json(
        { error: "Admin-Account konnte nicht erstellt werden" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      businessId: business.id,
      slug: finalSlug,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
