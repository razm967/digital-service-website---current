'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from 'js-cookie'

interface Order {
  id: string
  created_at: string
  user_name: string
  user_email: string
  company_name: string
  plan_name: string
  project_description: string
  additional_notes: string
  status: string
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    if (!isAdmin) {
      router.push('/admin/login')
    } else {
      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      console.log('Starting fetchData...')
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          user_name,
          user_email,
          company_name,
          plan_name,
          project_description,
          additional_notes,
          status
        `)
        .order('created_at', { ascending: false })

      console.log('Full orders query result:', orders)

      if (error) {
        console.error('Query error:', error)
        throw error
      }

      if (orders) {
        setOrders(orders)
        
        // Calculate dashboard stats
        const stats = orders.reduce((acc, order) => {
          acc.totalOrders++
          acc.totalRevenue += getPlanPrice(order.plan_name)
          if (order.status === 'pending') acc.pendingOrders++
          if (order.status === 'completed') acc.completedOrders++
          return acc
        }, {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        })

        setStats(stats)
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get plan prices
  const getPlanPrice = (planName: string): number => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return 37.42
      case 'standard':
        return 74.84
      case 'premium':
        return 149.68
      default:
        return 0
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Refresh data after update
      fetchData()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin')
    Cookies.remove('isAdmin', { path: '/' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Admin Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{order.user_name}</div>
                            <div className="text-gray-500">{order.user_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.company_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="font-medium">{order.plan_name}</span>
                          <span className="text-gray-500 ml-2">${getPlanPrice(order.plan_name)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 