-- Apply after schema_crm.sql to restrict CRM members to records assigned to them.
-- Workspace owners and sales managers retain access to all records.
create or replace function public.crm_can_manage_record(target_workspace_id uuid, target_owner_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.crm_can_access_workspace(target_workspace_id)
    and (
      public.crm_is_workspace_manager(target_workspace_id)
      or target_owner_user_id = auth.uid()
    );
$$;

revoke all on function public.crm_can_manage_record(uuid, uuid) from public;
grant execute on function public.crm_can_manage_record(uuid, uuid) to authenticated;
