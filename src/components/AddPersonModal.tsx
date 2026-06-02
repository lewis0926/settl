import { useState, useRef, useEffect } from 'react'

interface Props {
  onAdd: (name: string) => void
  onClose: () => void
}

export default function AddPersonModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
  }

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card">
        <h3 className="modal-title">Add person</h3>
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder="e.g. Alice"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          maxLength={40}
        />
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim()}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
