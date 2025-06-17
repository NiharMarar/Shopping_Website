-- Create orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  stripe_payment_intent_id text unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  total_amount decimal(10,2) not null,
  shipping_address jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  quantity integer not null check (quantity > 0),
  price_at_time decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table orders enable row level security;
alter table order_items enable row level security;

-- Create policies for orders
create policy "Users can view their own orders."
  on orders for select
  using ( auth.uid() = user_id );

create policy "Users can create their own orders."
  on orders for insert
  with check ( auth.uid() = user_id );

-- Create policies for order_items
create policy "Users can view their own order items."
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can create their own order items."
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for orders
create trigger on_order_updated
  before update on orders
  for each row execute procedure public.handle_updated_at(); 