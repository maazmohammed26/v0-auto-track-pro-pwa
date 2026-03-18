'use client'

import { useState } from 'react'
import { X, FileText, Calendar, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { VehicleDocument, DocumentType } from '@/lib/store'

interface DocumentFormProps {
  vehicleId: string
  onClose: () => void
  editDocument?: VehicleDocument
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'puc', label: 'PUC Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'rc', label: 'Registration (RC)' },
  { value: 'other', label: 'Other' },
]

export function DocumentForm({ vehicleId, onClose, editDocument }: DocumentFormProps) {
  const { addDocument, updateDocument } = useApp()
  const isEdit = !!editDocument

  const [type, setType] = useState<DocumentType>(editDocument?.type ?? 'puc')
  const [title, setTitle] = useState(editDocument?.title ?? '')
  const [expiryDate, setExpiryDate] = useState(editDocument?.expiryDate ?? '')
  const [link, setLink] = useState(editDocument?.link ?? '')
  const [notes, setNotes] = useState(editDocument?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function getDefaultTitle(t: DocumentType): string {
    switch (t) {
      case 'puc': return 'PUC Certificate'
      case 'insurance': return 'Vehicle Insurance'
      case 'rc': return 'Registration Certificate'
      default: return ''
    }
  }

  function handleTypeChange(newType: DocumentType) {
    setType(newType)
    if (!title || documentTypes.some(d => d.value !== 'other' && getDefaultTitle(d.value) === title)) {
      setTitle(getDefaultTitle(newType))
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (link && !isValidUrl(link)) errs.link = 'Please enter a valid URL'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function isValidUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const docData = {
      vehicleId,
      type,
      title: title.trim(),
      expiryDate: expiryDate || undefined,
      link: link.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    if (isEdit && editDocument) {
      updateDocument(editDocument.id, docData)
      toast('Document updated')
    } else {
      addDocument(docData)
      toast('Document added')
    }
    onClose()
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-[2px] p-0">
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom-4 duration-300"
        style={{ boxShadow: 'var(--shadow-clay-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Document' : 'Add Document'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center" aria-label="Close">
            <X size={18} strokeWidth={1.75} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Document Type Chips */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={12} strokeWidth={2} /> Document Type
            </label>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    type === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. PUC Certificate"
              className={`${inputClass} ${errors.title ? 'ring-2 ring-destructive/50' : ''}`}
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} strokeWidth={2} /> Expiry Date <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon size={12} strokeWidth={2} /> Document Link <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className={`${inputClass} ${errors.link ? 'ring-2 ring-destructive/50' : ''}`}
            />
            {errors.link && <p className="text-destructive text-xs mt-1">{errors.link}</p>}
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Add a Google Drive, Dropbox, or other cloud link to your document.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Notes <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.35)' }}
          >
            {isEdit ? 'Update Document' : 'Add Document'}
          </button>
        </form>
      </div>
    </div>
  )
}
