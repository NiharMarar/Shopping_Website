const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testProducts = [
  {
    product_id: 'cyber-visor-001',
    product_name: 'Neon Cyber Visor',
    product_description: 'Advanced HUD display with neural interface. Features real-time data overlay, night vision, and social media integration.',
    product_price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },
  {
    product_id: 'quantum-watch-002',
    product_name: 'Quantum Timepiece',
    product_description: 'Temporal manipulation device with holographic display. Syncs with multiple dimensions and displays quantum probabilities.',
    product_price: 599.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
  },
  {
    product_id: 'neural-interface-003',
    product_name: 'Neural Link Interface',
    product_description: 'Direct brain-computer interface with wireless connectivity. Enables thought-controlled computing and virtual reality immersion.',
    product_price: 1299.99,
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop'
  },
  {
    product_id: 'hologram-projector-004',
    product_name: 'Holographic Projector',
    product_description: 'Portable 3D hologram generator with gesture controls. Perfect for presentations, gaming, and entertainment.',
    product_price: 449.99,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },
  {
    product_id: 'cyber-jacket-005',
    product_name: 'Smart Cyber Jacket',
    product_description: 'Temperature-regulating jacket with built-in LED displays, wireless charging, and environmental sensors.',
    product_price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eacd?w=400&h=400&fit=crop'
  },
  {
    product_id: 'quantum-computer-006',
    product_name: 'Quantum Processing Unit',
    product_description: 'Next-generation quantum computer for home use. Capable of solving complex calculations in seconds.',
    product_price: 2499.99,
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop'
  },
  {
    product_id: 'neural-stimulator-007',
    product_name: 'Neural Stimulation Device',
    product_description: 'Non-invasive brain stimulation for enhanced focus, memory, and cognitive performance.',
    product_price: 399.99,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },
  {
    product_id: 'cyber-gloves-008',
    product_name: 'Haptic Feedback Gloves',
    product_description: 'Advanced haptic gloves with force feedback, gesture recognition, and virtual touch simulation.',
    product_price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eacd?w=400&h=400&fit=crop'
  }
];

async function addTestProducts() {
  console.log('🚀 Adding test products to database...');
  
  try {
    for (const product of testProducts) {
      const { data, error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'product_id' });
      
      if (error) {
        console.error(`❌ Error adding ${product.product_name}:`, error);
      } else {
        console.log(`✅ Added: ${product.product_name} - $${product.product_price}`);
      }
    }
    
    console.log('\n🎉 Test products added successfully!');
    console.log('📊 Total products added:', testProducts.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addTestProducts(); 