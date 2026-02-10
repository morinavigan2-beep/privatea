import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, businessId } = await request.json();

    // Verify the requester is a super admin
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!admin?.is_super_admin) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    // Use the service role key to create users without signing them in
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create the user using admin API
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: "Benutzer konnte nicht erstellt werden" },
        { status: 400 }
      );
    }

    // Create admin record
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from("admins")
      .insert({
        id: newUser.user.id,
        email: email,
        business_id: businessId,
        is_super_admin: false,
      })
      .select()
      .single();

    if (adminError) {
      // Clean up the user if admin creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: adminError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, admin: adminData });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
