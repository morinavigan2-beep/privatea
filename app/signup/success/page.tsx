"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Loader2, PartyPopper } from "lucide-react";

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Verify the session (optional - webhook handles the actual subscription)
      setTimeout(() => {
        setIsVerifying(false);
        setVerified(true);
      }, 2000);
    } else {
      setIsVerifying(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {isVerifying ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-400" />
            <p className="text-white/60">Zahlung wird bestatigt...</p>
          </div>
        ) : verified ? (
          <>
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-12 w-12 text-white" />
              </div>
              <PartyPopper className="absolute top-0 right-1/4 h-8 w-8 text-yellow-400 animate-bounce" />
            </div>

            <Image
              src="/logo-white.png"
              alt="BewertungenBoost"
              width={180}
              height={40}
              className="h-8 w-auto mx-auto mb-6"
            />

            <h1 className="text-3xl font-bold mb-4">
              Willkommen bei BewertungenBoost!
            </h1>
            
            <p className="text-white/60 mb-8">
              Ihre Zahlung war erfolgreich. Ihr Dashboard ist jetzt aktiv und wir versenden Ihr Starter-Kit in den nachsten 1-2 Werktagen.
            </p>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Nachste Schritte:</h3>
              <ul className="space-y-3">
                {[
                  "Loggen Sie sich in Ihr Dashboard ein",
                  "Wir versenden Ihr NFC-Stand und Sticker",
                  "Teilen Sie Ihren Bewertungslink mit Kunden",
                  "Beobachten Sie Ihre Bewertungen wachsen!",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/70">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 h-14 px-8">
              <Link href="/admin/login">
                Zum Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Etwas ist schief gelaufen</h1>
            <p className="text-white/60 mb-6">
              Ihre Zahlung konnte nicht bestatigt werden. Bitte kontaktieren Sie uns.
            </p>
            <Button asChild variant="outline" className="bg-transparent border-white/20">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
