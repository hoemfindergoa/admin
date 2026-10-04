'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  )
}
