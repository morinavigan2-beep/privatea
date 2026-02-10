import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";
import { SuperAdminPanel } from "@/components/admin/super-admin-panel";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Get admin's business (id is the user_id in admins table)
  const { data: admin } = await supabase
    .from("admins")
    .select("*, businesses(*)")
    .eq("id", user.id)
    .single();

  // Check if super admin
  if (admin?.is_super_admin) {
    // Get all businesses, admins, and subscriptions for super admin
    const { data: businesses } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: admins } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: allPayments } = await supabase
      .from("payments")
      .select("*")
      .order("paid_at", { ascending: false });

    return (
      <SuperAdminPanel
        businesses={businesses || []}
        admins={admins || []}
        subscriptions={subscriptions || []}
        payments={allPayments || []}
      />
    );
  }

  if (!admin || !admin.businesses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Kein Zugang
          </h1>
          <p className="text-muted-foreground">
            Sie haben keinen Zugang zu einem Geschäft.
          </p>
        </div>
      </div>
    );
  }

  // Get reviews for this business
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("business_id", admin.business_id)
    .order("created_at", { ascending: false });

  // Calculate statistics
  const allReviews = reviews || [];
  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: allReviews.filter((r) => r.rating === rating).length,
  }));

  const privateReviews = allReviews.filter((r) => !r.redirected_to_google);
  const googleRedirects = allReviews.filter((r) => r.redirected_to_google);

  // Get subscription data
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("business_id", admin.business_id)
    .single();

  // Get payment history
  let payments: any[] = [];
  if (subscription) {
    const { data: paymentData } = await supabase
      .from("payments")
      .select("*")
      .eq("subscription_id", subscription.id)
      .order("paid_at", { ascending: false });
    payments = paymentData || [];
  }

  return (
    <AdminDashboard
      business={admin.businesses}
      stats={{
        totalReviews,
        averageRating,
        ratingDistribution,
        privateReviews: privateReviews.length,
        googleRedirects: googleRedirects.length,
      }}
      recentReviews={allReviews.slice(0, 20)}
      subscription={subscription}
      payments={payments}
    />
  );
}
