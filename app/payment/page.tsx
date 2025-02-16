'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useState, useCallback, useEffect, Suspense } from "react"
import Image from "next/image"
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

type FormErrors = {
  userName?: string
  userEmail?: string
  projectDescription?: string
  files?: string
}

function PaymentPageContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    companyName: '',
    projectDescription: '',
    additionalNotes: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const plan = searchParams.get('plan') as string || 'Basic'
  const price = searchParams.get('price') as string || '0'

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)
      setLoading(false)

      // Only access localStorage after component is mounted (client-side)
      if (typeof window !== 'undefined') {
        // If we have stored service details, use them
        const storedService = localStorage.getItem('selectedService')
        if (storedService) {
          const { planName, price } = JSON.parse(storedService)
          // Update URL with stored service details
          router.push(`/payment?plan=${planName}&price=${price}`)
          // Clear stored service after using it
          localStorage.removeItem('selectedService')
        }
      }
    }

    checkAuth()
  }, [supabase, router])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        setFormData(prev => ({
          ...prev,
          userEmail: session.user.email || '',
          userName: session.user.user_metadata?.full_name || ''
        }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        setFormData(prev => ({
          ...prev,
          userEmail: session.user.email || '',
          userName: session.user.user_metadata?.full_name || ''
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }

  const validateStep1 = () => {
    const newErrors: FormErrors = {}
    let isValid = true

    if (!formData.userName.trim()) {
      newErrors.userName = 'Full name is required'
      isValid = false
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'Email is required'
      isValid = false
    } else if (!validateEmail(formData.userEmail)) {
      newErrors.userEmail = 'Please enter a valid email address'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validateStep2 = () => {
    const newErrors: FormErrors = {}
    let isValid = true

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required'
      isValid = false
    } else if (formData.projectDescription.trim().length < 50) {
      newErrors.projectDescription = 'Please provide a more detailed description (at least 50 characters)'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validateFileUpload = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large. Maximum size is 50MB.`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File ${file.name} has unsupported format. Allowed formats are: JPEG, PNG, GIF, PDF, DOC, DOCX.`;
    }
    
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      let hasErrors = false;
      
      // Validate each file
      newFiles.forEach(file => {
        const error = validateFileUpload(file);
        if (error) {
          setErrors(prev => ({
            ...prev,
            files: error
          }));
          hasErrors = true;
        }
      });
      
      if (!hasErrors) {
        setFiles(prev => [...prev, ...newFiles]);
        // Clear any previous file errors
        setErrors(prev => ({
          ...prev,
          files: undefined
        }));
      }
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      let hasErrors = false;
      
      // Validate each file
      newFiles.forEach(file => {
        const error = validateFileUpload(file);
        if (error) {
          setErrors(prev => ({
            ...prev,
            files: error
          }));
          hasErrors = true;
        }
      });
      
      if (!hasErrors) {
        setFiles(prev => [...prev, ...newFiles]);
        // Clear any previous file errors
        setErrors(prev => ({
          ...prev,
          files: undefined
        }));
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep2()) {
      return
    }

    if (!session) {
      setErrors(prev => ({
        ...prev,
        userEmail: 'Please verify your email before submitting the order'
      }))
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Starting order submission...')

      // Insert order with verified email
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_name: formData.userName,
          user_email: session.user.email, // Use verified email
          company_name: formData.companyName || null,
          plan_name: plan,
          price: parseFloat(price),
          project_description: formData.projectDescription,
          additional_notes: formData.additionalNotes || null,
          status: 'pending',
          user_id: session.user.id // Add user_id for better tracking
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error inserting order:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      // Store user email in local storage after successful order
      if (session.user.email) {
        localStorage.setItem('userEmail', session.user.email)
      }

      console.log('Order created successfully:', orderData)

      // Handle file uploads if there are any files
      if (files.length > 0) {
        console.log(`Processing ${files.length} attachments...`)
        
        for (const file of files) {
          try {
            console.log('Processing file:', file.name)
            
            // Create bucket if it doesn't exist
            const { data: bucketData, error: bucketError } = await supabase
              .storage
              .getBucket('order-attachments')

            if (bucketError && bucketError.message.includes('does not exist')) {
              console.log('Creating storage bucket...')
              const { error: createBucketError } = await supabase
                .storage
                .createBucket('order-attachments', {
                  public: true,
                  fileSizeLimit: 52428800 // 50MB
                })
              
              if (createBucketError) {
                console.error('Error creating bucket:', createBucketError)
                throw createBucketError
              }
            }

            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${orderData.id}/${fileName}`

            console.log('Uploading file:', filePath)
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('order-attachments')
              .upload(filePath, file)

            if (uploadError) {
              console.error('Error uploading file:', uploadError)
              throw uploadError
            }

            console.log('File uploaded successfully:', uploadData)

            // Get public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
              .from('order-attachments')
              .getPublicUrl(filePath)

            console.log('File public URL:', publicUrl)

            // Save attachment record
            const { error: attachmentError } = await supabase
              .from('order_attachments')
              .insert({
                order_id: orderData.id,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
                file_size: file.size
              })

            if (attachmentError) {
              console.error('Error saving attachment record:', attachmentError)
              throw attachmentError
            }

            console.log('Attachment record saved successfully')
          } catch (fileError: any) {
            console.error('Error processing file:', file.name, fileError)
            throw new Error(`Failed to process file ${file.name}: ${fileError.message}`)
          }
        }
      }

      console.log('Order submission completed successfully')
      setIsCompleted(true)
    } catch (error: any) {
      console.error('Error submitting order:', error)
      alert(error.message || 'There was an error submitting your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Purchase Completed!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. We have received your request and will contact you shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Package:</span>
                <span className="font-medium">{plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-purple-600">${price}</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                A confirmation email will be sent to {formData.userEmail}
              </p>
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show auth UI if email not verified
  if (step === 1 && !session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Verify Your Email</h2>
            <p className="text-gray-600 mb-6">
              Please verify your email to continue with your order. This helps us ensure we can contact you about your project.
            </p>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              view="magic_link"
              showLinks={false}
              redirectTo={`${window.location.origin}/payment?plan=${plan}&price=${price}`}
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
            1
          </div>
          <div className="w-16 h-1 bg-purple-100">
            <div className={`h-full bg-purple-600 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
            2
          </div>
        </div>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Selected Plan</span>
              <span className="font-medium">{plan} Package</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-purple-600">${price}</span>
            </div>
          </div>
          
          {step === 1 ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.userName ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.userName && (
                  <p className="mt-1 text-sm text-red-500">{errors.userName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${errors.userEmail ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                  required
                />
                {errors.userEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.userEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company (Optional)</label>
                <input 
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your company name"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-md min-h-[200px] ${errors.projectDescription ? 'border-red-500' : ''}`}
                  placeholder="Please describe your project in detail. Include any specific requirements, features, or preferences you have in mind. The more details you provide, the better we can understand your needs."
                  required
                />
                {errors.projectDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.projectDescription}</p>
                )}
              </div>
              
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attachments (Images, Documents, etc.)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    errors.files ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-purple-500'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path
                          d="M24 32V16m0 0l-8 8m8-8l8 8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1">Drag and drop files here, or click to select files</p>
                      <p className="text-sm text-gray-500">
                        Maximum file size: 50MB. Supported formats: Images (JPEG, PNG, GIF), PDF, DOC, DOCX
                      </p>
                    </div>
                  </label>
                </div>
                {errors.files && (
                  <p className="mt-2 text-sm text-red-500">{errors.files}</p>
                )}

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Attached Files:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="border rounded-lg p-3 flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <div className="relative w-10 h-10">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              ) : (
                                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                <textarea 
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-md min-h-[100px]"
                  placeholder="Any additional information or special requests?"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {step === 1 ? (
              <Button 
                onClick={() => {
                  if (validateStep1()) {
                    setStep(2)
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
              >
                Next
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                </Button>
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Back to Contact Info
                </Button>
              </>
            )}
            <Link href="/services">
              <Button variant="outline" className="w-full">
                Back to Services
              </Button>
            </Link>
          </div>
        </Card>
        
        <p className="text-center text-sm text-gray-500">
          This is a demo checkout page. No actual payment will be processed.
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <PaymentPageContent />
    </Suspense>
  )
} 