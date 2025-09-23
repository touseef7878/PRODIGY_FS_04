-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);

-- Create a table for chat rooms
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  name text not null,
  creator_id uuid references profiles(id) on delete cascade
);

-- Set up Row Level Security (RLS) for chat_rooms
alter table chat_rooms enable row level security;

create policy "Chat rooms are viewable by everyone."
  on chat_rooms for select
  using (true);

create policy "Users can create chat rooms."
  on chat_rooms for insert
  with check (auth.uid() = creator_id);

create policy "Users can update their own chat rooms."
  on chat_rooms for update
  using (auth.uid() = creator_id);

create policy "Users can delete their own chat rooms."
  on chat_rooms for delete
  using (auth.uid() = creator_id);

-- Create a table for messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  chat_room_id uuid references chat_rooms(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null
);

-- Set up Row Level Security (RLS) for messages
alter table messages enable row level security;

create policy "Messages are viewable by everyone in the chat room."
  on messages for select
  using (true); -- For simplicity, allowing all messages to be read. In a real app, you'd check if the user is part of the chat room.

create policy "Users can insert messages."
  on messages for insert
  with check (auth.uid() = sender_id);

-- Optional: Create a function to automatically create a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email); -- Using email as initial username, can be changed later
  return new;
end;
$$ language plpgsql security definer;

-- Optional: Trigger the function on new user sign-ups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();