import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from 'next/link'

// Service packages data
const packages = [
  {
    name: "Basic",
    price: 37.42,
    features: [
      { text: "1 page", included: true },
      { text: "1 custom asset", included: true },
      { text: "Prototype", included: true },
      { text: "Source file", included: true },
      { text: "2-day delivery", included: true },
      { text: "Unlimited Revisions", included: true },
      { text: "Interactive elements", included: false },
      { text: "Animations", included: false },
      { text: "Priority support", included: false },
      { text: "Multiple pages", included: false }
    ],
    recommended: false
  },
  {
    name: "Standard",
    price: 74.84,
    features: [
      { text: "3 pages", included: true },
      { text: "3 custom assets", included: true },
      { text: "Prototype", included: true },
      { text: "Source file", included: true },
      { text: "Interactive elements", included: true },
      { text: "3-day delivery", included: true },
      { text: "Unlimited Revisions", included: true },
      { text: "Animations", included: false },
      { text: "Priority support", included: false },
      { text: "5+ pages", included: false }
    ],
    recommended: true
  },
  {
    name: "Premium",
    price: 149.68,
    features: [
      { text: "5 pages", included: true },
      { text: "5 custom assets", included: true },
      { text: "Prototype", included: true },
      { text: "Source file", included: true },
      { text: "Interactive elements", included: true },
      { text: "Animations", included: true },
      { text: "4-day delivery", included: true },
      { text: "Unlimited Revisions", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding guide", included: true }
    ],
    recommended: false
  }
]

export default function Services() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12 text-center">Our Digital Services</h1>
      
      {/* Service Block */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Service Image */}
          <div className="md:w-1/3">
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.jpg"
                alt="Digital Service"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          
          {/* Service Details */}
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Professional Web Design & Development</h2>
            <p className="text-gray-600 mb-6">
              Get a professional, modern, and responsive website designed and developed by our expert team.
              We focus on creating beautiful, functional websites that help your business grow.
            </p>
            
            {/* Package Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.name}
                  className={`p-6 ${pkg.recommended ? 'border-2 border-purple-500' : ''} flex flex-col`}
                >
                  <div className="text-center mb-4">
                    {pkg.recommended && (
                      <span className="bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                    <h3 className="text-xl font-bold mt-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold mt-2">
                      ${pkg.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 flex-grow">
                    {pkg.features.map((feature, index) => (
                      <li 
                        key={index} 
                        className={`flex items-center ${!feature.included ? 'text-gray-400' : ''}`}
                      >
                        {feature.included ? (
                          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6">
                    <Link href={`/payment?plan=${pkg.name}&price=${pkg.price}`}>
                      <Button 
                        className={`w-full ${pkg.recommended ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      >
                        Select {pkg.name}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

