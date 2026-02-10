"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function GoogleRedirect() {
  useEffect(() => {
    window.location.href = siteConfig.googleReviewUrl;
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <p className="text-lg text-foreground leading-relaxed">
          Vielen Dank! Bitte teilen Sie Ihre Erfahrung jetzt auf Google.
        </p>
        <p className="text-sm text-muted-foreground">Weiterleitung...</p>
      </div>

      <Button
        asChild
        className="w-full h-12 text-base font-medium rounded-[4px]"
        style={{ backgroundColor: "#1A73E8" }}
      >
        <a
          href={siteConfig.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Weiter zu Google
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
