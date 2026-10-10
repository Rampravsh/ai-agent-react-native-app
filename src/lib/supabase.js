import { createClient } from '@supabase/supabase-js'
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create a single supabase client for interacting with your database
export const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY,{
    auth:{
        storage:AsyncStorage,
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:false
    }
})