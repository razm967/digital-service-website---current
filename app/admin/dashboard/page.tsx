'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from 'js-cookie'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface Order {
  id: string
  created_at: string
  user_name: string
  user_email: string
  company_name: string | null
  plan_name: string
  price: number
  project_description: string
  additional_notes: string | null
  user_id: string | null
  status: 'pending' | 'in_progress' | 'completed'
  role: string | null
}

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
}

const TIME_RANGES = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  '1y': '1 Year',
  'custom': 'Custom Range',
  'all': 'All Time'
} as const

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
  const [timeRange, setTimeRange] = useState<keyof typeof TIME_RANGES>('30d')
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null])

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is admin from localStorage
      const isAdmin = localStorage.getItem('isAdmin') === 'true'
      if (!isAdmin) {
        router.push('/admin/login')
        return
      }
      
      // If admin, fetch data
      fetchData()
    }

    checkAuth()

    // Set up real-time subscription
    const channel = supabase
      .channel('orders_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      console.log('Fetching orders...')
      // Fetch directly from orders table
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error)
        router.push('/admin/login')
        return
      }

      console.log('Fetched orders:', orders)

      if (orders && orders.length > 0) {
        console.log('Setting orders and calculating stats...')
        setOrders(orders)
        
        // Calculate dashboard stats using actual price from database
        const stats = orders.reduce((acc: DashboardStats, order: Order) => {
          acc.totalOrders++
          acc.totalRevenue += Number(order.price)
          if (order.status === 'pending') acc.pendingOrders++
          if (order.status === 'completed') acc.completedOrders++
          return acc
        }, {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        })

        console.log('Calculated stats:', stats)
        setStats(stats)
      } else {
        console.log('No orders found')
        setOrders([])
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0
        })
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Data will be automatically refreshed by the subscription
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin')
    router.push('/admin/login')
  }

  const getRevenueData = () => {
    let startDate = new Date()
    let endDate = new Date()

    // Determine date range
    if (timeRange === 'custom' && customDateRange[0] && customDateRange[1]) {
      startDate = customDateRange[0]
      endDate = customDateRange[1]
    } else {
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        case 'all':
          startDate = new Date(Math.min(...orders.map(o => new Date(o.created_at).getTime())))
          break
      }
    }

    // Filter orders within range
    const filteredOrders = timeRange === 'all' 
      ? orders 
      : orders.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate >= startDate && orderDate <= endDate
        })

    // Generate all dates in range
    const dateRange = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Create revenue data with 0 for dates with no orders
    const revenueData = dateRange.map(date => {
      const dateStr = date.toISOString().split('T')[0]
      const dayRevenue = filteredOrders
        .filter(order => order.created_at.split('T')[0] === dateStr)
        .reduce((sum, order) => sum + Number(order.price), 0)
      
      return {
        date: dateStr,
        revenue: dayRevenue
      }
    })

    return revenueData
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
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Refresh Data
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
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

          {/* Add Revenue Chart Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as keyof typeof TIME_RANGES)}
                  className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(TIME_RANGES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                
                {timeRange === 'custom' && (
                  <div className="flex gap-2 items-center">
                    <DatePicker
                      selectsRange={true}
                      startDate={customDateRange[0]}
                      endDate={customDateRange[1]}
                      onChange={(update: [Date | null, Date | null]) => {
                        setCustomDateRange(update)
                      }}
                      className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      placeholderText="Select date range"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Table */}
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
                          <span className="text-gray-500 ml-2">${Number(order.price).toFixed(2)}</span>
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

          {/* Add new dashboard sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Plans */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Plans</h2>
              <div className="space-y-4">
                {Object.entries(orders.reduce((acc: any, order: Order) => {
                  acc[order.plan_name] = (acc[order.plan_name] || 0) + 1
                  return acc
                }, {}))
                  .sort(([,a]: any, [,b]: any) => b - a)
                  .slice(0, 5)
                  .map(([plan, count]: any) => (
                    <div key={plan} className="flex justify-between items-center">
                      <span className="text-gray-600">{plan}</span>
                      <span className="text-gray-900 font-medium">{count} orders</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'completed' ? 'bg-green-500' :
                      order.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New order from {order.user_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} - ${order.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Demographics */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Demographics</h2>
              <div className="space-y-4">
                {Object.entries(orders.reduce((acc: any, order: Order) => {
                  const domain = order.user_email.split('@')[1]
                  acc[domain] = (acc[domain] || 0) + 1
                  return acc
                }, {}))
                  .sort(([,a]: any, [,b]: any) => b - a)
                  .slice(0, 5)
                  .map(([domain, count]: any) => (
                    <div key={domain} className="flex justify-between items-center">
                      <span className="text-gray-600">@{domain}</span>
                      <span className="text-gray-900 font-medium">{count} customers</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
              <div className="space-y-4">
                {Object.entries(orders.reduce((acc: any, order: Order) => {
                  acc[order.status] = (acc[order.status] || 0) + 1
                  return acc
                }, {})).map(([status, count]: any) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-gray-900 font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${(count / orders.length * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 