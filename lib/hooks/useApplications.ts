import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/db';

type Application = Database['public']['Tables']['applications']['Row'] & {
  jobs?: {
    id: string;
    title: string;
    company_id: string;
    companies: {
      name: string;
    };
  };
};

type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];

interface UseApplicationsFilters {
  jobId?: string;
}

interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseApplyReturn {
  apply: (jobId: string, note?: string, contactEmail?: string, contactPhone?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useApplications(
  filters: UseApplicationsFilters = {},
  signal?: AbortSignal
): UseApplicationsReturn {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize filters to prevent infinite re-renders
  const stableFilters = useMemo(() => ({
    jobId: filters.jobId || undefined,
  }), [filters.jobId]);

  const loadApplications = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setApplications([]);
        return;
      }

      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            company_id,
            companies!inner (
              name
            )
          )
        `)
        .eq('student_user_id', user.id)
        .order('created_at', { ascending: false });

      if (stableFilters.jobId) {
        query = query.eq('job_id', stableFilters.jobId);
      }

      const { data, error } = await query.abortSignal(signal);

      if (error) throw error;
      setApplications(data as Application[]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [stableFilters, signal]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    loading,
    error,
    refresh: loadApplications,
  };
}

interface UseCheckApplicationReturn {
  hasApplied: boolean;
  loading: boolean;
  error: string | null;
}

export function useCheckApplication(jobId: string): UseCheckApplicationReturn {
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApplication = async () => {
      if (!jobId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasApplied(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('student_user_id', user.id)
          .limit(1);

        if (error) throw error;
        setHasApplied(data.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check application status');
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [jobId]);

  return {
    hasApplied,
    loading,
    error,
  };
}

interface UseApplicationStatusReturn {
  status: 'submitted' | 'accepted' | 'rejected' | null;
  loading: boolean;
  error: string | null;
}

export function useApplicationStatus(jobId: string): UseApplicationStatusReturn {
  const [status, setStatus] = useState<'submitted' | 'accepted' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!jobId) {
        setStatus(null);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('applications')
          .select('status')
          .eq('job_id', jobId)
          .eq('student_user_id', user.id)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setStatus(data[0].status as 'submitted' | 'accepted' | 'rejected');
        } else {
          setStatus(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check application status');
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [jobId]);

  return {
    status,
    loading,
    error,
  };
}

export function useApply(): UseApplyReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (jobId: string, note?: string, contactEmail?: string, contactPhone?: string) => {
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, ensure user has a profile (required for foreign key constraint)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        console.log('Creating student profile for application submission');
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            role: 'student',
            name: user.email?.split('@')[0] || 'Student',
            interests: [],
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }
      }

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('student_user_id', user.id)
        .limit(1);

      if (existingApplication && existingApplication.length > 0) {
        throw new Error('You have already applied for this position');
      }

      // Submit application with contact fields
      const applicationData = {
        job_id: jobId,
        student_user_id: user.id,
        note: note || null,
        status: 'submitted',
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
      };

      console.log('Submitting application with data:', applicationData);

      const { error } = await supabase
        .from('applications')
        .insert(applicationData);

      if (error) {
        console.error('Application submission error:', error);
        throw error;
      }

      console.log('Application submitted successfully');
      if (contactEmail || contactPhone) {
        console.log('Contact info stored in database:', { contactEmail, contactPhone });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply for job';
      console.error('Final application error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apply,
    loading,
    error,
  };
}