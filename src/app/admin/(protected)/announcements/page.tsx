import { createAdminClient } from '@/lib/supabase/admin'
import { Bell, Megaphone, Plus, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const supabase = createAdminClient()

  // Fetch announcements
  const { data: announcements } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  // Server action to create
  async function createAnnouncement(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    
    const adminDb = createAdminClient()
    await adminDb.from('notifications').insert({
      title,
      body,
      type: 'manual',
      audience: 'public'
    })
    revalidatePath('/admin/announcements')
  }

  // Server action to delete
  async function deleteAnnouncement(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    
    const adminDb = createAdminClient()
    await adminDb.from('notifications').delete().eq('id', id)
    revalidatePath('/admin/announcements')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Announcements</h1>
          <p className="text-[var(--color-muted)] mt-1">Broadcast messages to all college dashboards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-1">
          <form action={createAnnouncement} className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm space-y-4">
            <h2 className="font-bold flex items-center text-[var(--color-kslu-maroon)] mb-4">
               <Plus className="w-4 h-4 mr-2" /> New Announcement
            </h2>
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input name="title" required className="w-full px-3 py-2 border rounded" placeholder="e.g. Schedule Update" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Message</label>
              <textarea name="body" required className="w-full px-3 py-2 border rounded h-24" placeholder="Type your message here..."></textarea>
            </div>
            <button type="submit" className="w-full bg-[var(--color-kslu-green)] text-white py-2 rounded font-bold hover:bg-[#164229]">
              Publish Now
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          {announcements?.length === 0 ? (
            <div className="p-8 text-center border rounded bg-gray-50 text-gray-500">
              <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No announcements published yet.
            </div>
          ) : (
            announcements?.map(ann => (
              <div key={ann.id} className="bg-white p-5 rounded-lg border border-[var(--color-border)] shadow-sm flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mt-1 mr-4 bg-orange-100 p-2 rounded-full text-orange-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text)]">{ann.title}</h3>
                    <p className="text-sm text-[var(--color-muted)] mt-1 whitespace-pre-wrap">{ann.body}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(ann.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={ann.id} />
                  <button type="submit" className="text-red-500 hover:text-red-700 p-2" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
