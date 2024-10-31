import { create } from "zustand";
import { ExerciseModel } from "../models/exercise_model";
import { PatientModel } from "../models/patient_model";
import { PfPlanDailies } from "../models/pfplan_model";
import { WorkoutModel } from "../models/workout_model";

interface PfPlanDailiesState {
  days: PfPlanDailies[];
  setDay: (day: PfPlanDailies) => void;
  removeDay: (id: number) => void;
  setDays: (days: PfPlanDailies[]) => void;
  selectedDay: PfPlanDailies | null;
  setSelectedDay: (day: PfPlanDailies | null) => void;
}

const usePfPlanDailiesStore = create<PfPlanDailiesState>((set) => ({
  days: [],

  setDay: (newDay) =>
    set((state) => ({
      days: state.days.some((day) => day.day === newDay.day)
        ? state.days.map((day) => (day.day === newDay.day ? newDay : day))
        : [...state.days, newDay],
    })),

  removeDay: (id) =>
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

  setDays: (newDays) => set(() => ({ days: newDays })),
  selectedDay: null,
  setSelectedDay: (day) => set(() => ({ selectedDay: day })),
}));

interface ToggleState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const useToggle = create<ToggleState>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set(() => ({ isOpen: open })),
}));

interface ActionMenuState {
  patient: PatientModel | null;
  setPatient: (patient: PatientModel | null) => void;
  exercise: ExerciseModel | null;
  setExercise: (exercise: ExerciseModel | null) => void;
  workout: WorkoutModel | null;
  setWorkout: (workout: WorkoutModel | null) => void;
  editUrl: string;
  setEditUrl: (url: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const useActionMenuStore = create<ActionMenuState>((set) => ({
  patient: null,
  exercise: null,
  workout: null,
  editUrl: "",
  isOpen: false,
  setPatient: (state) => set(() => ({ patient: state })),
  setExercise: (state) => set(() => ({ exercise: state })),
  setWorkout: (state) => set(() => ({ workout: state })),
  setEditUrl: (state) => set(() => ({ editUrl: state })),
  setIsOpen: (state) => set(() => ({ isOpen: state })),
}));

export { useActionMenuStore, usePfPlanDailiesStore, useToggle };

