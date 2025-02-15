'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Order } from '@/types/database'
import SignUpForm from "./auth/SignUpForm"

type OrderStatus = 'all' | 'pending' | 'in_progress' | 'completed'

export default function Homepage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all')
  const supabase = createClientComponentClient()

  const fetchOrders = async (email: string, status?: OrderStatus) => {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(3)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return
    }

    setOrders(data || [])
  }

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user?.email) {
          await fetchOrders(user.email, selectedStatus)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndOrders()

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user?.email) {
        fetchOrders(session.user.email, selectedStatus)
      } else {
        setOrders([])
      }
    })

    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase, selectedStatus])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFilterButtonColor = (status: OrderStatus) => {
    if (status === selectedStatus) {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 ring-yellow-600'
        case 'in_progress':
          return 'bg-blue-100 text-blue-800 ring-blue-600'
        case 'completed':
          return 'bg-green-100 text-green-800 ring-green-600'
        default:
          return 'bg-gray-100 text-gray-800 ring-gray-600'
      }
    }
    return 'bg-white text-gray-600 hover:bg-gray-50'
  }

  return (
    <div className="container mx-auto mt-20">
      {/* Hero Section */}
      <div className="text-center max-w-5xl mx-auto px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 gradient-text animate-float">
          Design that drives results.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Transform your digital presence with pixel-perfect UI designs. 
          We blend creativity with user-centric design principles to create interfaces that 
          captivate and convert.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/services"
            className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Explore Our Services
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl border border-blue-100"
          >
            Get in Touch
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="glass-effect interactive rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">UI Design</h3>
            <p className="text-gray-600 dark:text-gray-300">Stunning, intuitive interfaces that elevate user experience</p>
          </div>

          <div className="glass-effect interactive rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Prototyping</h3>
            <p className="text-gray-600 dark:text-gray-300">prototypes that bring your vision to life</p>
          </div>

          <div className="glass-effect interactive rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Design Systems</h3>
            <p className="text-gray-600 dark:text-gray-300">Scalable and consistent design frameworks for your brand</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="w-full max-w-6xl mx-auto mb-32">
          <div className="glass-effect rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-left">
              {user ? 'Your Recent Orders' : 'Track Your Orders'}
            </h2>
            
            {!user ? (
              <SignUpForm />
            ) : (
              <>
                {/* Status Filter Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ring-1 ring-inset transition-colors
                        ${getFilterButtonColor(status)}`}
                    >
                      {status === 'all' ? 'All Orders' : 
                        status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')
                      }
                    </button>
                  ))}
                </div>

                {loading ? (
                  <p className="text-gray-600">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="py-8">
                    <p className="text-gray-600 mb-8">
                      {selectedStatus === 'all' 
                        ? "You haven't placed any orders yet."
                        : `No ${selectedStatus.replace('_', ' ')} orders found.`}
                    </p>
                    <Link
                      href="/services"
                      className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
                    >
                      Browse Our Services
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-start">
                          <div className="text-left w-full">
                            <h3 className="text-xl font-semibold mb-2">{order.plan_name}</h3>
                            <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                            <p className="text-gray-600 text-sm mt-2">Order ID: {order.id}</p>
                            <p className="text-gray-600 text-sm">Price: ${order.price}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-left mt-4">
                      <Link
                        href="/orders"
                        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center"
                      >
                        View All Orders
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 