import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
} 