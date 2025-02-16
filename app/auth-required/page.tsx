'use client'

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from "@/components/ui/card"

export default function AuthRequired() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const price = searchParams.get('price')

  const handleSignUp = () => {
    // Store service details before redirecting
    if (plan && price) {
      localStorage.setItem('selectedService', JSON.stringify({
        planName: plan,
        price: price
      }))
    }
    
    // Simply redirect to home page with track-orders section
    router.push('/#track-orders')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8 glass-effect">
          <h1 className="text-3xl font-bold mb-6">One Step Away!</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Selected Package: {plan}</h2>
            <p className="text-2xl font-bold text-purple-600">${price}</p>
          </div>

          <p className="text-gray-600 mb-8">
            To complete your purchase and track your orders, you'll need to create an account. 
            It only takes a minute!
          </p>

          <Button 
            onClick={handleSignUp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full"
          >
            Sign Up / Sign In
          </Button>

          <p className="mt-4 text-sm text-gray-500">
            You'll receive a magic link to verify your email and complete the purchase.
          </p>
        </Card>
      </div>
    </div>
  )
} 