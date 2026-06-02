import { createContext, useContext } from 'react'
import type { AppState } from '../types.ts'
import { useLocalStorage } from '../hooks/useLocalStorage.ts'

interface AppContextValue {
  state: AppState
  patch: (partial: Partial<AppState>) => void
  reset: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEFAULT_STATE: AppState = {
  step: 'setup',
  people: [],
  weights: {},
  expenses: [],
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('settl-state', DEFAULT_STATE)

  function patch(partial: Partial<AppState>) {
    setState(prev => ({ ...prev, ...partial }))
  }

  function reset() {
    setState(DEFAULT_STATE)
  }

  return (
    <AppContext.Provider value={{ state, patch, reset }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
