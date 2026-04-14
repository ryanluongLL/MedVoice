import { DM_Sans, Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from 'react-hot-toast'

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['400', '500', '600'],
})

export const metadata = {
  title: {
    default: 'MedVoice - Understand Your Medical Bill',
    template: '%s | MedVoice',
  },
  description: "Understand your medical bill instantly with AI",
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${dmSans.variable} ${inter.variable}`}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0a2342',
                color: '#ffffff',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.875rem',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#02C39A',
                  secondary: '#0a2342',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}