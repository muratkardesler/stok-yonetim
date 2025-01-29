import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dftjlbmovnnnzenpydri.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGpsYm1vdm5ubnplbnB5ZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNDg5NzUsImV4cCI6MjA1MzcyNDk3NX0.QQY1lUpFB7qeMrMvI1JX2N-nmkq9L4Eqd3bt6J5Eeec'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export { supabase } 