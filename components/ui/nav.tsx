import { useState } from 'react'
import Link from 'next/link'  // Changed from react-router-dom to next/link
import { X, Menu } from 'lucide-react'

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        // ... existing desktop nav code ...
      </nav>

      {/* Mobile Navigation Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Navigation Menu */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-background shadow-lg transform transition-transform duration-200 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col pt-16 px-4 gap-4">
          <Link 
            href="/"
            className="py-2 px-4 hover:bg-accent rounded-md transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/faq"
            className="py-2 px-4 hover:bg-accent rounded-md transition-colors"
            onClick={() => setIsOpen(false)}
          >
            FAQ
          </Link>
          {/* ... other links ... */}
        </nav>
      </div>

      {/* Backdrop for mobile menu */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 