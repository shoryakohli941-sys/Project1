-- Create users table (Profiles for auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('brand', 'event_planner')),
  organization_name TEXT,
  location TEXT,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  event_date DATE,
  capacity INTEGER,
  description TEXT,
  organizer_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = organizer_id);

-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  budget TEXT,
  audience TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'closed')) NOT NULL DEFAULT 'open',
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Users can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Users can delete own opportunities" ON public.opportunities FOR DELETE USING (auth.uid() = organizer_id);

-- Create connections table
CREATE TABLE public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID REFERENCES public.users(id) NOT NULL,
  to_user UUID REFERENCES public.users(id) NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'archived')) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own connections" ON public.connections FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY "Users can insert connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "Users can update their own connections" ON public.connections FOR UPDATE USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY "Users can delete their own connections" ON public.connections FOR DELETE USING (auth.uid() = from_user OR auth.uid() = to_user);
