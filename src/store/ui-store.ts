import { create } from "zustand";
import { startOfDay } from "date-fns";

interface UiState {
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}

const now = new Date();
const initialDate = startOfDay(now);
const isServer = typeof window === "undefined";
console.log(isServer ? "[ui-store SERVER]" : "[ui-store CLIENT]", {
  now: now.toISOString(),
  initialSelectedDate: initialDate.toISOString(),
});

export const useUiStore = create<UiState>((set) => ({
  selectedDate: initialDate,
  setSelectedDate: (d) => set({ selectedDate: startOfDay(d) }),
}));
