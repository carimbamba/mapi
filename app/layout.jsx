import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SkipLink } from "@/components/ui/SkipLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mapi.app"
  ),
  title: {
    default:
      "MAPI — Mapa Interativo de Sala de Aula | Gestão de Turmas Inclusivas",
    template: "%s | MAPI",
  },
  description:
    "Organize sua sala com mapa interativo e drag & drop. Perfis de acessibilidade para TEA, TDAH, dislexia e mais. Plano grátis para começar.",
  keywords: [
    "mapa de sala de aula online",
    "organizar sala de aula digital",
    "gestão de turmas inclusivas",
    "ferramenta para professores com alunos TEA TDAH",
    "inclusão escolar",
    "educação especial",
    "TEA",
    "TDAH",
    "neurodivergência",
    "EdTech Brasil",
    "mapa de assentos",
    "posicionamento de alunos",
  ],
  authors: [{ name: "MAPI Team", url: "https://mapi.app" }],
  creator: "MAPI",
  publisher: "MAPI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://mapi.app",
    title:
      "MAPI — Mapa Interativo de Sala de Aula | Gestão de Turmas Inclusivas",
    description:
      "Organize sua sala de aula de forma inclusiva. Mapa interativo com drag & drop, geração automática por IA e perfis de neurodivergência.",
    siteName: "MAPI",
    images: [
      {
        url: "https://mapi.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "MAPI — Mapa Interativo de Sala de Aula",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MAPI — Mapa Interativo de Sala de Aula",
    description:
      "Organize sua sala de aula de forma inclusiva. Gratuito para começar.",
    images: ["https://mapi.app/og-image.png"],
    creator: "@mapiapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "google-verification-code",
  },
  alternates: {
    canonical: "https://mapi.app",
  },
};

/**
 * JSON-LD Schema.org para SoftwareApplication
 */
export function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

/**
 * Root layout do aplicativo
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "MAPI — Mapa Interativo de Sala de Aula",
              description:
                "Plataforma SaaS de gestão visual de salas de aula com foco em inclusão e neurodivergência. Organize turmas, crie mapas interativos e apoie alunos neurodivergentes com base em evidências.",
              url: "https://mapi.app",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "BRL",
                description: "Plano Gratuito disponível",
              },
              author: {
                "@type": "Organization",
                name: "MAPI Team",
                url: "https://mapi.app",
              },
              knowsAbout: [
                "Educação Inclusiva",
                "Neurodivergência",
                "TEA",
                "TDAH",
                "Gestão de Sala de Aula",
              ],
              audience: {
                "@type": "EducationalAudience",
                educationalRole: "teacher",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
