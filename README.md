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


Recommended Approach:
Start with Vercel (free tier)
Use Supabase (free tier)
Use Stripe (free to start)
Use a free subdomain initially (e.g., your-site.vercel.app)
Move to paid hosting only when you have consistent sales

Cost Breakdown (Initial Setup):
Hosting: $0 (Vercel free tier)
Database: $0 (Supabase free tier)
Payment Processing: $0 (Stripe, charges per transaction)
Domain: $0 (initially use Vercel subdomain)
Total Initial Cost: $0

When to Consider Paid Services:
When you exceed Vercel's free tier limits
When you need more Supabase resources
When you want a custom domain
When you need more storage for product images
When you need better performance


Next Steps:
Create Supabase account and project
Create Stripe account
Set up Vercel deployment
Implement authentication
Set up product database
Implement payment system
Add admin dashboard
Set up order management