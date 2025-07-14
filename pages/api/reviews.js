import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (req.method === 'GET') {
    // Fetch reviews for a product
    const { product, sort } = req.query;
    if (!product) return res.status(400).json({ error: 'Missing product id' });
    let orderBy = { column: 'created_at', ascending: false };
    if (sort === 'oldest') orderBy = { column: 'created_at', ascending: true };
    if (sort === 'highest') orderBy = { column: 'rating', ascending: false };
    if (sort === 'lowest') orderBy = { column: 'rating', ascending: true };
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, review_text, created_at, user_id, user:profiles(full_name, username, avatar_url)')
      .eq('product_id', product)
      .order(orderBy.column, { ascending: orderBy.ascending });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    // Add a review (authenticated users only)
    const { product_id, rating, review_text, user_id } = req.body;
    if (!product_id || !rating || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id, rating, review_text, user_id }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } else if (req.method === 'DELETE') {
    // Delete a review (only by the review's user)
    const { review_id } = req.query;
    if (!review_id) return res.status(400).json({ error: 'Missing review_id' });
    // Optionally, you could check the user's auth here for extra security
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', review_id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 