import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

// next/font self-hosts these at build time — no external request to Google's
// font CDN at all, which is faster and better for Core Web Vitals than a
// <link> tag or a CSS @import.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://thebirthwave.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The BirthWave — Gynaecology, Fertility & Prenatal Care in Nungambakkam, Chennai",
    template: "%s | The BirthWave",
  },
  description:
    "Led by Dr. Santhoshi, The BirthWave is a women's health clinic in Nungambakkam, Chennai offering gynaecology, obstetrics, fertility treatment, prenatal & postnatal care, pediatrics, pelvic floor therapy, and mental wellness — all under one roof.",
  keywords: [
    "gynaecologist Chennai",
    "obstetrician Nungambakkam",
    "fertility clinic Chennai",
    "prenatal care Chennai",
    "Dr Santhoshi",
    "pediatrician Nungambakkam",
    "pelvic floor therapy Chennai",
    "birth doula Chennai",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "The BirthWave",
    title: "The BirthWave — Gynaecology, Fertility & Prenatal Care in Nungambakkam, Chennai",
    description:
      "Led by Dr. Santhoshi, The BirthWave offers gynaecology, fertility, prenatal, and pediatric care in Nungambakkam, Chennai.",
    images: [{ url: "/images/logo.png", width: 781, height: 418, alt: "The BirthWave" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The BirthWave — Women's Health Clinic, Chennai",
    description: "Gynaecology, fertility, prenatal & pediatric care led by Dr. Santhoshi in Nungambakkam, Chennai.",
    images: ["/images/logo.png"],
  },
};

// Structured data (JSON-LD) for local/medical search — this is what lets
// Google show address, hours, and phone directly in search results and the
// local map pack, instead of just a blue link.
const clinicJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "The BirthWave",
  image: `${siteUrl}/images/logo.png`,
  url: siteUrl,
  telephone: "+91-93630-31925",
  email: "drsantoshi@thebirthwave.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No 8/15, Mahalingapuram Main Road",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600034",
    addressCountry: "IN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    ],
    opens: "07:30",
    closes: "21:00",
  },
  medicalSpecialty: [
    "Gynecologic",
    "Obstetric",
    "Fertility",
    "Pediatric",
  ],
  priceRange: "$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
