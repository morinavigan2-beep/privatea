"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Users,
  MessageSquare,
  LogOut,
  TrendingUp,
  ShieldCheck,
  ThumbsUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Receipt,
  ExternalLink,
  BadgeEuro,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { RatingChart } from "./rating-chart";
import { RecentReviews } from "./recent-reviews";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_url: string;
  address: string | null;
}

interface Stats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  privateReviews: number;
  googleRedirects: number;
}

interface Review {
  id: string;
  rating: number;
  message: string | null;
  redirected_to_google: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string;
  created_at: string;
}

interface AdminDashboardProps {
  business: Business;
  stats: Stats;
  recentReviews: Review[];
  subscription?: Subscription | null;
  payments?: Payment[];
}

export function AdminDashboard({
  business,
  stats,
  recentReviews,
  subscription,
  payments = [],
}: AdminDashboardProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const protectionRate =
    stats.totalReviews > 0
      ? Math.round((stats.privateReviews / stats.totalReviews) * 100)
      : 0;

  const googleSuccessRate =
    stats.totalReviews > 0
      ? Math.round((stats.googleRedirects / stats.totalReviews) * 100)
      : 0;

  // Value calculations
  // Each blocked bad review saves ~30 potential customers. Average customer spends ~25 EUR.
  const LOST_CUSTOMERS_PER_BAD_REVIEW = 30;
  const AVG_CUSTOMER_VALUE = 25;
  const estimatedRevenueSaved = stats.privateReviews * LOST_CUSTOMERS_PER_BAD_REVIEW * AVG_CUSTOMER_VALUE;

  // What their rating WOULD be if bad reviews went to Google
  const allRatings = stats.ratingDistribution;
  const totalStarsWithBad = allRatings.reduce((sum, r) => sum + r.rating * r.count, 0);
  const ratingWithoutProtection = stats.totalReviews > 0
    ? (totalStarsWithBad / stats.totalReviews).toFixed(1)
    : "0.0";
  const ratingWithProtection = stats.googleRedirects > 0
    ? (allRatings
        .filter((r) => r.rating >= 4)
        .reduce((sum, r) => sum + r.rating * r.count, 0) / stats.googleRedirects).toFixed(1)
    : "0.0";

  // ROI - subscription cost vs saved revenue
  const monthsActive = subscription
    ? Math.max(1, Math.ceil(
        (new Date().getTime() - new Date(subscription.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
      ))
    : 1;
  const totalCost = monthsActive * 50;
  const roiMultiplier = totalCost > 0 ? Math.round(estimatedRevenueSaved / totalCost) : 0;

  const getStatusText = () => {
    if (!subscription) return "Kein aktives Abo";
    switch (subscription.status) {
      case "active":
        return subscription.cancel_at_period_end
          ? "Aktiv (endet am " + new Date(subscription.current_period_end).toLocaleDateString("de-DE") + ")"
          : "Aktiv";
      case "past_due":
        return "Zahlung ausstehend";
      case "canceled":
        return "Gekuendigt";
      default:
        return subscription.status;
    }
  };

  const getMonthName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-black.png"
                alt="BewertungenBoost"
                width={140}
                height={32}
                className="h-7 w-auto"
              />
              <div className="hidden sm:block h-6 w-px bg-border" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {business.name}
                </h1>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-700">Reputation geschutzt</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-red-600">{stats.privateReviews}</span>
                    <span className="text-lg text-red-600/70">negative Bewertungen</span>
                  </div>
                  <p className="text-sm text-red-600/80 mt-2">abgefangen und privat gehalten</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-red-600" />
                </div>
              </div>
              {stats.totalReviews > 0 && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">Schutzrate</span>
                    <span className="font-semibold text-red-600">{protectionRate}% der Bewertungen</span>
                  </div>
                  <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${protectionRate}%` }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">Google Bewertungen</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-600">{stats.googleRedirects}</span>
                    <span className="text-lg text-green-600/70">positive Bewertungen</span>
                  </div>
                  <p className="text-sm text-green-600/80 mt-2">zu Google weitergeleitet</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              {stats.totalReviews > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Erfolgsrate</span>
                    <span className="font-semibold text-green-600">{googleSuccessRate}% positive Bewertungen</span>
                  </div>
                  <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${googleSuccessRate}%` }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Value Saved - Impact Section */}
        {stats.privateReviews > 0 && (
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-emerald-400">
                  Ihr BewertungenBoost Mehrwert
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Revenue Saved */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-emerald-400">
                      {estimatedRevenueSaved.toLocaleString("de-DE")}
                    </span>
                    <span className="text-lg text-emerald-400/70">EUR</span>
                  </div>
                  <p className="text-sm text-white/60">
                    Geschatzter Umsatz geschutzt
                  </p>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <BadgeEuro className="h-3 w-3" />
                    <span>{stats.privateReviews} abgefangene Bewertungen x {LOST_CUSTOMERS_PER_BAD_REVIEW} Kunden x {AVG_CUSTOMER_VALUE} EUR</span>
                  </div>
                </div>

                {/* Rating Protection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-red-400 line-through">{ratingWithoutProtection}</span>
                      <p className="text-[10px] uppercase tracking-wide text-red-400/70">Ohne Schutz</p>
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                    <div className="text-center">
                      <span className="text-4xl font-bold text-white">{ratingWithProtection}</span>
                      <p className="text-[10px] uppercase tracking-wide text-emerald-400">Aktuell auf Google</p>
                    </div>
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-sm text-white/60">
                    Google-Bewertung geschutzt
                  </p>
                  <p className="text-xs text-white/40">
                    +{(Number(ratingWithProtection) - Number(ratingWithoutProtection)).toFixed(1)} Sterne Unterschied dank BewertungenBoost
                  </p>
                </div>

                {/* ROI */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-blue-400">
                      {roiMultiplier}x
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    Return on Investment
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Ihr Investment</span>
                      <span>{totalCost.toLocaleString("de-DE")} EUR ({monthsActive} {monthsActive === 1 ? "Monat" : "Monate"})</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Geschutzter Umsatz</span>
                      <span>{estimatedRevenueSaved.toLocaleString("de-DE")} EUR</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (roiMultiplier / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg"><Users className="h-5 w-5 text-muted-foreground" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">Gesamt Bewertungen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Star className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Durchschnitt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><MessageSquare className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{recentReviews.filter((r) => r.message).length}</p>
                  <p className="text-xs text-muted-foreground">Mit Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{googleSuccessRate}%</p>
                  <p className="text-xs text-muted-foreground">Erfolgsrate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Bewertungsverteilung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RatingChart data={stats.ratingDistribution} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Private Bewertungen (1-3 Sterne)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentReviews reviews={recentReviews} />
            </CardContent>
          </Card>
        </div>

        {/* Subscription & Billing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />
              Abonnement & Abrechnung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${subscription?.status === "active" ? "bg-green-100" : "bg-orange-100"}`}>
                  {subscription?.status === "active" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">BewertungenBoost Monatlich</h3>
                  <p className={`text-sm ${subscription?.status === "active" ? "text-green-600" : "text-orange-600"}`}>
                    {getStatusText()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1">
                <span className="text-2xl font-bold">{'50,00 EUR'}</span>
                <span className="text-sm text-muted-foreground">pro Monat</span>
              </div>
            </div>

            {/* Billing Details */}
            {subscription && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Abo-Start
                  </div>
                  <p className="font-semibold">
                    {new Date(subscription.created_at).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Aktuelle Periode
                  </div>
                  <p className="font-semibold">
                    {new Date(subscription.current_period_start).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" - "}
                    {new Date(subscription.current_period_end).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Receipt className="h-4 w-4" />
                    Nachste Zahlung
                  </div>
                  <p className="font-semibold">
                    {subscription.cancel_at_period_end
                      ? "Keine (gekuendigt)"
                      : new Date(subscription.current_period_end).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                  </p>
                </div>
              </div>
            )}

            {/* Payment History */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Zahlungsverlauf
              </h4>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Monat</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {getMonthName(payment.paid_at || payment.created_at)}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paid_at || payment.created_at).toLocaleDateString("de-DE", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {(payment.amount_cents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {payment.status === "succeeded" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Bezahlt
                            </span>
                          ) : payment.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3" />
                              Fehlgeschlagen
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3" />
                              Ausstehend
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Zahlungen vorhanden</p>
                </div>
              )}
            </div>

            {/* Manage Subscription Button */}
            {subscription?.stripe_subscription_id && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={async () => {
                    const res = await fetch("/api/billing/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Zahlungsmethode andern
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  onClick={async () => {
                    if (!confirm("Mochten Sie Ihr Abo wirklich kundigen? Es bleibt bis zum Ende der aktuellen Periode aktiv.")) return;
                    const res = await fetch("/api/billing/cancel", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      alert("Ihr Abo wurde gekuendigt und lauft bis zum Ende der aktuellen Periode.");
                      window.location.reload();
                    }
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Abo kundigen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
