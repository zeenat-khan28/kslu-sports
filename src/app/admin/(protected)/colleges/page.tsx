import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Building2, Plus, Trash2, Pencil } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminCollegesPage() {
  // Verify user is admin via cookie-based auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Use service role client to bypass RLS for data fetching
  const adminDb = createAdminClient()

  // Fetch all colleges and their primary email
  const { data: colleges, error } = await adminDb
    .from('colleges')
    .select(`
      id, 
      name, 
      code,
      status,
      is_active,
      college_emails (
        id,
        email,
        is_primary
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching colleges:', error)
  }

  async function addCollege(formData: FormData) {
    'use server'
    const code = formData.get('code') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    
    const adminDb = createAdminClient()

    // Insert college
    const { data: college, error: collegeError } = await adminDb
      .from('colleges')
      .insert({ code, name, is_active: true, status: 'active' })
      .select('id')
      .single()

    if (collegeError || !college) {
      console.error('Error adding college:', collegeError)
      return
    }

    // Insert email
    if (email) {
      const { error: emailError } = await adminDb.from('college_emails').insert({
        college_id: college.id,
        email: email.toLowerCase(),
        is_primary: true,
        is_active: true
      })
      if (emailError) console.error('Error adding email:', emailError)
    }
    
    revalidatePath('/admin/colleges')
  }

  async function deleteCollege(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('colleges').delete().eq('id', id)
    if (error) console.error('Error deleting college:', error)
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 border-b border-[var(--color-border)]">
                <th className="p-3 font-bold text-[var(--color-text)] w-20">#</th>
                <th className="p-3 font-bold text-[var(--color-text)] w-20">Code</th>
                <th className="p-3 font-bold text-[var(--color-text)]">College Name</th>
                <th className="p-3 font-bold text-[var(--color-text)]">Primary Email</th>
                <th className="p-3 font-bold text-[var(--color-text)] w-20">Status</th>
                <th className="p-3 font-bold text-[var(--color-text)] text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges && colleges.length > 0 ? (
                colleges.map((college, idx) => (
                  <tr key={college.id} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                    <td className="p-3 text-xs text-[var(--color-muted)]">{idx + 1}</td>
                    <td className="p-3 font-medium text-[var(--color-muted)]">{college.code || '-'}</td>
                    <td className="p-3 font-medium text-[var(--color-text)]" title={college.name}>
                      <span className="block max-w-md truncate">{college.name}</span>
                    </td>
                    <td className="p-3 text-[var(--color-muted)] text-xs">
                      {(college.college_emails as any)?.[0]?.email || <span className="text-[var(--color-warning)] italic">No email</span>}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        college.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {college.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <form action={deleteCollege} className="inline">
                        <input type="hidden" name="id" value={college.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded" title="Delete College">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-muted)]">
                    {error ? `Error loading colleges: ${error.message}` : 'No colleges found. Add one above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
