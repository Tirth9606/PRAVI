import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/locales";
import { I18nProvider } from "@/components/i18n/i18n-provider";

export const metadata: Metadata = {
  title: {
    default: "ROADGOV — Government Road Lifecycle Management",
    template: "%s · ROADGOV",
  },
  description:
    "Government operations platform for managing the complete lifecycle of road projects — from proposal to maintenance.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={dict.meta.dir} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
