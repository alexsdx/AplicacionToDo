import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL ERROR: Supabase keys are missing in environment variables.')
    // This alert will show up on Vercel if the keys are missing
    alert('ERROR DE CONFIGURACIÓN: No se encontraron las claves de Supabase. \n\nAsegúrate de haber agregado VITE_SUPABASE_URL y VITE_SUPABASE_KEY en Vercel Settings.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
