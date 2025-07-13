import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No valid token' });
  }

  const token = authHeader.split(' ')[1];

  // Create Supabase client with service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify the user token and check admin role
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin privileges required' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
  }

  try {
    const { product_id, product_name, product_description, product_price, image_url } = req.body;

    // Validate required fields
    if (!product_name || !product_price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate a UUID for the product_id if not provided
    const finalProductId = product_id || crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('products')
      .upsert({
        product_id: finalProductId,
        product_name,
        product_description: product_description || '',
        product_price: parseFloat(product_price),
        image_url: image_url || ''
      }, { onConflict: 'product_id' });

    if (error) {
      console.error('Error adding product:', error);
      return res.status(500).json({ message: 'Error adding product', error: error.message });
    }

    res.status(200).json({ message: 'Product added successfully', data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 