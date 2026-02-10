"use client";

import React from "react"

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();

    // Check if any super admin already exists
    const { data: existingAdmins } = await supabase
      .from("admins")
      .select("id")
      .eq("is_super_admin", true)
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      setError("Ein Super-Admin existiert bereits. Bitte melden Sie sich an.");
      setIsLoading(false);
      return;
    }

    // Create the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Fehler beim Erstellen des Benutzers");
      setIsLoading(false);
      return;
    }

    // Create the super admin record using the RPC function (bypasses RLS)
    const { error: adminError } = await supabase.rpc("setup_first_super_admin", {
      p_user_id: authData.user.id,
      p_email: email,
    });

    if (adminError) {
      setError(adminError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/admin/login");
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Super-Admin erstellt!
          </h1>
          <p className="text-muted-foreground">
            Bitte bestätigen Sie Ihre E-Mail-Adresse und melden Sie sich dann an.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <Image
              src="/logo-black.png"
              alt="BewertungenBoost"
              width={200}
              height={50}
              className="h-10 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Super-Admin Setup
            </h1>
            <p className="text-muted-foreground mt-2">
              Erstellen Sie Ihren ersten Super-Admin Account
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-[4px]"
              style={{ backgroundColor: "#1A73E8" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Super-Admin erstellen"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
