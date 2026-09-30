'use client'

import { useEffect } from 'react'

export default function PrintTrigger() {
  useEffect(() => {
    // A small delay to ensure styles and images have loaded
    const timeout = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timeout)
  }, [])

  return null
}
