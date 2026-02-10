"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

interface FeedbackFormProps {
  rating: number;
  onSuccess: () => void;
}

export function FeedbackForm({ rating, onSuccess }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        `https://formspree.io/f/${siteConfig.formspreeId}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="rating" value={rating} />
      <Textarea
        id="message"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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
