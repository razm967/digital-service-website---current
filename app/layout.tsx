import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { headers } from 'next/headers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Flowframe",
  description: "Providing cutting-edge digital solutions for your business",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-invoke-path') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <html lang="en">
        <body className={`${inter.className} bg-white`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-full`}>
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{ animationDelay: "4s" }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 flex items-center">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}