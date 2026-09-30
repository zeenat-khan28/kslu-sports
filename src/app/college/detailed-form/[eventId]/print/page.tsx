import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import PrintTrigger from './PrintTrigger'

export const dynamic = 'force-dynamic'

export default async function PrintProformaPage({ params }: { params: { eventId: string } }) {
  const adminDb = createAdminClient()
  
  // We don't have access to standard cookies in a simple server component for auth here if we just want to render data, 
  // but wait, we can just use createClient for auth, then adminDb for data.
  // Actually, let's just fetch it securely.
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: collegeEmail } = await adminDb
    .from('college_emails')
    .select('college_id, colleges(*)')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!collegeEmail?.college_id) redirect('/college/dashboard')
  const collegeId = collegeEmail.college_id
  const college = collegeEmail.colleges as any

  const { data: event } = await adminDb
    .from('sport_events')
    .select('*, sports(*)')
    .eq('id', params.eventId)
    .maybeSingle()

  if (!event) redirect('/college/detailed-form')

  const { data: form } = await adminDb
    .from('detailed_forms')
    .select('*')
    .eq('sport_event_id', event.id)
    .eq('college_id', collegeId)
    .maybeSingle()

  if (!form) redirect('/college/detailed-form')

  const { data: playersData } = await adminDb
    .from('detailed_players')
    .select('*')
    .eq('detailed_form_id', form.id)
    .order('serial_no')

  const players = playersData || []

  // Ensure we have exactly 12 rows for the table
  const displayPlayers = Array.from({ length: 12 }).map((_, i) => {
    return players[i] || {
      serial_no: i + 1,
      full_name: '',
      father_name: '',
      date_of_birth: '',
      qualifying_exam_name: '',
      qualifying_exam_date_year: '',
      hall_ticket_or_fees_receipt_no: '',
      present_class: '',
      present_course: '',
      course_duration: '',
      first_admission_law_university: '',
      first_admission_present_course: '',
      remarks: ''
    }
  })

  // Format dates function
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '1900-01-01') return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB') // DD/MM/YYYY
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 font-sans" style={{ maxWidth: '297mm', margin: '0 auto' }}>
      <PrintTrigger />
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
        {/* Left Logo - using a placeholder standard format, can use absolute KSLU logo if available */}
        <div className="w-24 h-24 flex items-center justify-center">
           {/* Replace with standard KSLU logo later, currently rendering a circle placeholder so it doesn't break */}
           <img src="/kslu-logo.png" alt="KSLU Logo" className="max-w-full max-h-full object-contain fallback-border" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        
        <div className="text-center flex-1 px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Karnataka State Law University</h1>
          <p className="text-lg">Navanagar, Hubballi-580025.</p>
          <p className="text-sm font-semibold mt-1">Accredited 'A' Grade by NAAC</p>
          <p className="text-sm mt-1">Sports Section, Phone 0836-2220024 &nbsp; E-mail: kslu.physicaldirector@gmail.com</p>
        </div>
        
        {/* Right Logo */}
        <div className="w-24 h-24 flex items-center justify-center">
           <img src="/sports-logo.png" alt="Sports Logo" className="max-w-full max-h-full object-contain fallback-border" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold underline">ELIGIBILITY PROFORM FOR INTERCOLLEGIATE TOURNAMENTS 2025-26</h2>
      </div>

      <div className="flex justify-between text-sm mb-6 font-semibold">
        <div className="space-y-2">
          <p>Name of the competition: <span className="underline uppercase">{event.sports.name} ({event.gender})</span></p>
          <p>Organizing College: _________________________</p>
          <p>Date: _________________________</p>
        </div>
        <div className="space-y-2">
          <p>Name of the Manager: _________________________</p>
          <p>Participating College: <span className="underline uppercase">{college.name}</span></p>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse border border-black text-[10px] text-center mb-4">
        <thead>
          <tr>
            <th className="border border-black p-1" rowSpan={2}>Sl.<br/>No.</th>
            <th className="border border-black p-1" rowSpan={2}>Full Name<br/>As per SSLC Marks<br/>card</th>
            <th className="border border-black p-1" rowSpan={2}>Father's Name</th>
            <th className="border border-black p-1" rowSpan={2}>Date of Birth</th>
            <th className="border border-black p-1" colSpan={2}>Date & Year of Passing<br/>Qualifying Examination<br/>for First Admission to a<br/>College/University</th>
            <th className="border border-black p-1" rowSpan={2}>Hall Ticket full<br/>No./Fees<br/>Receipt No.</th>
            <th className="border border-black p-1" rowSpan={2}>Present<br/>Class</th>
            <th className="border border-black p-1" rowSpan={2}>Name of the<br/>Present<br/>Course</th>
            <th className="border border-black p-1" rowSpan={2}>Duration<br/>of<br/>Course</th>
            <th className="border border-black p-1" colSpan={2}>Date & Year of<br/>First Admission to</th>
            <th className="border border-black p-1" rowSpan={2}>Remarks</th>
          </tr>
          <tr>
            <th className="border border-black p-1">Name<br/>of<br/>Exam</th>
            <th className="border border-black p-1">Date & Year</th>
            <th className="border border-black p-1">Law<br/>University</th>
            <th className="border border-black p-1">Present<br/>Course</th>
          </tr>
        </thead>
        <tbody>
          {displayPlayers.map((player, idx) => (
            <tr key={idx} className="h-10">
              <td className="border border-black p-1 font-bold">{String(player.serial_no).padStart(2, '0')}</td>
              <td className="border border-black p-1 uppercase">{player.full_name}</td>
              <td className="border border-black p-1 uppercase">{player.father_name}</td>
              <td className="border border-black p-1 whitespace-nowrap">{formatDate(player.date_of_birth)}</td>
              <td className="border border-black p-1">{player.qualifying_exam_name}</td>
              <td className="border border-black p-1">{player.qualifying_exam_date_year}</td>
              <td className="border border-black p-1">{player.hall_ticket_or_fees_receipt_no}</td>
              <td className="border border-black p-1">{player.present_class}</td>
              <td className="border border-black p-1">{player.present_course}</td>
              <td className="border border-black p-1">{player.course_duration}</td>
              <td className="border border-black p-1 whitespace-nowrap">{formatDate(player.first_admission_law_university)}</td>
              <td className="border border-black p-1 whitespace-nowrap">{formatDate(player.first_admission_present_course)}</td>
              <td className="border border-black p-1">{player.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-center font-bold italic mb-16">
        Certified that above particulars are true as per records of the College. Certified that the above players/participants are not employed on full time basis.
      </p>

      <div className="flex justify-between items-end font-bold text-sm">
        <div>Date:</div>
        <div>College seal</div>
        <div>Physical Education Director</div>
        <div>Director</div>
      </div>
    </div>
  )
}
