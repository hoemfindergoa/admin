import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { PrintButton } from '@/components/print-button'

export default async function AdmissionTemplatePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase.from('organizations').select('name, logo_url').eq('id', orgId).single()
  if (!org) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">
      <div className="w-full max-w-[210mm] mx-auto bg-white p-12 shadow-xl print:shadow-none print:p-0">
        <div className="flex justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Admission Form Template</h1>
            <p className="text-sm text-zinc-500">Press Ctrl+P (or Cmd+P) to print or save as PDF.</p>
          </div>
          <PrintButton />
        </div>

        {/* Paper Form Layout */}
        <div className="border-4 border-double border-zinc-300 p-8">
          <div className="text-center mb-8 border-b-2 border-zinc-900 pb-6 flex flex-col items-center">
            {org.logo_url && <img src={org.logo_url} alt="Logo" className="h-20 mb-3" />}
            <h1 className="text-3xl font-black uppercase tracking-widest">{org.name}</h1>
            <h2 className="text-xl font-bold mt-2 tracking-widest text-zinc-700">ADMISSION APPLICATION FORM</h2>
            <div className="flex justify-between w-full mt-6 text-sm font-bold">
              <div>Serial No: .......................</div>
              <div>Date: ...../...../20.....</div>
            </div>
          </div>

          <div className="absolute top-48 right-12 w-28 h-36 border-2 border-dashed border-zinc-400 flex items-center justify-center text-xs text-center text-zinc-400 p-2 font-semibold">
            Paste Recent Passport Size Photograph
          </div>

          <div className="space-y-8 text-sm">
            {/* Section 1 */}
            <div>
              <h3 className="bg-zinc-200 px-3 py-1 font-bold uppercase tracking-wider mb-4 border border-zinc-300">1. Personal Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-48">Student Name:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Date of Birth:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Gender:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Religion:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Category:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Nationality:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Place of Birth:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Blood Group:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Caste:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-48">Identity Mark:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Aadhar No:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">PEN No (UDISE):</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Apaar ID:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Student Code:</span>
                  <span className="flex-1"></span>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="bg-zinc-200 px-3 py-1 font-bold uppercase tracking-wider mb-4 border border-zinc-300">2. Educational Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-40">Class of Admission:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-40">Previous Class:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-48">Last Institute Attended:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-40">Previous Percentage:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-40">Special Needs:</span>
                  <span className="flex-1"></span>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="bg-zinc-200 px-3 py-1 font-bold uppercase tracking-wider mb-4 border border-zinc-300">3. Parents Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Father's Name:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Mobile Number:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Occupation:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Qualification:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Email:</span>
                  <span className="flex-1"></span>
                </div>
                
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 mt-2 flex">
                  <span className="font-bold mr-2 w-32">Mother's Name:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Mobile Number:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Occupation:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Qualification:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Email:</span>
                  <span className="flex-1"></span>
                </div>

                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 mt-2 flex">
                  <span className="font-bold mr-2 w-32">Family Income:</span>
                  <span className="flex-1"></span>
                </div>
              </div>
            </div>

            {/* Print break could go here for multiple pages, but we'll try to fit it on one or let browser handle it */}
            
            {/* Section 4 */}
            <div>
              <h3 className="bg-zinc-200 px-3 py-1 font-bold uppercase tracking-wider mb-4 border border-zinc-300 mt-6">4. Address & Guardian</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-36">House No / Ward No:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-20">Village:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-24">Post Office:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-20">Block:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-24">Police Station:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-20">District:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-24">State:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-20">Pin Code:</span>
                  <span className="flex-1"></span>
                </div>

                {/* Guardian */}
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 mt-2 flex">
                  <span className="font-bold mr-2 w-32">Guardian Name:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-32">Guardian Mobile:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-36">Guardian Occupation:</span>
                  <span className="flex-1"></span>
                </div>

                {/* Emergency Contact */}
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 mt-2 flex">
                  <span className="font-bold mr-2 w-40">Emergency Contact Name:</span>
                  <span className="flex-1"></span>
                </div>
                <div className="col-span-2 border-b border-dotted border-zinc-400 pb-1 flex">
                  <span className="font-bold mr-2 w-40">Emergency Mobile:</span>
                  <span className="flex-1"></span>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="mt-12 pt-6">
               <h3 className="font-bold uppercase tracking-wider mb-2 text-md">Declaration</h3>
               <p className="text-xs leading-relaxed text-zinc-600 text-justify">
                  I hereby declare that all the information provided above is true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, the admission is liable to be cancelled. I agree to abide by all the rules and regulations of the institution.
               </p>
               
               <div className="flex justify-between mt-20 px-8">
                  <div className="text-center">
                     <div className="w-48 border-b border-zinc-800 mb-2"></div>
                     <p className="font-bold text-xs uppercase">Signature of Parent/Guardian</p>
                  </div>
                  <div className="text-center">
                     <div className="w-48 border-b border-zinc-800 mb-2"></div>
                     <p className="font-bold text-xs uppercase">Signature of Principal/Head</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
