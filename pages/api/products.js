import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('products')
      .select('product_id, image_url, created_at, product_name, product_description, product_price, length, width, height, weight')
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
