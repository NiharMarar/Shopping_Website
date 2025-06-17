-- Create cart_items table
create table cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Set up Row Level Security (RLS)
alter table cart_items enable row level security;

-- Create policies
create policy "Users can view their own cart items."
  on cart_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own cart items."
  on cart_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own cart items."
  on cart_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own cart items."
  on cart_items for delete
  using ( auth.uid() = user_id );

-- Create updated_at trigger
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_cart_item_updated
  before update on cart_items
  for each row execute procedure public.handle_updated_at(); 