import { useState, useRef, useEffect } from 'react'
import AddPersonModal from './AddPersonModal.tsx'

interface Props {
  people: string[]
  value: string
  onChange: (person: string) => void
  onAddPerson: (name: string) => void
}

export default function PaidBySelect({ people, value, onChange, onAddPerson }: Props) {
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  function handleAddPerson(name: string) {
    onAddPerson(name)
    onChange(name)
    setShowModal(false)
  }

  return (
    <>
      <div className="paid-select" ref={ref}>
        <button
          type="button"
          className={`paid-select-trigger${open ? ' open' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <span className={value ? '' : 'placeholder'}>{value || 'Select person'}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div className="paid-select-menu">
            {people.length > 0 && (
              <ul className="paid-select-options">
                {people.map(p => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`paid-select-option${p === value ? ' selected' : ''}`}
                      onClick={() => { onChange(p); setOpen(false) }}
                    >
                      {p}
                      {p === value && <span className="check">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="paid-select-add"
              onClick={() => { setOpen(false); setShowModal(true) }}
            >
              <span className="add-icon">+</span> Add new person
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddPersonModal
          onAdd={handleAddPerson}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
