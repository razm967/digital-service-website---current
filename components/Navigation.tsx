'use client'

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'About' },
    ...(isAuthenticated ? [{ href: '/orders', label: 'My Orders' }] : []),
    { href: '/contact', label: 'Contact Us', isButton: true }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="glass-effect px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold gradient-text">
            Flowframe
          </Link>
          
          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={item.isButton 
                    ? "px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button - Updated positioning */}
          <button 
            className="md:hidden text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation()
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Menu - Updated positioning and styling */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                ref={menuRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-[60px] right-0 h-[calc(100vh-60px)] w-64 bg-white dark:bg-gray-900 md:hidden shadow-xl overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 60px)' }}
              >
                <div className="flex flex-col h-full py-4">
                  <div className="flex-1 overflow-y-auto">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className={`block py-3 px-6 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 ${
                            item.isButton ? 'border-none mt-4 mx-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center' : ''
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

