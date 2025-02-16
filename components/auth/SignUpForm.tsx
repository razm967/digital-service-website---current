'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormMessage(localStorage.getItem('selectedService')
        ? 'Enter your email to create an account and complete your order.'
        : 'Enter your email to receive a magic link for instant access to your orders.')
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const baseUrl = isLocalhost 
      ? 'http://localhost:3000'
      : 'https://digital-service-website-current.vercel.app'

    try {
      // Check if there's a stored service selection
      const storedService = localStorage.getItem('selectedService')
      let redirectPath = '/orders' // Default redirect for regular sign-ins

      // If there's a stored service, we'll redirect to payment after auth
      if (storedService) {
        const { planName, price } = JSON.parse(storedService)
        redirectPath = `/payment?plan=${planName}&price=${price}`
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}${redirectPath}`,
        },
      })

      if (error) {
        console.error('Sign up error:', error)
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: storedService 
            ? 'Check your email for the magic link to complete your service order!'
            : 'Check your email for the magic link to access your orders!'
        })
        setEmail('')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sign Up / Sign In</h2>
      <p className="text-gray-600 mb-6">
        {formMessage || 'Enter your email to receive a magic link for instant access to your orders.'}
      </p>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
} 