import { create } from "zustand";
import { PfPlanDailies } from "../models/pfplan_model";

interface PfPlanDailiesState {
  days: PfPlanDailies[];
  setDay: (day: PfPlanDailies) => void;
  removeDay: (id: number) => void;
}

const usePfPlanDailiesStore = create<PfPlanDailiesState>((set) => ({
  days: [],

  setDay: (newDay) =>
    set((state) => ({
      days: state.days.some((day) => day.day === newDay.day)
        ? state.days.map((day) => (day.day === newDay.day ? newDay : day))
        : [...state.days, newDay],
    })),
    
  removeDay: (id: number) =>
    set((state) => {
      // Remove the day with the specified id
      const updatedDays = state.days.filter((day) => day.day !== id);

      // Reassign the ids sequentially starting from 1
      const reindexedDays = updatedDays.map((day, index) => ({
        ...day,
        day: index + 1,
      }));

      return { days: reindexedDays };
    }),
}));

export { usePfPlanDailiesStore };

