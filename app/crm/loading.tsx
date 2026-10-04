import { Loader2 } from 'lucide-react'

export default function CrmLoading() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 absolute inset-0 z-50">
      {/* Sidebar Skeleton */}
      <div className="hidden border-r border-slate-200 bg-white md:flex md:w-[260px] p-4 flex-col gap-4">
        <div className="flex items-center gap-2 mb-8 mt-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse shrink-0" />
          <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse" />
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse" />
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse" />
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse" />
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse mt-8" />
          <div className="h-9 w-full rounded-md bg-slate-100 animate-pulse" />
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-14 items-center border-b border-slate-200 bg-white px-6 gap-4">
          <div className="h-5 w-48 rounded bg-slate-200 animate-pulse hidden sm:block" />
          <div className="ml-auto flex items-center gap-3">
            <div className="h-8 w-24 rounded-md bg-slate-200 animate-pulse hidden sm:block" />
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-48 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-8 w-24 rounded-md bg-slate-200 animate-pulse ml-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            <div className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            <div className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium animate-pulse">Loading CRM Workspace...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
