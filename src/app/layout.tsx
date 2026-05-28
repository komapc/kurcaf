import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kurcaf — Learn Latvian',
  description: 'Personal Latvian language learning app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
