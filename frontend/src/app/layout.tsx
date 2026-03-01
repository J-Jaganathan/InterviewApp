import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterviewPrep - AI Mock Interview Platform',
  description: 'Prepare for your next job interview with AI-powered mock interviews',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}