'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const fields = [
  { name: 'franchise_month', label: 'Month', type: 'text', placeholder: 'e.g. April' },
  { name: 'franchise_year', label: 'Year', type: 'number', placeholder: 'e.g. 2026' },
  { name: 'payment_date', label: 'Payment Date', type: 'date' },
  { name: 'model', label: 'Model', type: 'text' },
  { name: 'closure_by', label: 'Closure By', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'authorization_code', label: 'Authorization Code', type: 'text' },
  { name: 'client_name', label: 'Client Name', type: 'text' },
  { name: 'client_number', label: 'Client Number', type: 'tel' },
  { name: 'franchise_fee', label: 'Franchise Fee', type: 'number', step: '0.01', min: '0' },
  { name: 'gst', label: 'GST', type: 'number', step: '0.01', min: '0' },
  { name: 'total_franchise_fee', label: 'Total Franchise Fee', type: 'number', step: '0.01', min: '0' },
  { name: 'amount_received', label: 'Amount Received', type: 'number', step: '0.01', min: '0' },
  { name: 'confirmation', label: 'Confirmation', type: 'text' },
  { name: 'transaction_details', label: 'Transaction Details', type: 'text' },
  { name: 'incentive_amount', label: 'Incentive Amount', type: 'number', step: '0.01', min: '0' },
  { name: 'transaction_date', label: 'Transaction Date', type: 'date' },
  { name: 'manager_name', label: 'Manager Name', type: 'text' },
  { name: 'manager_amount', label: 'Manager Amount', type: 'number', step: '0.01', min: '0' },
] as const

type FranchiseCommercialFieldsProps = {
  values?: object
  disabled?: boolean
  idPrefix: string
}

export function FranchiseCommercialFields({ values, disabled, idPrefix }: FranchiseCommercialFieldsProps) {
  return (
    <section className="space-y-4 rounded-xl border border-zinc-200/60 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Franchise &amp; payment details</h3>
        <p className="mt-1 text-xs text-zinc-500">Optional information you can review or update at any time.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `${idPrefix}-${field.name}`
          const value = (values as Record<string, string | number | null | undefined> | undefined)?.[field.name]
          return (
            <div key={field.name} className="min-w-0 space-y-1.5">
              <Label htmlFor={id} className="text-xs font-medium text-zinc-600">{field.label}</Label>
              <Input
                id={id}
                name={field.name}
                type={field.type}
                {...('step' in field ? { step: field.step, min: field.min } : {})}
                placeholder={'placeholder' in field ? field.placeholder : undefined}
                defaultValue={value == null ? '' : String(value)}
                disabled={disabled}
                className="h-10"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
