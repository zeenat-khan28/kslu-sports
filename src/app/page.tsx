import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import HeroCarousel from '@/components/HeroCarousel'
import { Calendar, HelpCircle, LogIn, ShieldCheck } from 'lucide-react'

// This function reads the gallery folder dynamically on the server
async function getGalleryImages() {
  try {
    const galleryPath = path.join(process.cwd(), 'public', 'gallery')
    if (!fs.existsSync(galleryPath)) return []
    
    const files = fs.readdirSync(galleryPath)
    // Filter out the README and hidden files, only return valid image formats
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']
    const images = files
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/gallery/${file}`)
      
    return images
  } catch (error) {
    console.error("Error reading gallery folder:", error)
    return []
  }
}

export default async function Home() {
  const images = await getGalleryImages()

  return (
    <div className="w-full">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <HeroCarousel images={images} />
        
        {/* Floating Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="bg-[var(--color-surface)]/90 p-8 rounded-lg shadow-xl border-t-4 border-[var(--color-kslu-maroon)] text-center max-w-2xl mx-4 pointer-events-auto">
            <h2 className="text-3xl font-bold text-[var(--color-kslu-maroon)] mb-4">Intercollegiate Sports 2025-26</h2>
            <p className="text-[var(--color-text)] mb-6 font-medium">Welcome to the official portal for managing KSLU sports participation, venues, and eligibility.</p>
            <Link 
              href="/login" 
              className="inline-block bg-[var(--color-kslu-green)] hover:bg-[#164229] text-white font-bold py-3 px-8 rounded transition-colors shadow-md"
            >
              College Login to Participate
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        
        {/* Quick Links Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/venues" className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] hover:border-[var(--color-kslu-saffron)] hover:shadow-md transition-all flex flex-col items-center text-center group no-underline">
            <div className="w-12 h-12 bg-[var(--color-kslu-maroon)]/10 text-[var(--color-kslu-maroon)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-kslu-maroon)]">View Venues & Dates</h3>
            <p className="text-sm text-[var(--color-muted)]">Check the confirmed schedule for all events.</p>
          </Link>
          
          <Link href="/login" className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] hover:border-[var(--color-kslu-saffron)] hover:shadow-md transition-all flex flex-col items-center text-center group no-underline">
            <div className="w-12 h-12 bg-[var(--color-kslu-green)]/10 text-[var(--color-kslu-green)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-kslu-green)]">College Login</h3>
            <p className="text-sm text-[var(--color-muted)]">Submit initial & detailed confirmations.</p>
          </Link>

          <Link href="/admin/login" className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] hover:border-[var(--color-kslu-saffron)] hover:shadow-md transition-all flex flex-col items-center text-center group no-underline">
            <div className="w-12 h-12 bg-[var(--color-kslu-saffron)]/10 text-[var(--color-kslu-saffron)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-kslu-saffron)]">Admin Login</h3>
            <p className="text-sm text-[var(--color-muted)]">Manage the portal (Staff only).</p>
          </Link>

          <Link href="/help" className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] hover:border-[var(--color-kslu-saffron)] hover:shadow-md transition-all flex flex-col items-center text-center group no-underline">
            <div className="w-12 h-12 bg-[var(--color-muted)]/10 text-[var(--color-muted)] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[var(--color-text)] mb-2">Help & Guides</h3>
            <p className="text-sm text-[var(--color-muted)]">Read the instructions on how to participate.</p>
          </Link>
        </section>

        {/* How to Participate Strip */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-[var(--color-text)] mb-8 text-center border-b border-[var(--color-border)] pb-4">
            How to Participate in 3 Simple Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-[var(--color-kslu-maroon)] text-white font-bold rounded-full flex items-center justify-center border-4 border-[var(--color-surface)] z-10">1</div>
              <div className="bg-[var(--color-background)] p-6 rounded border border-[var(--color-border)] h-full pt-8">
                <h4 className="font-bold text-lg mb-2 text-[var(--color-kslu-maroon)]">Activate Account</h4>
                <p className="text-sm text-[var(--color-muted)]">Colleges must enter their registered email on the login page to receive a secure activation link and set a password.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-[var(--color-kslu-maroon)] text-white font-bold rounded-full flex items-center justify-center border-4 border-[var(--color-surface)] z-10">2</div>
              <div className="bg-[var(--color-background)] p-6 rounded border border-[var(--color-border)] h-full pt-8">
                <h4 className="font-bold text-lg mb-2 text-[var(--color-kslu-maroon)]">Initial Confirmation</h4>
                <p className="text-sm text-[var(--color-muted)]">When the portal opens, log in and quickly select YES or NO for every sports event to confirm your intent to participate.</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 -top-4 w-10 h-10 bg-[var(--color-kslu-maroon)] text-white font-bold rounded-full flex items-center justify-center border-4 border-[var(--color-surface)] z-10">3</div>
              <div className="bg-[var(--color-background)] p-6 rounded border border-[var(--color-border)] h-full pt-8">
                <h4 className="font-bold text-lg mb-2 text-[var(--color-kslu-maroon)]">Detailed Eligibility Form</h4>
                <p className="text-sm text-[var(--color-muted)]">Before the tournament date, fill out the player details (Eligibility Proforma) for the events you selected and submit it online.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
