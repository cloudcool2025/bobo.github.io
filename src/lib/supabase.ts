import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 使用环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmbzdpnnghmqmpvnhxvf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYnpkcG5uZ2htcW1wdm5oWHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzEyMDAsImV4cCI6MjA1NjY4NzIwMH0.EGim96W_qJ3xK6eHN6x3MQJUcM8Oq4_fOocAhN1C5P0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
