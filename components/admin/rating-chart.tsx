"use client";

import { Star } from "lucide-react";

interface RatingChartProps {
  data: { rating: number; count: number }[];
}

export function RatingChart({ data }: RatingChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const item = data.find((d) => d.rating === rating);
        const count = item?.count || 0;
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-16">
              <span className="text-sm font-medium">{rating}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: rating >= 4 ? "#22c55e" : rating === 3 ? "#eab308" : "#ef4444",
                }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
