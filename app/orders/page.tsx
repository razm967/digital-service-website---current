'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Order } from '@/types/database'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkStoredService = () => {
      if (typeof window !== 'undefined') {
        const storedService = localStorage.getItem('selectedService')
        if (storedService) {
          const { planName, price } = JSON.parse(storedService)
          router.push(`/payment?plan=${planName}&price=${price}`)
          localStorage.removeItem('selectedService')
          return true
        }
      }
      return false
    }

    const fetchUserAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check for stored service after authentication
        if (checkStoredService()) {
          return
        }

        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_email', user.email)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching orders:', error)
          return
        }

        setOrders(orders || [])
      }
      
      setLoading(false)
    }

    fetchUserAndOrders()
  }, [supabase, router])

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

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Track Your Orders</h1>
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Sign in to view your orders</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Please sign in to your account to view your order history and track the status of your current orders.
            </p>
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 sm:mb-8 px-2">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 mb-6 sm:mb-8">You haven't placed any orders yet.</p>
            <Link
              href="/services"
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
            >
              Browse Our Services
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 px-2">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
                  <div className="text-left">
                    <h2 className="text-lg sm:text-xl font-semibold">{order.plan_name}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-sm font-medium self-start ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-left">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                    <p className="font-medium break-all text-sm">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                    <p className="font-medium">${order.price}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Project Description</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base break-words">
                    {order.project_description}
                  </p>
                </div>

                {order.additional_notes && (
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-3 sm:mt-4 pt-3 sm:pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">Additional Notes</p>
                    <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base break-words">
                      {order.additional_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 