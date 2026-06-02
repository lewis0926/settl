export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paidBy: string
}

export type Step = 'setup' | 'expenses' | 'settlement'

export interface AppState {
  step: Step
  people: string[]
  weights: Record<string, number>
  expenses: Expense[]
  multiCurrency: boolean
  rates: Record<string, number>
  ratesUpdated: number
  settleCurrency: string
}

export interface Transfer {
  from: string
  to: string
  amount: number
}
