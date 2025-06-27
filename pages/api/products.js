import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('product_id, image_url, created_at, product_name, product_description, product_price');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
