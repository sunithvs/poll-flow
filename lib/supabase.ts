import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Poll = {
  id: string;
  question: string;
  created_at: string;
  last_edited_at: string;
  is_active: boolean;
  url_slug: string;
};

export type Option = {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
};

export type Response = {
  id: string;
  poll_id: string;
  option_id: string;
  respondent_name: string;
  submitted_at: string;
};
