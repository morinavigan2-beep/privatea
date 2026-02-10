"use client";

import React from "react";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Building2, Users, Loader2, Trash2, Eye, LogOut, CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_url: string;
  address: string | null;
  formspree_id: string | null;
  created_at: string;
}

interface Admin {
  id: string;
  user_id: string;
  business_id: string;
  is_super_admin: boolean;
  created_at: string;
  email?: string;
}

interface Subscription {
  id: string;
  business_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

interface Payment {
  id: string;
  subscription_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  paid_at: string;
  created_at: string;
}

interface SuperAdminPanelProps {
  businesses: Business[];
  admins: Admin[];
  subscriptions?: Subscription[];
  payments?: Payment[];
}

export function SuperAdminPanel({
  businesses: initialBusinesses,
  admins: initialAdmins,
  subscriptions: initialSubscriptions = [],
  payments: initialPayments = [],
}: SuperAdminPanelProps) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [subscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [payments] = useState<Payment[]>(initialPayments);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const getSubscription = (businessId: string) => {
    return subscriptions.find((s) => s.business_id === businessId);
  };

  const getPaymentsForBusiness = (businessId: string) => {
    const sub = getSubscription(businessId);
    if (!sub) return [];
    return payments.filter((p) => p.subscription_id === sub.id).sort(
      (a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime()
    );
  };

  const totalRevenue = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Aktiv
          </span>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertCircle className="h-3 w-3" />
            Zahlung ausstandig
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" />
            Gekundigt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <XCircle className="h-3 w-3" />
            Kein Abo
          </span>
        );
    }
  };
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const router = useRouter();

  // Business form state
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [businessLogo, setBusinessLogo] = useState("");
  const [businessGoogleUrl, setBusinessGoogleUrl] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessFormspreeId, setBusinessFormspreeId] = useState("");

  // Admin form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminBusinessId, setAdminBusinessId] = useState("");

  const supabase = createClient();

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBusiness(true);

    try {
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          name: businessName,
          slug: businessSlug.toLowerCase().replace(/\s+/g, "-"),
          logo_url: businessLogo || null,
          google_review_url: businessGoogleUrl,
          address: businessAddress || null,
          formspree_id: businessFormspreeId || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBusinesses([...businesses, data]);
      setBusinessDialogOpen(false);
      resetBusinessForm();
    } catch (error) {
      console.error("Error creating business:", error);
      alert("Fehler beim Erstellen des Geschäfts");
    } finally {
      setIsCreatingBusiness(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      // Call API route to create admin (uses service role key server-side)
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          businessId: adminBusinessId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Fehler beim Erstellen des Admins");
      }

      setAdmins([...admins, { ...result.admin, email: adminEmail }]);
      setAdminDialogOpen(false);
      resetAdminForm();
      alert(`Admin erstellt! ${adminEmail} kann sich jetzt anmelden.`);
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(error instanceof Error ? error.message : "Fehler beim Erstellen des Admins");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie dieses Geschäft löschen möchten?")) return;

    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", businessId);

      if (error) throw error;

      setBusinesses(businesses.filter((b) => b.id !== businessId));
      setAdmins(admins.filter((a) => a.business_id !== businessId));
    } catch (error) {
      console.error("Error deleting business:", error);
      alert("Fehler beim Löschen des Geschäfts");
    }
  };

  const resetBusinessForm = () => {
    setBusinessName("");
    setBusinessSlug("");
    setBusinessLogo("");
    setBusinessGoogleUrl("");
    setBusinessAddress("");
    setBusinessFormspreeId("");
  };

  const resetAdminForm = () => {
    setAdminEmail("");
    setAdminPassword("");
    setAdminBusinessId("");
  };

  const getBusinessName = (businessId: string) => {
    return businesses.find((b) => b.id === businessId)?.name || "Unbekannt";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
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
                <span className="text-sm font-medium text-muted-foreground">Super Admin</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Geschäfte</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{businesses.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrierte Unternehmen
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrierte Administratoren
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Abos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subscriptions.filter((s) => s.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscriptions.filter((s) => s.status === "active").length * 50} EUR/Monat | Gesamt: {(totalRevenue / 100).toFixed(2)} EUR
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Geschäfte</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Kunden-Geschäfte
              </CardDescription>
            </div>
            <Dialog open={businessDialogOpen} onOpenChange={setBusinessDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-[4px]" style={{ backgroundColor: "#1A73E8" }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Geschäft
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Neues Geschäft erstellen</DialogTitle>
                  <DialogDescription>
                    Fügen Sie ein neues Restaurant oder Bar hinzu
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateBusiness} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Restaurant Kelmendi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL) *</Label>
                    <Input
                      id="slug"
                      value={businessSlug}
                      onChange={(e) => setBusinessSlug(e.target.value)}
                      placeholder="kelmendi"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL wird: /r/{businessSlug || "slug"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleUrl">Google Review URL *</Label>
                    <Input
                      id="googleUrl"
                      value={businessGoogleUrl}
                      onChange={(e) => setBusinessGoogleUrl(e.target.value)}
                      placeholder="https://g.page/r/..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={businessLogo}
                      onChange={(e) => setBusinessLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Musterstraße 123, 12345 Berlin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formspreeId">Formspree ID</Label>
                    <Input
                      id="formspreeId"
                      value={businessFormspreeId}
                      onChange={(e) => setBusinessFormspreeId(e.target.value)}
                      placeholder="xyzabcde"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreatingBusiness}
                    className="w-full rounded-[4px]"
                    style={{ backgroundColor: "#1A73E8" }}
                  >
                    {isCreatingBusiness ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird erstellt...
                      </>
                    ) : (
                      "Geschäft erstellen"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Abo-Status</TableHead>
                  <TableHead>Nächste Zahlung</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => {
                  const sub = getSubscription(business.id);
                  return (
                    <React.Fragment key={business.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedBusiness(selectedBusiness === business.id ? null : business.id)}
                      >
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>/r/{business.slug}</TableCell>
                        <TableCell>{getStatusBadge(sub?.status)}</TableCell>
                        <TableCell>
                          {sub?.current_period_end 
                            ? new Date(sub.current_period_end).toLocaleDateString("de-DE")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(business.created_at).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/r/${business.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBusiness(business.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {/* Expanded Payment History */}
                      {selectedBusiness === business.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Zahlungsverlauf - {business.name}
                              </h4>
                              {sub && (
                                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                                  <div className="p-2 bg-card rounded border">
                                    <span className="text-muted-foreground">Abo seit:</span>{" "}
                                    <span className="font-medium">{new Date(sub.created_at).toLocaleDateString("de-DE")}</span>
                                  </div>
                                  <div className="p-2 bg-card rounded border">
                                    <span className="text-muted-foreground">Periode:</span>{" "}
                                    <span className="font-medium">
                                      {new Date(sub.current_period_start).toLocaleDateString("de-DE")} - {new Date(sub.current_period_end).toLocaleDateString("de-DE")}
                                    </span>
                                  </div>
                                  <div className="p-2 bg-card rounded border">
                                    <span className="text-muted-foreground">Zahlungen:</span>{" "}
                                    <span className="font-medium">{getPaymentsForBusiness(business.id).length}</span>
                                  </div>
                                </div>
                              )}
                              {getPaymentsForBusiness(business.id).length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
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
                                      {getPaymentsForBusiness(business.id).map((payment) => (
                                        <TableRow key={payment.id}>
                                          <TableCell>
                                            {new Date(payment.paid_at || payment.created_at).toLocaleDateString("de-DE", {
                                              month: "long",
                                              year: "numeric",
                                            })}
                                          </TableCell>
                                          <TableCell>
                                            {new Date(payment.paid_at || payment.created_at).toLocaleDateString("de-DE")}
                                          </TableCell>
                                          <TableCell>{(payment.amount_cents / 100).toFixed(2)} {payment.currency.toUpperCase()}</TableCell>
                                          <TableCell>
                                            {payment.status === "succeeded" ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <CheckCircle className="h-3 w-3" />
                                                Bezahlt
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <XCircle className="h-3 w-3" />
                                                Fehlgeschlagen
                                              </span>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                                  Noch keine Zahlungen vorhanden
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
                {businesses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Noch keine Geschäfte vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Admins Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Administratoren</CardTitle>
              <CardDescription>
                Verwalten Sie die Zugänge Ihrer Kunden
              </CardDescription>
            </div>
            <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="rounded-[4px]"
                  style={{ backgroundColor: "#1A73E8" }}
                  disabled={businesses.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuen Admin erstellen</DialogTitle>
                  <DialogDescription>
                    Erstellen Sie einen Zugang für Ihren Kunden
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">E-Mail *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="kunde@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Passwort *</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Mindestens 6 Zeichen"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminBusiness">Geschäft *</Label>
                    <select
                      id="adminBusiness"
                      value={adminBusinessId}
                      onChange={(e) => setAdminBusinessId(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      required
                    >
                      <option value="">Geschäft auswählen...</option>
                      {businesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreatingAdmin}
                    className="w-full rounded-[4px]"
                    style={{ backgroundColor: "#1A73E8" }}
                  >
                    {isCreatingAdmin ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird erstellt...
                      </>
                    ) : (
                      "Admin erstellen"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Geschäft</TableHead>
                  <TableHead>Erstellt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.filter(a => !a.is_super_admin).map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.email || admin.user_id.slice(0, 8) + "..."}
                    </TableCell>
                    <TableCell>{getBusinessName(admin.business_id)}</TableCell>
                    <TableCell>
                      {new Date(admin.created_at).toLocaleDateString("de-DE")}
                    </TableCell>
                  </TableRow>
                ))}
                {admins.filter(a => !a.is_super_admin).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Noch keine Admins vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
