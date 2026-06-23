import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "ZK Access Passport",
  description: "Zero-knowledge compliance passport for remittance and RWA investment",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <nav className="nav">
          <h1 className="nav-title">ZK Access Passport</h1>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/remit">Remit Demo</Link>
            <Link href="/rwa">RWA Demo</Link>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
