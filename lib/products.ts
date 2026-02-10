export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  interval: "month" | "year";
  features: string[];
}

// BewertungenBoost subscription product
// When you have your real Stripe Price ID, replace the id below
export const SUBSCRIPTION_PRODUCT: Product = {
  id: "price_bewertungenboost_monthly", // Replace with your real Stripe Price ID (e.g., price_1ABC123...)
  name: "BewertungenBoost Monatlich",
  description: "Schutzen Sie Ihre Online-Reputation",
  priceInCents: 5000, // 50 EUR
  interval: "month",
  features: [
    "1x Premium NFC-Stand",
    "3x Acryl-Sticker",
    "10x Google Sticker (wasserfest)",
    "Dashboard-Zugang",
    "Unbegrenzte Bewertungen",
    "E-Mail Support",
  ],
};

export const PRODUCTS: Product[] = [SUBSCRIPTION_PRODUCT];
