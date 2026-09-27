import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Analytics } from "@vercel/analytics/react"
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/sonner"
import Navbar from './navbar/navbar';
import { SpeedInsights } from "@vercel/speed-insights/next"
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Best Preschool And Day care - Nurturing Young Minds with Love and Care',
  description: 'A loving and safe environment for children to explore, learn, and grow. We provide a holistic approach to early childhood education.',
  
  // 1. FIX: Proper OpenGraph structure
  openGraph: {
    title: 'Best Preschool And Day care - Nurturing Young Minds with Love and Care',
    description: 'A loving and safe environment for children to explore, learn, and grow.',
    url: './',
    siteName: 'Best Preschool and day care',
    images: [
      {
        // 2. FIX: Use a string path from the public folder, not the imported object
        url: 'public/logonew.png', 
        width: 1200,
        height: 630,
        alt: 'Best Preschool and daycare Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // 3. FIX: Added Twitter card metadata for X/Twitter visibility
  twitter: {
    card: 'summary_large_image',
    title: 'Best Preschool',
    description: 'Nurturing Young Minds with Love and Care',
    images: ['public/logonew.png'], 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <Navbar/>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <main>
              <Analytics/>
              <SpeedInsights/>
              {children}
            </main>
          </ThemeProvider>
          <Toaster />
          <Footer />
      </body>
    </html>
  )
}