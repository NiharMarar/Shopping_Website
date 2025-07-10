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

testing:
4242 4242 4242 4242 (successful payment)
4000 0000 0000 0002 (declined payment)



Key Variables in Your Cart/Order Flow
| Variable Name | Where Used | What It Represents | Notes / Gotchas |
|--------------------|--------------------------|----------------------------------------------------|----------------------------------------------------------------------------------|
| cartItems | Frontend (state, localStorage) | Array of items in the cart (guest or user) | Structure may differ: guest = {id, name, price, ...}; user = {cart_item_id, products: {...}} |
| cart | Supabase (table) | The cart record for a logged-in user | Has cart_id, user_id |
| cart_items | Supabase (table) | Items in a user’s cart | Each has cart_item_id, cart_id, product_id, quantity |
| products | Supabase (table) | Product catalog | Each has product_id, product_name, product_price, etc. |
| order / orders | Supabase (table) | Placed orders | Each has order_id, user_id, email, shipping_address, etc. |

| order_items | Supabase (table) | Items in an order | Each has order_item_id, order_id, product_id, quantity, total_price |
| shippingAddress | Frontend (state) | Shipping address entered at checkout | Used for both guest and logged-in users |
| billingAddress | Frontend (state) | Billing address entered at checkout | Used for Stripe and your own records |
| email | Frontend (state), orders | Customer’s email | Used for Stripe receipts and your order confirmation |


Important Notes:
cartItems:
For guests, it’s stored in localStorage and may have a different structure than for logged-in users (who get cart items from Supabase).
Always check the structure before accessing properties (e.g., item.products?.product_name vs. item.name).
cart vs. cart_items:
cart is the cart record (one per user).
cart_items are the individual items in the cart.
order vs. order_items:
orders is the order record (one per checkout).
order_items are the products in that order.

Consistency:
When mapping or displaying items, always check which structure you’re dealing with (guest vs. user).
If you ever refactor, consider standardizing the cart item structure for both guests and users to avoid confusion.
Summary Table for Quick Reference
| Context | Variable | Structure Example |
|-----------------|------------------|----------------------------------------------------------------------------------|
| Guest Cart | cartItems | [ { id, name, price, quantity, image, ... } ] |
| User Cart | cartItems | [ { cart_item_id, quantity, products: { product_id, product_name, ... } } ] |
| Order | orders | { order_id, user_id, email, shipping_address, ... } |
| Order Items | order_items | [ { order_item_id, order_id, product_id, quantity, total_price } ] |
Keep this as a reference so you don’t get tripped up by variable naming or structure differences!


Tracking number:
9400100000000000000000

Tracking Number: 9205590347375207763875
