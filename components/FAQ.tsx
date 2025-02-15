'use client'
import { useState } from 'react'
import Link from "next/link"

interface FAQ {
  question: string
  answer: string
  isOpen?: boolean
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "What design services do you offer?",
      answer: "We offer comprehensive UI design, prototyping, and design systems development. Our services include user interface design, interactive prototypes, design system creation, and design consultation.",
      isOpen: false
    },
    {
      question: "How long does a typical design project take?",
      answer: "Project timelines vary based on scope and complexity. A typical UI design project can take 4-8 weeks, while a complete design system might take 8-12 weeks. We'll provide a detailed timeline during our initial consultation.",
      isOpen: false
    },
    {
      question: "Do you provide ongoing design support?",
      answer: "Yes, we offer ongoing design support and maintenance packages. This includes updates to your design system, new component designs, and regular design reviews to ensure consistency.",
      isOpen: false
    },
    {
      question: "How do you handle revisions and feedback?",
      answer: "We have a structured feedback process with dedicated revision rounds. We use collaborative tools to gather feedback and implement changes efficiently, ensuring your vision is perfectly executed.",
      isOpen: false
    },
    {
      question: "Can you work with our existing brand guidelines?",
      answer: "Absolutely! We excel at working within established brand guidelines while bringing fresh perspectives to your digital presence. We ensure all designs align with your brand identity.",
      isOpen: false
    },
    {
      question: "What makes your design approach unique?",
      answer: "We combine data-driven design decisions with creative innovation. Our focus on user-centric design principles and conversion optimization sets us apart, delivering designs that not only look great but perform exceptionally.",
      isOpen: false
    }
  ])

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      isOpen: i === index ? !faq.isOpen : false
    })))
  }

  return (
    <div className="container mx-auto mt-20">
      <div className="text-center max-w-5xl mx-auto px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 gradient-text animate-float">
          Frequently Asked Questions
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          Find answers to common questions about our design services and process.
        </p>

        {/* FAQ Section */}
        <div className="w-full max-w-4xl mx-auto space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="glass-effect interactive rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold gradient-text">
                    {faq.question}
                  </h3>
                  <svg 
                    className={`w-6 h-6 text-blue-600 transition-transform duration-200 ${faq.isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className={`mt-4 text-gray-600 dark:text-gray-300 overflow-hidden transition-all duration-200 ${faq.isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center pb-20">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Still have questions? We're here to help!
          </p>
          <Link
            href="/contact"
            className="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
} 