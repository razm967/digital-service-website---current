import { supabase } from './supabase'

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error.message)
      return false
    }
    
    console.log('Connection test successful!')
    return true
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
} 