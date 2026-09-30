// This layout is intentionally minimal.
// Auth + redirect is handled in app/crm/page.tsx
// and app/crm/[workspaceId]/layout.tsx (which renders CrmShell).
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
