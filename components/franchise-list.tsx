'use client'

import { useState } from 'react'
import { Building2, Plus, Search, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateFranchiseSheet } from '@/components/create-franchise-sheet'
import { EditFranchiseSheet } from '@/components/edit-franchise-sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function FranchiseList({ allOrgs, ownedOrgIds }: { allOrgs: any[], ownedOrgIds: string[] }) {
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('ALL')

  const filteredOrgs = allOrgs.filter(org => {
    const matchesSearch = 
      org.name?.toLowerCase().includes(search.toLowerCase()) || 
      org.course_type?.toLowerCase().includes(search.toLowerCase()) ||
      org.email?.toLowerCase().includes(search.toLowerCase()) ||
      org.phone?.toLowerCase().includes(search.toLowerCase())

    const matchesBrand = brandFilter === 'ALL' || org.franchise_brand === brandFilter

    return matchesSearch && matchesBrand
  })

  // Extract unique brands for the filter dropdown
  const uniqueBrands = Array.from(new Set(allOrgs.map(org => org.franchise_brand).filter(Boolean))) as string[]

  if (allOrgs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50 shadow-sm mt-8">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm ring-1 ring-zinc-200">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">No franchises yet</h2>
          <p className="text-[14px] text-zinc-500 mt-2 max-w-sm font-medium">
            You haven't created any school franchises yet. Create your first organization to access the management dashboard.
          </p>
          <div className="mt-6">
            <CreateFranchiseSheet
              trigger={
                <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors rounded-full font-semibold px-6">
                  <Plus className="w-5 h-5" />
                  Create your first Franchise
                </Button>
              }
            />
          </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search by name, email, phone or course type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-zinc-200 h-10 shadow-sm rounded-xl focus-visible:ring-indigo-500"
          />
        </div>
        
        {uniqueBrands.length > 0 && (
          <div className="w-full sm:w-auto">
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-[220px] bg-white h-10 rounded-xl shadow-sm border-zinc-200 font-medium">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-zinc-400" />
                  <SelectValue placeholder="Filter by Brand" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {filteredOrgs.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 bg-white border border-zinc-200 rounded-2xl border-dashed">
          <p className="font-medium text-[15px]">No franchises found matching "{search}" {brandFilter !== 'ALL' && `and brand "${brandFilter}"`}</p>
          <Button variant="link" onClick={() => { setSearch(''); setBrandFilter('ALL'); }} className="mt-2 text-indigo-600">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org: any) => {
            const userOwnsOrg = ownedOrgIds.includes(org.id)
            return (
              <div key={org.id} className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all overflow-hidden group">
                <div className="flex flex-row items-start justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
                  <div className="flex items-center gap-3 w-full">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white ring-1 ring-zinc-200/50 p-0.5" />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center ring-1 ring-zinc-200/50">
                        <Building2 className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex flex-col">
                        <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight leading-tight">{org.name}</h3>
                        {org.franchise_brand && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                              {org.franchise_brand}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-zinc-500 mt-1">{org.course_type} • {org.affiliation || 'No Affiliation'}</p>
                    </div>
                  </div>
                  {userOwnsOrg && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditFranchiseSheet org={org} />
                    </div>
                  )}
                </div>
                <div className="flex-1 px-6 py-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Email</span>
                      <p className="font-semibold text-zinc-700 truncate" title={org.email || ''}>{org.email || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Phone</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.phone || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Session Start</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.session_start_date || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Session End</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.session_end_date || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
                  <Link href={`/dashboard/${org.id}`} className="w-full">
                    <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors font-semibold rounded-xl shadow-sm">
                      Open Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
