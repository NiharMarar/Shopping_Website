import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Create Supabase client with service role key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from('products')
      .select('product_id, image_url, created_at, product_name, product_description, product_price')
      .eq('product_id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform the data to match what ProductCard expects
    const transformedData = {
      id: data.product_id, // Add 'id' field for like functionality
      product_id: data.product_id,
      image_url: data.image_url,
      created_at: data.created_at,
      product_name: data.product_name,
      product_description: data.product_description,
      product_price: data.product_price
    };

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
} 