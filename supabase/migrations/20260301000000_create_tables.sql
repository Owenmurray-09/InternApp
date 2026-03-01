-- Create job marketplace app tables
-- This migration creates the core tables for the job marketplace app

-- Profiles table for both students and employers
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role text CHECK (role IN ('student', 'employer')),
    name text,
    bio text,
    interests text[] DEFAULT '{}',
    daily_digest_enabled boolean DEFAULT false,
    phone text,
    experience text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Jobs table for job postings
CREATE TABLE public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    tags text[] DEFAULT '{}',
    location text,
    salary_range text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Applications table for job applications
CREATE TABLE public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(job_id, student_id)
);

-- Messages table for chat between students and employers
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can manage their jobs" ON public.jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'employer')
);

-- RLS Policies for applications
CREATE POLICY "Students can view their applications" ON public.applications FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.jobs WHERE id = applications.job_id AND company_id = auth.uid())
);
CREATE POLICY "Students can create applications" ON public.applications FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "Employers can update applications to their jobs" ON public.applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = applications.job_id AND company_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);

-- Create indexes for better performance
CREATE INDEX jobs_company_id_idx ON public.jobs(company_id);
CREATE INDEX applications_job_id_idx ON public.applications(job_id);
CREATE INDEX applications_student_id_idx ON public.applications(student_id);
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at);