export type Order = {
  id: string
  created_at: string
  user_name: string
  user_email: string
  company_name?: string
  plan_name: string
  price: number
  project_description: string
  additional_notes?: string
  status: 'pending' | 'in_progress' | 'completed'
}

export type OrderAttachment = {
  id: string
  order_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      order_attachments: {
        Row: OrderAttachment
        Insert: Omit<OrderAttachment, 'id' | 'created_at'>
        Update: Partial<Omit<OrderAttachment, 'id' | 'created_at'>>
      }
      contacts: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          subject: string
          message: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          subject: string
          message: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          subject?: string
          message?: string
        }
      }
    }
  }
} 