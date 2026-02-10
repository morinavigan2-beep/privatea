"use client";

import React from "react"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, ArrowRight, ShieldCheck, Star, TrendingUp } from "lucide-react";

export default function SignupPage() {
  const [step, setStep] = useState<"info" | "account" | "checkout">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    googleReviewUrl: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [businessId, setBusinessId] = useState<string | null>(null);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.googleReviewUrl) {
      setError("Bitte fullen Sie alle Pflichtfelder aus");
      return;
    }
    setError("");
    setStep("account");
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passworter stimmen nicht uberein");
      return;
    }

    if (formData.password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Benutzer konnte nicht erstellt werden");

      // 2. Create business via API
      const businessRes = await fetch("/api/signup/create-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          businessName: formData.businessName,
          address: formData.address,
          googleReviewUrl: formData.googleReviewUrl,
          email: formData.email,
        }),
      });

      const businessData = await businessRes.json();
      if (!businessRes.ok) throw new Error(businessData.error);

      setBusinessId(businessData.businessId);
      setStep("checkout");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout konnte nicht gestartet werden");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="BewertungenBoost"
                width={160}
                height={36}
                className="h-7 w-auto"
              />
            </Link>
            <Link href="/admin/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Bereits Kunde? Login
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="hidden lg:block sticky top-32">
              <h1 className="text-4xl font-bold mb-6">
                Starten Sie mit{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  BewertungenBoost
                </span>
              </h1>
              <p className="text-white/60 text-lg mb-10">
                Schutzen Sie Ihre Online-Reputation ab heute. Nur 50 EUR/Monat - weniger als 2 EUR pro Tag.
              </p>

              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: "Negative Bewertungen abfangen", desc: "1-3 Sterne Bewertungen bleiben privat" },
                  { icon: Star, title: "Mehr Google Bewertungen", desc: "4-5 Sterne direkt zu Google weiterleiten" },
                  { icon: TrendingUp, title: "Live Dashboard", desc: "Alle Statistiken in Echtzeit verfolgen" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <item.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-white/50 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-semibold mb-4">Im Paket enthalten:</h3>
                <ul className="space-y-3">
                  {[
                    "1x Premium NFC-Stand",
                    "3x Acryl-Sticker",
                    "10x Google Review Sticker",
                    "Unbegrenzter Dashboard-Zugang",
                    "E-Mail Support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70">
                      <Check className="h-5 w-5 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Side - Form */}
            <div>
              {/* Progress Steps */}
              <div className="flex items-center gap-4 mb-8">
                {["Geschaftsdaten", "Account", "Zahlung"].map((label, i) => {
                  const stepIndex = ["info", "account", "checkout"].indexOf(step);
                  const isActive = i === stepIndex;
                  const isComplete = i < stepIndex;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isComplete ? "bg-emerald-500 text-white" : 
                        isActive ? "bg-white text-black" : 
                        "bg-white/10 text-white/40"
                      }`}>
                        {isComplete ? <Check className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-sm hidden sm:block ${isActive ? "text-white" : "text-white/40"}`}>
                        {label}
                      </span>
                      {i < 2 && <div className="w-8 h-px bg-white/10" />}
                    </div>
                  );
                })}
              </div>

              <Card className="bg-white/[0.02] border-white/10">
                <CardContent className="p-8">
                  {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {step === "info" && (
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Ihr Geschaft</h2>
                        <p className="text-white/50">Erzahlen Sie uns von Ihrem Unternehmen</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-white">Geschaftsname *</Label>
                          <Input
                            id="businessName"
                            placeholder="z.B. Restaurant Musterhaus"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-white">Adresse</Label>
                          <Input
                            id="address"
                            placeholder="Musterstraße 1, 12345 Berlin"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="googleReviewUrl" className="text-white">Google Bewertungslink *</Label>
                          <Input
                            id="googleReviewUrl"
                            placeholder="https://g.page/r/..."
                            value={formData.googleReviewUrl}
                            onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                            required
                          />
                          <p className="text-xs text-white/40">
                            Sie finden diesen Link in Ihrem Google Business Profile unter {"'"}Bewertungen{"'"}.
                          </p>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full bg-white text-black hover:bg-white/90 h-14 text-base">
                        Weiter
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}

                  {step === "account" && (
                    <form onSubmit={handleAccountSubmit} className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Ihr Account</h2>
                        <p className="text-white/50">Erstellen Sie Ihren Admin-Zugang</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">E-Mail Adresse *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="ihre@email.de"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white">Passwort *</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Mindestens 6 Zeichen"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white">Passwort bestatigen *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Passwort wiederholen"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setStep("info")}
                          className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 h-14"
                        >
                          Zuruck
                        </Button>
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="flex-[2] bg-white text-black hover:bg-white/90 h-14 text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Wird erstellt...
                            </>
                          ) : (
                            <>
                              Account erstellen
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}

                  {step === "checkout" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Account erstellt!</h2>
                        <p className="text-white/50">
                          Nur noch ein Schritt: Aktivieren Sie Ihr Abo
                        </p>
                      </div>

                      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white/70">BewertungenBoost Monatlich</span>
                          <span className="text-2xl font-bold">50 EUR</span>
                        </div>
                        <p className="text-sm text-white/50 mb-4">
                          Monatlich kundbar. Keine versteckten Kosten.
                        </p>
                        <ul className="space-y-2 text-sm text-white/60">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-400" />
                            NFC-Stand + Sticker werden nach Zahlung versendet
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-400" />
                            Sofortiger Dashboard-Zugang
                          </li>
                        </ul>
                      </div>

                      <Button 
                        onClick={handleCheckout}
                        size="lg" 
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white h-14 text-base"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Weiterleitung zu Stripe...
                          </>
                        ) : (
                          <>
                            Jetzt bezahlen
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-white/40">
                        Sichere Zahlung uber Stripe. Sie konnen jederzeit kundigen.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
