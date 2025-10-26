import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PortfolioProvider } from "@/lib/portfolio-context";
import Script from "next/script";
import "./globals.css";
import { 
  getPersonalInfoServer, 
  getContactInfoServer, 
  getProfessionalInfoServer, 
  getRepositoryInfoServer, 
  getSkillsServer, 
  getOpportunitiesServer,
  getProjectsServer, 
  getResumeInfoServer, 
  getAssetsServer, 
  getSiteInfoServer,
  getAIPersonalityServer,
  getEnvironmentConfig 
} from "@/lib/config";

// Load Inter font for non-Apple devices
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// Generate metadata from config
function generateMetadata(): Metadata {
  const personal = getPersonalInfoServer();
  const site = getSiteInfoServer();
  const assets = getAssetsServer();
  const env = getEnvironmentConfig();

  return {
    title: site.title,
    description: site.description,
    keywords: [
      personal.name,
      "Portfolio", 
      "Developer", 
      "AI", 
      "Interactive", 
      personal.title,
      "Web Development",
      "Full Stack",
      "Next.js",
      "React"
    ],
    authors: [
      {
        name: personal.name,
        url: env.siteUrl,
      },
    ],
    creator: personal.name,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: env.siteUrl,
      title: site.title,
      description: site.description,
      siteName: site.name,
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      creator: `@${personal.nickname}`,
    },
    icons: {
      icon: [
        {
          url: assets.logo,
          sizes: "any",
        }
      ],
      shortcut: `${assets.logo}?v=2`,
      apple: "/apple-touch-icon.svg?v=2",
    },
  };
}

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load config on server side
  const portfolioConfig = {
    personal: getPersonalInfoServer(),
    contact: getContactInfoServer(),
    professional: getProfessionalInfoServer(),
    repository: getRepositoryInfoServer(),
    skills: getSkillsServer(),
    opportunities: getOpportunitiesServer(),
    projects: getProjectsServer(),
    resume: getResumeInfoServer(),
    assets: getAssetsServer(),
    site: getSiteInfoServer(),
    aiPersonality: getAIPersonalityServer(),
  };

  const env = getEnvironmentConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href={portfolioConfig.assets.logo} sizes="any" />
        {/* Google Analytics */}
        {env.googleAnalyticsId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${env.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window['dataLayer'] = window['dataLayer'] || [];
                  function gtag(){window['dataLayer'].push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${env.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={cn(
          "min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans antialiased transition-colors duration-500 ease-in-out",
          inter.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <PortfolioProvider config={portfolioConfig}>
            <main className="flex min-h-screen flex-col">
              {children}
            </main>
            <Toaster />
          </PortfolioProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}