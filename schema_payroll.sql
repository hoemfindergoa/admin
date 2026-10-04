-- Payroll System Schema

-- 1. Payroll Settings (Organization level)
CREATE TABLE public.payroll_settings (
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE PRIMARY KEY,
    pf_percentage NUMERIC(5, 2) DEFAULT 12.00,
    pt_rule TEXT DEFAULT 'state', -- 'state', 'fixed', 'none'
    bank_integration_status TEXT DEFAULT 'NOT_CONNECTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payroll settings of their org" ON public.payroll_settings FOR SELECT USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_settings.org_id AND organization_users.user_id = auth.uid()));
CREATE POLICY "Users can update payroll settings of their org" ON public.payroll_settings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_settings.org_id AND organization_users.user_id = auth.uid()));
CREATE POLICY "Users can insert payroll settings of their org" ON public.payroll_settings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_settings.org_id AND organization_users.user_id = auth.uid()));

-- 2. Staff Compensation (Per teacher/staff member)
-- Links to school_teachers, assuming that's the primary staff table.
CREATE TABLE public.staff_compensation (
    staff_id UUID NOT NULL REFERENCES public.school_teachers(id) ON DELETE CASCADE PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    base_salary NUMERIC(12, 2) DEFAULT 0.00,
    allowances NUMERIC(12, 2) DEFAULT 0.00,
    deductions NUMERIC(12, 2) DEFAULT 0.00,
    bank_account_number TEXT,
    tax_regime TEXT DEFAULT 'new', -- 'new' or 'old'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.staff_compensation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view staff compensation of their org" ON public.staff_compensation FOR SELECT USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = staff_compensation.org_id AND organization_users.user_id = auth.uid()));
CREATE POLICY "Users can manage staff compensation of their org" ON public.staff_compensation FOR ALL USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = staff_compensation.org_id AND organization_users.user_id = auth.uid()));

-- 3. Payroll Runs
CREATE TABLE public.payroll_runs (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    month_name TEXT NOT NULL, -- e.g., 'October 2026'
    run_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'Paid', 'Failed'
    total_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payroll runs of their org" ON public.payroll_runs FOR SELECT USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_runs.org_id AND organization_users.user_id = auth.uid()));
CREATE POLICY "Users can manage payroll runs of their org" ON public.payroll_runs FOR ALL USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_runs.org_id AND organization_users.user_id = auth.uid()));

-- 4. Payroll Slips (Individual records per staff per run)
CREATE TABLE public.payroll_slips (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.school_teachers(id) ON DELETE CASCADE,
    base_salary NUMERIC(12, 2) NOT NULL,
    allowances NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(12, 2) NOT NULL,
    net_salary NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(run_id, staff_id)
);

-- Enable RLS
ALTER TABLE public.payroll_slips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payroll slips of their org" ON public.payroll_slips FOR SELECT USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_slips.org_id AND organization_users.user_id = auth.uid()));
CREATE POLICY "Users can manage payroll slips of their org" ON public.payroll_slips FOR ALL USING (EXISTS (SELECT 1 FROM public.organization_users WHERE organization_users.org_id = payroll_slips.org_id AND organization_users.user_id = auth.uid()));

-- Function to automatically calculate total amount in a run when a slip is added/updated
CREATE OR REPLACE FUNCTION update_payroll_run_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.payroll_runs
    SET total_amount = (SELECT COALESCE(SUM(net_salary), 0) FROM public.payroll_slips WHERE run_id = NEW.run_id)
    WHERE id = NEW.run_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.payroll_runs
    SET total_amount = (SELECT COALESCE(SUM(net_salary), 0) FROM public.payroll_slips WHERE run_id = OLD.run_id)
    WHERE id = OLD.run_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payroll_run_total
AFTER INSERT OR UPDATE OR DELETE ON public.payroll_slips
FOR EACH ROW EXECUTE FUNCTION update_payroll_run_total();
