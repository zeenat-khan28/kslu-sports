import { createClient } from '@/lib/supabase/server'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminCollegesPage() {
  const supabase = await createClient()

  // Fetch all colleges and their primary email
  const { data: colleges } = await supabase
    .from('colleges')
    .select(`
      id, 
      name, 
      zone, 
      code,
      college_emails (
        id,
        email
      )
    `)
    .eq('is_active', true)
    .order('name')

  async function addCollege(formData: FormData) {
    'use server'
    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    
    const supabase = await createClient()

    // Insert college
    const { data: college, error: collegeError } = await supabase
      .from('colleges')
      .insert({ code, name, is_active: true })
      .select('id')
      .single()

    if (collegeError || !college) {
      console.error(collegeError)
      return
    }

    // Insert email
    if (email) {
      await supabase.from('college_emails').insert({
        college_id: college.id,
        email: email.toLowerCase(),
        is_primary: true,
        is_active: true
      })
    }
    
    revalidatePath('/admin/colleges')
  }

  async function deleteCollege(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    
    const supabase = await createClient()
    await supabase.from('colleges').delete().eq('id', id)
    revalidatePath('/admin/colleges')
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Colleges Directory</h1>
        <p className="text-[var(--color-muted)] mt-1">Manage and view the list of affiliated law colleges.</p>
      </div>

      {/* Add College Form */}
      <form action={addCollege} className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
        <h2 className="font-bold flex items-center text-[var(--color-kslu-maroon)] mb-4">
           <Plus className="w-4 h-4 mr-2" /> Add New College
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Code</label>
            <input name="code" required className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[var(--color-kslu-saffron)]" placeholder="e.g. 101" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">College Name</label>
            <input name="name" required className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[var(--color-kslu-saffron)]" placeholder="Full College Name" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Primary Email</label>
            <input name="email" type="email" required className="w-full px-3 py-2 border rounded focus:outline-none focus:border-[var(--color-kslu-saffron)]" placeholder="principal@college.edu" />
          </div>
        </div>
        <button type="submit" className="bg-[var(--color-kslu-green)] text-white px-6 py-2 rounded font-bold hover:bg-[#164229] transition-colors">
          Add College
        </button>
      </form>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-gray-50 flex items-center justify-between">
           <h2 className="font-bold flex items-center text-[var(--color-kslu-maroon)]">
              <Building2 className="w-5 h-5 mr-2" />
              {colleges?.length || 0} Registered Colleges
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-[var(--color-border)]">
                <th className="p-4 font-bold text-[var(--color-text)] w-16">Code</th>
                <th className="p-4 font-bold text-[var(--color-text)]">College Name</th>
                <th className="p-4 font-bold text-[var(--color-text)]">Primary Email</th>
                <th className="p-4 font-bold text-[var(--color-text)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges?.map(college => (
                <tr key={college.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-[var(--color-muted)]">{college.code || '-'}</td>
                  <td className="p-4 font-medium text-[var(--color-text)] max-w-md truncate" title={college.name}>{college.name}</td>
                  <td className="p-4 text-[var(--color-muted)]">
                    {college.college_emails?.[0]?.email || <span className="text-[var(--color-warning)] italic">No email</span>}
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteCollege}>
                      <input type="hidden" name="id" value={college.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded" title="Delete College">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
