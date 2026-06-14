import { create } from 'zustand'
import { Athlete } from '../types/athlete'

interface SelectionState {
  selectedAthletes: Athlete[]
  addAthlete: (athlete: Athlete) => void
  removeAthlete: (id: number) => void
  clearSelection: () => void
  setSelection: (athletes: Athlete[]) => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedAthletes: [],
  addAthlete: (athlete) =>
    set((state) => ({
      selectedAthletes: state.selectedAthletes.some((a) => a.id === athlete.id)
        ? state.selectedAthletes
        : [...state.selectedAthletes, athlete],
    })),
  removeAthlete: (id) =>
    set((state) => ({
      selectedAthletes: state.selectedAthletes.filter((a) => a.id !== id),
    })),
  clearSelection: () => set({ selectedAthletes: [] }),
  setSelection: (athletes) => set({ selectedAthletes: athletes }),
}))