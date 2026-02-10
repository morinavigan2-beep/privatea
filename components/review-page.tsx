"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import { MapPin, ArrowLeft } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { GoogleRedirect } from "@/components/google-redirect";
import { ThankYou } from "@/components/thank-you";
import { Card, CardContent } from "@/components/ui/card";

interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_url: string;
  address: string | null;
  formspree_id: string | null;
}

interface ReviewPageProps {
  business: Business;
}

type Step = "rating" | "feedback" | "google" | "thankyou";

export function ReviewPage({ business }: ReviewPageProps) {
  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating: newRating,
          isPrivate: newRating <= 3,
        }),
      });

      const result = await response.json();
      if (result.review?.id) {
        setReviewId(result.review.id);
      }
    } catch (error) {
      // Silently fail - don't block the user experience
    }

    if (newRating >= 4) {
      setStep("google");
    } else {
      setStep("feedback");
    }
  };

  const handleResetRating = () => {
    setStep("rating");
    setRating(0);
    setReviewId(null);
  };

  const handleFeedbackSuccess = async (message: string) => {
    // Save the feedback message to the database
    if (reviewId && message) {
      try {
        await fetch("/api/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewId,
            message,
          }),
        });
      } catch (error) {
        // Don't block user experience
      }
    }
    setStep("thankyou");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full py-3 px-4 flex justify-center border-b border-border">
        <Image
          src={business.logo_url || "/placeholder.svg"}
          alt={business.name}
          width={122}
          height={138}
          className="h-20 sm:h-24 w-auto object-contain"
          priority
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 pb-8 px-6">
            {step === "rating" && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-foreground text-balance">
                    Bewerten Sie Ihren Besuch
                  </h1>
                  <p className="text-muted-foreground">
                    Tippen Sie auf die Sterne
                  </p>
                </div>

                <div className="py-4">
                  <StarRating rating={rating} onRatingChange={handleRatingChange} />
                </div>
              </div>
            )}

            {step === "feedback" && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-3">
                    <StarRating rating={rating} onRatingChange={() => {}} disabled />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Danke für Ihr Feedback. Bitte sagen Sie uns kurz, was wir
                    verbessern können.
                  </p>
                </div>

                <div className="border-t border-border pt-5">
                  <FeedbackFormWithDB
                    rating={rating}
                    businessId={business.id}
                    formspreeId={business.formspree_id}
                    onSuccess={handleFeedbackSuccess}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetRating}
                  className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Bewertung ändern
                </button>
              </div>
            )}

            {step === "google" && (
              <div className="space-y-5">
                <div className="flex justify-center mb-3">
                  <StarRating rating={rating} onRatingChange={() => {}} disabled />
                </div>
                <GoogleRedirectDynamic googleReviewUrl={business.google_review_url} />

                <button
                  type="button"
                  onClick={handleResetRating}
                  className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Bewertung ändern
                </button>
              </div>
            )}

            {step === "thankyou" && <ThankYou />}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      {business.address && (
        <footer className="py-4 px-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{business.address}</span>
          </div>
        </footer>
      )}
    </div>
  );
}

// Dynamic Google redirect component
function GoogleRedirectDynamic({ googleReviewUrl }: { googleReviewUrl: string }) {
  const { useEffect } = require("react");
  const { Button } = require("@/components/ui/button");
  const { ExternalLink } = require("lucide-react");

  useEffect(() => {
    window.location.href = googleReviewUrl;
  }, [googleReviewUrl]);

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
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer">
          Weiter zu Google
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

// Feedback form with database support
function FeedbackFormWithDB({
  rating,
  businessId,
  formspreeId,
  onSuccess,
}: {
  rating: number;
  businessId: string;
  formspreeId: string | null;
  onSuccess: (message: string) => void;
}) {
  const { useState } = require("react");
  const { Button } = require("@/components/ui/button");
  const { Textarea } = require("@/components/ui/textarea");
  const { Loader2 } = require("lucide-react");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // If formspree is configured, also send to formspree
    if (formspreeId) {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("message", message);
      formData.append("business_id", businessId);

      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
    }

    onSuccess(message);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Textarea
        id="message"
        name="message"
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
        placeholder="Was können wir verbessern?"
        rows={4}
        className="text-base bg-card border-border focus:border-primary focus:ring-primary resize-none"
      />

      <Button
        type="submit"
        disabled={isSubmitting || !message}
        className="w-full h-12 text-base font-medium rounded-[4px]"
        style={{ backgroundColor: "#1A73E8" }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          "Posten"
        )}
      </Button>
    </form>
  );
}
