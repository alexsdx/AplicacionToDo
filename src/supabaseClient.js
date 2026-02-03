import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    alert('ERROR CRÍTICO: Falta la variable VITE_SUPABASE_URL. Por favor agrégala en Vercel.')
} else if (!supabaseAnonKey) {
    alert('ERROR CRÍTICO: Falta la variable VITE_SUPABASE_ANON_KEY. Por favor agrégala en Vercel.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
