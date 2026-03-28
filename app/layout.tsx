import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flowly — Your Personalized Feed',
  description: 'A personalized news and content feed tailored to your interests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#080808] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
