'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    console.log('Login attempt with:', credentials.email)
    
    if (
      credentials.email === 'razmachlof@gmail.com' && 
      credentials.password === 'Adminrazvdcr1235!'
    ) {
      console.log('Login successful')
      localStorage.setItem('isAdmin', 'true')
      Cookies.set('isAdmin', 'true', { path: '/' })
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 100)
    } else {
      console.log('Login failed')
      setError('Invalid credentials')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg mx-4">
        <div className="mb-8">
          <h1 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Admin Portal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to access the dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-base"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
} 