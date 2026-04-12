import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'MedVoice - Understand Your Medical Bill',
    template: '%s | MedVoice',
  },

  description: "Understand your medical bill instantly with AI",
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0a2342',
                color: '#fff',
                fontFamily: 'sans-serif',
                fontSize: '0.875rem',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#02c39a',
                  secondary: '#0a2342',
                }
              }
            }}
          />
        </body>
        </html>
      </ClerkProvider>
  );
}
