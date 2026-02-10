"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Star,
  TrendingUp,
  Check,
  ArrowRight,
  Phone,
  Loader2,
  Play,
  Sparkles,
  Zap,
  BarChart3,
  Menu,
  X,
  Mail,
  ChevronDown,
} from "lucide-react";

// Particle component for background effect
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000, decimals: number = 0) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  
  return decimals > 0 ? count.toFixed(decimals) : Math.round(count);
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", business: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const protectedCount = useCounter(847, 2500);
  const googleCount = useCounter(2341, 2500);
  const ratingImprove = useCounter(4.7, 2500, 1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setContactForm({ name: "", phone: "", business: "" });
  };

  const testimonials = [
    { quote: "Unsere Google-Bewertung ist von 3.8 auf 4.7 gestiegen. Der ROI ist unglaublich!", author: "Michael Schneider", role: "Brauhaus Munchen" },
    { quote: "Endlich haben wir Kontrolle uber unsere Online-Reputation. Absolut empfehlenswert.", author: "Sarah Weber", role: "Cafe Sonnenschein" },
    { quote: "Die negativen Bewertungen werden jetzt intern behandelt. Genial einfach!", author: "Thomas Muller", role: "Goldener Hirsch" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Image src="/logo-white.png" alt="BewertungenBoost" width={160} height={40} className="h-7 w-auto" />
            
            <div className="hidden md:flex items-center gap-8">
              {["Features", "Produkte", "Preise", "Kontakt"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/60 hover:text-white transition-colors duration-300">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/admin/login">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-medium">
                  Jetzt starten
                </Button>
              </Link>
            </div>

            <button type="button" className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0B] border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {["Features", "Produkte", "Preise", "Kontakt"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-white/60" onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <Link href="/admin/login" className="block py-2 text-white/60">Login</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Dynamic gradient that follows mouse */}
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)`,
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Particles */}
        <Particles />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm text-white/70">500+ Geschafte vertrauen uns</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="block text-white">Schutzen Sie Ihre</span>
              <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Online-Reputation
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-4 leading-relaxed">
              Negative Bewertungen abfangen. Positive zu Google lenken.
            </p>
            
            <p className="text-white/30 mb-10 flex items-center justify-center gap-2">
              <span className="text-2xl">Fur weniger als 1 Macchiato pro Tag</span>
              <span className="text-2xl">☕</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-14 text-base w-full sm:w-auto group font-medium">
                  Jetzt starten - 50 EUR/Monat
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://www.bewertungenboost.de/r/kelmendi" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base bg-transparent border-white/20 text-white hover:bg-white/5 w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Live Demo
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{protectedCount}+</div>
                <div className="text-sm text-white/40">Bewertungen geschutzt</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{googleCount}+</div>
                <div className="text-sm text-white/40">Google Bewertungen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">+{ratingImprove}</div>
                <div className="text-sm text-white/40">Rating Verbesserung</div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="animate-bounce">
              <ChevronDown className="h-6 w-6 text-white/30 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-3xl" />
            
            {/* Browser window */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111113]">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1C] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-[#0A0A0B] rounded-lg px-4 py-1.5 text-xs text-white/40">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    bewertungenboost.de/admin
                  </div>
                </div>
              </div>
              <Image
                src="/products/dashboard.png"
                alt="BewertungenBoost Dashboard"
                width={1200}
                height={800}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              So funktioniert es
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Drei einfache Schritte zu einer besseren Online-Reputation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 - Emerald */}
            <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="relative">
                <div className="text-sm font-medium text-white/40 mb-2">Schritt 1</div>
                <h3 className="text-xl font-semibold text-white mb-3">NFC-Stand aufstellen</h3>
                <p className="text-white/50">Platzieren Sie unseren eleganten NFC-Stand an Ihrer Theke.</p>
              </div>
            </div>

            {/* Step 2 - Cyan */}
            <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-7 w-7 text-cyan-400" />
              </div>
              <div className="relative">
                <div className="text-sm font-medium text-white/40 mb-2">Schritt 2</div>
                <h3 className="text-xl font-semibold text-white mb-3">Kunde bewertet</h3>
                <p className="text-white/50">Der Kunde gibt seine Bewertung ab. Schnell und ohne App.</p>
              </div>
            </div>

            {/* Step 3 - Violet */}
            <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-7 w-7 text-violet-400" />
              </div>
              <div className="relative">
                <div className="text-sm font-medium text-white/40 mb-2">Schritt 3</div>
                <h3 className="text-xl font-semibold text-white mb-3">Intelligente Weiterleitung</h3>
                <p className="text-white/50">4-5 Sterne gehen zu Google. 1-3 Sterne bleiben privat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produkte" className="py-24 px-4 sm:px-6 relative bg-[#111113]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Was Sie erhalten
            </h2>
            <p className="text-lg text-white/50">
              Alles was Sie brauchen fur nur 50 EUR/Monat
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: "/products/nfc-stand.jpg", title: "1x NFC-Stand", desc: "Premium Acryl-Stand fur Ihre Theke" },
              { img: "/products/acrylic-sticker.jpg", title: "3x Acryl-Sticker", desc: "Fur Tische, Fenster oder Turen" },
              { img: "/products/google-sticker.jpg", title: "10x Google Sticker", desc: "Wasserfeste Aufkleber" },
              { img: "/products/dashboard.png", title: "Dashboard-Zugang", desc: "Alle Statistiken im Blick" },
            ].map((product, i) => (
              <div 
                key={i} 
                className="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={product.img || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-white mb-1">{product.title}</h3>
                  <p className="text-sm text-white/50">{product.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Was unsere Kunden sagen
            </h2>
          </div>

          <div className="relative h-64">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ${
                  i === activeTestimonial ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-2xl sm:text-3xl font-medium text-white mb-8 max-w-2xl leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-white/50">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? "bg-white w-8" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preise" className="py-24 px-4 sm:px-6 relative bg-[#111113]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Einfache Preisgestaltung
            </h2>
            <p className="text-lg text-white/50">
              Keine versteckten Kosten. Keine Einrichtungsgebuhren.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
            
            <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0B] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              
              <div className="p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
                      Komplettpaket
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl sm:text-6xl font-bold text-white">50€</span>
                      <span className="text-white/50">/Monat</span>
                    </div>
                    <p className="text-white/50">Weniger als 1 Macchiato pro Tag</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      "1x Premium NFC-Stand",
                      "3x Acryl-Sticker",
                      "10x Wasserfeste Google Sticker",
                      "Unbegrenzter Dashboard-Zugang",
                      "E-Mail Support",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-emerald-400" />
                        </div>
                        <span className="text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-white/5">
                  <Link href="/signup">
                    <Button size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 rounded-full h-14 text-base font-medium">
                      Jetzt Abo starten
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Bereit, Ihre Reputation zu schutzen?
              </h2>
              <p className="text-lg text-white/50 mb-10">
                Wir rufen Sie kostenlos zuruck und beraten Sie unverbindlich.
              </p>

              <div className="space-y-6">
                <a href="tel:+491623926123" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-lg">+49 162 3926123</span>
                </a>
                <a href="mailto:info@bewertungenboost.de" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-lg">info@bewertungenboost.de</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
              
              <div className="relative rounded-2xl border border-white/10 bg-[#111113] p-8">
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Vielen Dank!</h3>
                    <p className="text-white/50">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold text-white">Ruckruf anfordern</h3>
                      <p className="text-sm text-white/50 mt-1">Kostenlos und unverbindlich</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white/70">Ihr Name</Label>
                      <Input
                        id="name"
                        placeholder="Max Mustermann"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/70">Telefonnummer</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+49 123 456789"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        required
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business" className="text-white/70">Name Ihres Geschafts</Label>
                      <Input
                        id="business"
                        placeholder="Restaurant Musterhaus"
                        value={contactForm.business}
                        onChange={(e) => setContactForm({ ...contactForm, business: e.target.value })}
                        required
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-white text-black hover:bg-white/90 rounded-full h-14 font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          Ruckruf anfordern
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Image src="/logo-white.png" alt="BewertungenBoost" width={140} height={32} className="h-6 w-auto opacity-50" />
            
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white/60 transition-colors">Impressum</a>
              <a href="#" className="hover:text-white/60 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white/60 transition-colors">AGB</a>
              <Link href="/admin/login" className="hover:text-white/60 transition-colors">Admin</Link>
            </div>

            <p className="text-sm text-white/30">2026 BewertungenBoost</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
