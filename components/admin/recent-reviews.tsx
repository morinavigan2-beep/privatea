"use client";

import { Star, ShieldCheck, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  message: string | null;
  redirected_to_google: boolean;
  created_at: string;
}

interface RecentReviewsProps {
  reviews: Review[];
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  // Only show 1-3 star private reviews
  const privateReviews = reviews.filter((r) => r.rating <= 3 && !r.redirected_to_google);

  if (privateReviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine negativen Bewertungen vorhanden - gut gemacht!
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {privateReviews.map((review) => (
        <div
          key={review.id}
          className="rounded-lg p-4 space-y-3 bg-orange-50 border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-orange-700">
                {review.rating} von 5
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              Privat
            </span>
          </div>

          {review.message ? (
            <div className="bg-white rounded-md p-3 border border-orange-100">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{review.message}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-md p-3 border border-orange-100">
              <p className="text-sm text-muted-foreground italic">
                Kein Kommentar hinterlassen
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
