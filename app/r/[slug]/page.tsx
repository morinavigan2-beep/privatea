import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ReviewPage } from "@/components/review-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!business) {
    notFound();
  }

  return <ReviewPage business={business} />;
}
