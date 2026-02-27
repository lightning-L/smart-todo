import { create } from "zustand";
import { startOfDay } from "date-fns";

interface UiState {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedDate: startOfDay(new Date()),
  setSelectedDate: (d) => set({ selectedDate: startOfDay(d) }),
}));
