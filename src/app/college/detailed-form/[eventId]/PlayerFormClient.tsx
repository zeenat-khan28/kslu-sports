'use client'

import { useState } from 'react'
import { Save, Upload, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PlayerData = {
  id?: string
  serial_no: number
  full_name: string
  father_name: string
  date_of_birth: string
  qualifying_exam_name: string
  qualifying_exam_date_year: string
  hall_ticket_or_fees_receipt_no: string
  present_class: string
  present_course: string
  course_duration: string
  first_admission_law_university: string
  first_admission_present_course: string
  remarks: string
}

const emptyPlayer = (serial: number): PlayerData => ({
  serial_no: serial,
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
})

export default function PlayerFormClient({ 
  eventId, 
  collegeId, 
  existingForm, 
  existingPlayers = [],
  isLocked = false
}: { 
  eventId: string
  collegeId: string
  existingForm: any
  existingPlayers: PlayerData[]
  isLocked?: boolean
}) {
  const supabase = createClient()
  
  const [players, setPlayers] = useState<PlayerData[]>(
    existingPlayers.length > 0 
      ? existingPlayers.sort((a, b) => a.serial_no - b.serial_no).map(p => ({
          ...p,
          date_of_birth: p.date_of_birth === '1900-01-01' ? '' : p.date_of_birth,
          first_admission_law_university: p.first_admission_law_university === '1900-01-01' ? '' : p.first_admission_law_university,
          first_admission_present_course: p.first_admission_present_course === '1900-01-01' ? '' : p.first_admission_present_course
        }))
      : Array.from({ length: 4 }).map((_, i) => emptyPlayer(i + 1))
  )
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const updatePlayer = (index: number, field: keyof PlayerData, value: string) => {
    if (isLocked) return
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const addRow = () => {
    if (players.length >= 12 || isLocked) return
    setPlayers([...players, emptyPlayer(players.length + 1)])
  }

  const removeRow = (index: number) => {
    if (players.length <= 1 || isLocked) return
    const newPlayers = players.filter((_, i) => i !== index).map((p, i) => ({ ...p, serial_no: i + 1 }))
    setPlayers(newPlayers)
  }

  const handleSave = async (isFinalSubmit: boolean = false) => {
    setSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      // 1. Create or update detailed_form
      let formId = existingForm?.id
      if (!formId) {
         const { data: form, error: formError } = await supabase
           .from('detailed_forms')
           .insert({
              college_id: collegeId,
              sport_event_id: eventId,
              status: isFinalSubmit ? 'submitted' : 'draft',
              reference_no: `KSLU-${collegeId.split('-')[0]}-${eventId.split('-')[0]}`.toUpperCase()
           })
           .select('id')
           .single()
           
         if (formError) throw formError
         formId = form.id
      } else {
         const { error: formError } = await supabase
           .from('detailed_forms')
           .update({
              status: isFinalSubmit ? 'submitted' : 'draft',
              submitted_at: isFinalSubmit ? new Date().toISOString() : null
           })
           .eq('id', formId)
           
         if (formError) throw formError
      }

      // Filter out completely empty rows (if full_name is empty, consider row empty)
      const validPlayers = players.filter(p => p.full_name.trim() !== '')

      // If final submit, validate required fields
      if (isFinalSubmit) {
        for (let i = 0; i < validPlayers.length; i++) {
          const p = validPlayers[i]
          if (!p.date_of_birth || !p.first_admission_law_university || !p.first_admission_present_course || !p.father_name || !p.qualifying_exam_name) {
             throw new Error(`Row ${p.serial_no} is incomplete. All date fields, name, and exam details must be filled for Final Submit.`)
          }
        }
        if (validPlayers.length === 0) {
            throw new Error(`You must add at least 1 player to Final Submit.`)
        }
      }

      // 2. Delete existing players and re-insert
      await supabase.from('detailed_players').delete().eq('detailed_form_id', formId)

      if (validPlayers.length > 0) {
        const payload = validPlayers.map(p => ({
          ...p,
          date_of_birth: p.date_of_birth || '1900-01-01',
          first_admission_law_university: p.first_admission_law_university || '1900-01-01',
          first_admission_present_course: p.first_admission_present_course || '1900-01-01',
          detailed_form_id: formId,
          id: undefined // Let DB generate new UUIDs
        }))

        const { error: playersError } = await supabase.from('detailed_players').insert(payload)
        if (playersError) throw playersError
      }

      setSaveStatus('success')
      if (isFinalSubmit) {
         window.location.reload()
      } else {
         setTimeout(() => setSaveStatus('idle'), 3000)
      }

    } catch (err: any) {
      console.error(err)
      setSaveStatus('error')
      setErrorMessage(err.message || 'An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 border border-[var(--color-border)] rounded-lg shadow-sm">
        <div>
          {saveStatus === 'success' && <span className="text-[var(--color-success)] font-bold text-sm">Successfully saved.</span>}
          {saveStatus === 'error' && <span className="text-[var(--color-danger)] font-bold text-sm">Error: {errorMessage}</span>}
          {isLocked && <span className="text-[var(--color-warning)] font-bold text-sm">Form is finalized and locked.</span>}
        </div>
        
        <div className="flex space-x-3">
          {!isLocked && (
            <>
              <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 border border-[var(--color-border)] rounded bg-white font-bold text-[var(--color-text)] flex items-center hover:bg-gray-50 disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-[var(--color-kslu-green)] text-white rounded font-bold flex items-center hover:bg-[#164229] disabled:opacity-50">
                <Upload className="w-4 h-4 mr-2" /> Final Submit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-100 border-b border-[var(--color-border)]">
              <th className="p-2 border-r text-center w-10">Sl.<br/>No.</th>
              <th className="p-2 border-r min-w-[150px]">Full Name<br/><span className="font-normal text-[10px]">(As per SSLC)</span></th>
              <th className="p-2 border-r min-w-[120px]">Father's Name</th>
              <th className="p-2 border-r w-[100px]">Date of Birth</th>
              <th className="p-2 border-r min-w-[150px]">Qualifying Exam<br/><span className="font-normal text-[10px]">(Name | Date & Year)</span></th>
              <th className="p-2 border-r w-[100px]">Receipt No.</th>
              <th className="p-2 border-r w-[100px]">Present Class</th>
              <th className="p-2 border-r w-[120px]">Course Name & Duration</th>
              <th className="p-2 border-r min-w-[150px]">1st Admission Date<br/><span className="font-normal text-[10px]">(Law Uni | Present Course)</span></th>
              <th className="p-2 min-w-[100px]">Remarks</th>
              {!isLocked && <th className="p-2 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} className="border-b border-[var(--color-border)] hover:bg-gray-50/50">
                <td className="p-2 border-r text-center font-bold text-gray-500">{player.serial_no}</td>
                <td className="p-1 border-r">
                  <input type="text" disabled={isLocked} value={player.full_name} onChange={(e) => updatePlayer(index, 'full_name', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Full Name" />
                </td>
                <td className="p-1 border-r">
                  <input type="text" disabled={isLocked} value={player.father_name} onChange={(e) => updatePlayer(index, 'father_name', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Father's Name" />
                </td>
                <td className="p-1 border-r">
                  <input type="date" disabled={isLocked} value={player.date_of_birth} onChange={(e) => updatePlayer(index, 'date_of_birth', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" />
                </td>
                <td className="p-1 border-r space-y-1">
                  <input type="text" disabled={isLocked} value={player.qualifying_exam_name} onChange={(e) => updatePlayer(index, 'qualifying_exam_name', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Exam Name" />
                  <input type="text" disabled={isLocked} value={player.qualifying_exam_date_year} onChange={(e) => updatePlayer(index, 'qualifying_exam_date_year', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Date & Year" />
                </td>
                <td className="p-1 border-r">
                  <input type="text" disabled={isLocked} value={player.hall_ticket_or_fees_receipt_no} onChange={(e) => updatePlayer(index, 'hall_ticket_or_fees_receipt_no', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Receipt #" />
                </td>
                <td className="p-1 border-r">
                  <input type="text" disabled={isLocked} value={player.present_class} onChange={(e) => updatePlayer(index, 'present_class', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Class" />
                </td>
                <td className="p-1 border-r space-y-1">
                  <input type="text" disabled={isLocked} value={player.present_course} onChange={(e) => updatePlayer(index, 'present_course', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Course Name" />
                  <input type="text" disabled={isLocked} value={player.course_duration} onChange={(e) => updatePlayer(index, 'course_duration', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Duration" />
                </td>
                <td className="p-1 border-r space-y-1">
                  <input type="date" disabled={isLocked} value={player.first_admission_law_university} onChange={(e) => updatePlayer(index, 'first_admission_law_university', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" title="Law University Admission" />
                  <input type="date" disabled={isLocked} value={player.first_admission_present_course} onChange={(e) => updatePlayer(index, 'first_admission_present_course', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" title="Present Course Admission" />
                </td>
                <td className="p-1">
                  <input type="text" disabled={isLocked} value={player.remarks} onChange={(e) => updatePlayer(index, 'remarks', e.target.value)} className="w-full p-1 border rounded focus:ring-1 focus:outline-none" placeholder="Remarks" />
                </td>
                {!isLocked && (
                  <td className="p-1 text-center">
                    <button onClick={() => removeRow(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {!isLocked && players.length < 12 && (
          <div className="p-4 border-t border-[var(--color-border)] bg-gray-50">
             <button onClick={addRow} className="flex items-center text-sm font-bold text-[var(--color-kslu-maroon)] hover:underline">
               <Plus className="w-4 h-4 mr-1" /> Add Player Row
             </button>
          </div>
        )}
      </div>
    </div>
  )
}
