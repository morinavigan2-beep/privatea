import React from "react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Reputation Builder",
  description: "Verwalten Sie Ihre Bewertungen und Statistiken",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
