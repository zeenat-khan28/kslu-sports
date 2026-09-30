import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KSLU Intercollegiate Sports Portal',
  description: 'Official sports portal for Karnataka State Law University',
}

import { createClient } from '@/lib/supabase/server'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let navLabel = ''
  let navLink = '/login'
  let isAdmin = false
  
  if (user) {
     const { data: admin } = await supabase.from('admins').select('id').eq('auth_user_id', user.id).single()
     if (admin) {
        isAdmin = true
        navLink = '/admin/dashboard'
        navLabel = 'Admin Dashboard'
     } else {
        const { data: collegeEmail } = await supabase.from('college_emails').select('colleges(name)').eq('auth_user_id', user.id).single()
        navLabel = (collegeEmail?.colleges as any)?.name || 'College Dashboard'
        navLink = '/college/dashboard'
     }
  }
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[var(--color-background)]`}>
        
        {/* Top Utility Bar */}
        <div className="bg-[var(--color-text)] text-white py-1 px-4 text-xs flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors">A-</button>
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors">A</button>
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors">A+</button>
            <span className="text-[var(--color-muted)]">|</span>
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors">High Contrast</button>
          </div>
          <div className="flex space-x-4">
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors font-bold">English</button>
            <span className="text-[var(--color-muted)]">|</span>
            <button className="hover:text-[var(--color-kslu-saffron)] transition-colors">ಕನ್ನಡ</button>
          </div>
        </div>

        {/* Main Header */}
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-4 px-4 sm:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-kslu-maroon)]">
                {/* Logo Placeholder */}
                <img src="/branding/kslu-logo.png" alt="KSLU Logo" className="w-full h-full object-contain" />
                <span className="text-[10px] text-gray-400 absolute">LOGO</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-kslu-maroon)] uppercase tracking-wide">
                  Karnataka State Law University
                </h1>
                <p className="text-sm sm:text-base font-semibold text-[var(--color-text)]">
                  Sports Section
                </p>
                <p className="text-xs text-[var(--color-kslu-green)] font-medium mt-0.5">
                  Accredited &apos;A&apos; Grade by NAAC
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                 <img src="/branding/sports-emblem.png" alt="Sports Emblem" className="w-full h-full object-contain" />
                 <span className="text-[10px] text-gray-400 absolute">EMBLEM</span>
              </div>
            </div>
          </div>
        </header>

        {/* Primary Navigation */}
        <nav className="bg-[var(--color-kslu-maroon)] text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <ul className="flex flex-wrap items-center space-x-1 sm:space-x-8 text-sm sm:text-base font-medium">
              <li>
                <Link href="/" className="inline-block py-3 px-2 hover:text-[var(--color-kslu-saffron)] transition-colors border-b-2 border-transparent hover:border-[var(--color-kslu-saffron)] no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/venues" className="inline-block py-3 px-2 hover:text-[var(--color-kslu-saffron)] transition-colors border-b-2 border-transparent hover:border-[var(--color-kslu-saffron)] no-underline">
                  Venues & Dates
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="inline-block py-3 px-2 hover:text-[var(--color-kslu-saffron)] transition-colors border-b-2 border-transparent hover:border-[var(--color-kslu-saffron)] no-underline">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/help" className="inline-block py-3 px-2 hover:text-[var(--color-kslu-saffron)] transition-colors border-b-2 border-transparent hover:border-[var(--color-kslu-saffron)] no-underline">
                  Help
                </Link>
              </li>
              <li className="ml-auto !ml-auto flex space-x-4">
                {user ? (
                  <Link href={navLink} className="inline-block py-1.5 px-4 mt-1 bg-white/10 hover:bg-white/20 rounded font-bold transition-colors no-underline flex flex-col items-start leading-tight max-w-[250px] truncate" title={navLabel}>
                    {!isAdmin && <span className="text-[10px] text-[var(--color-kslu-saffron)] font-bold uppercase tracking-wider">Welcome</span>}
                    <span className="truncate w-full">{navLabel}</span>
                  </Link>
                ) : (
                  <Link href="/login" className="inline-block py-2 px-4 mt-1 bg-white/10 hover:bg-white/20 rounded font-bold transition-colors no-underline">
                    College Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[var(--color-text)] text-white pt-12 pb-6 mt-12 border-t-4 border-[var(--color-kslu-saffron)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-kslu-saffron)] mb-4">Contact Us</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Karnataka State Law University<br />
                Sports Section<br />
                Navanagar, Hubballi-580025<br />
                Karnataka, India
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-kslu-saffron)] mb-4">Support</h3>
              <p className="text-sm text-gray-300 leading-relaxed flex flex-col space-y-2">
                <span><strong className="text-white">Phone:</strong> 0836-2220024</span>
                <span><strong className="text-white">Email:</strong> <a href="mailto:kslu.physicaldirector@gmail.com" className="text-gray-300 hover:text-white underline decoration-[var(--color-kslu-saffron)]">kslu.physicaldirector@gmail.com</a></span>
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-kslu-saffron)] mb-4">Quick Links</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li><Link href="/admin/login" className="hover:text-white transition-colors no-underline">Admin Login</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors no-underline">Help & FAQs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors no-underline">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors no-underline">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Karnataka State Law University, Hubballi. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
