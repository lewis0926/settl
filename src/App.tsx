import type { AppState } from './types.ts'
import { useLocalStorage } from './hooks/useLocalStorage.ts'
import { useTheme } from './hooks/useTheme.ts'
import ExpenseList from './components/ExpenseList.tsx'
import Settlement from './components/Settlement.tsx'
import logoUrl from './assets/logo.svg'

const DEFAULT_STATE: AppState = {
  step: 'expenses',
  people: [],
  expenses: [],
}

export default function App() {
  const [state, setState] = useLocalStorage<AppState>('settl-state', DEFAULT_STATE)
  const { theme, toggle } = useTheme()

  function patch(partial: Partial<AppState>) {
    setState({ ...state, ...partial })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <a className="logo" href="#" onClick={() => patch({ step: 'expenses' })} aria-label="$ettl">
            <img src={logoUrl} alt="$ettl" height="22" />
          </a>
          <span className="logo-tag">bill splitter</span>
        </div>
        <button className="theme-toggle" onClick={toggle} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              LIGHT
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              DARK
            </>
          )}
        </button>
      </header>

      <main className="app-main">
        {state.step === 'expenses' && (
          <ExpenseList
            people={state.people}
            expenses={state.expenses}
            onPeople={people => patch({ people })}
            onExpenses={expenses => patch({ expenses })}
            onNext={() => patch({ step: 'settlement' })}
          />
        )}
        {state.step === 'settlement' && (
          <Settlement
            people={state.people}
            expenses={state.expenses}
            onBack={() => patch({ step: 'expenses' })}
            onReset={() => setState(DEFAULT_STATE)}
          />
        )}
      </main>

      <footer className="app-footer">
        No signup · No backend · Data stays in your browser
      </footer>
    </div>
  )
}
