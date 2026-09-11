import { Fraunces, Source_Sans_3, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ['400', '500', '600'],
  style: ['normal'],
})

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ['400', '500', '600'],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ['400', '500', '600'],
})

export const metadata = {
  title: {
    default: 'MedVoice — check your bill against the real benchmark',
    template: '%s | MedVoice',
  },
  description: "Enter a CPT code and the amount you were billed. See the public Medicare benchmark rate, cited from CMS data, in seconds.",
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${sourceSans.variable} ${plexMono.variable}`} >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1D1A",
              color: "#FAFAF7",
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.875rem",
              borderRadius: "2px",
            }
          }}
        />
      </body>
    </html>
  )
}