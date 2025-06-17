# Shopping_Website
This website is where you can buy products for sale. 

# TikTok Shop Starter

## Setup
1. `npm install`
2. Create `.env.local` with your Supabase & Stripe keys
3. `npm run dev`

## Database
- Use Supabase dashboard to create a `products` table:
  - id: bigint, primary key
  - name: text
  - price: numeric
  - image: text

## Next Steps
- Protect admin routes
- Add user auth
- Integrate Stripe Checkout 
