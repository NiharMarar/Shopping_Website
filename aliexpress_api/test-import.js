const axios = require('axios');

async function testProductImport() {
  const productUrl = 'https://www.aliexpress.us/item/3256807320820976.html?spm=a2g0o.home.pcJustForYou.50.13506278LjEVpt&gps-id=pcJustForYou&scm=1007.13562.416251.0&scm_id=1007.13562.416251.0&scm-url=1007.13562.416251.0&pvid=8878e561-513a-4394-a76e-a420025c360f&_t=gps-id:pcJustForYou,scm-url:1007.13562.416251.0,pvid:8878e561-513a-4394-a76e-a420025c360f,tpp_buckets:668%232846%238113%231998&pdp_ext_f=%7B%22order%22%3A%22222%22%2C%22eval%22%3A%221%22%2C%22sceneId%22%3A%223562%22%7D&pdp_npi=4%40dis%21USD%2135.45%2135.45%21%21%21253.02%21253.02%21%402103277f17523374909852855e2d88%2112000041063106539%21rec%21US%216196820210%21XZ&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A';

  try {
    console.log('🚀 Testing product import...');
    console.log('📦 Product URL:', productUrl);
    
    const response = await axios.post('http://localhost:3001/api/products/import', {
      productUrl: productUrl
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Import successful!');
    console.log('📊 Product data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data || error.message);
  }
}

// Run the test
testProductImport(); 