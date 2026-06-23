import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

export const metadata: Metadata = {
  title: "ZK Access Passport",
  description: "Private compliance proofs for Stellar payments and tokenized assets",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
