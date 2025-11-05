import { create } from 'zustand';
import type { TravelPlan, DailyItinerary } from '../types';

interface PlanState {
    plans: TravelPlan[];
    currentPlan: TravelPlan | null;
    currentItinerary: DailyItinerary[];
    setPlans: (plans: TravelPlan[]) => void;
    setCurrentPlan: (plan: TravelPlan | null, itinerary?: DailyItinerary[]) => void;
    addPlan: (plan: TravelPlan) => void;
    removePlan: (planId: string) => void;
    clearPlans: () => void;
}

export const usePlanStore = create<PlanState>((set) => ({
    plans: [],
    currentPlan: null,
    currentItinerary: [],

    setPlans: (plans) => set({ plans }),

    setCurrentPlan: (plan, itinerary = []) =>
        set({ currentPlan: plan, currentItinerary: itinerary }),

    addPlan: (plan) =>
        set((state) => ({ plans: [plan, ...state.plans] })),

    removePlan: (planId) =>
        set((state) => ({
            plans: state.plans.filter((p) => p.id !== planId),
            currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
            currentItinerary: state.currentPlan?.id === planId ? [] : state.currentItinerary,
        })),

    clearPlans: () =>
        set({ plans: [], currentPlan: null, currentItinerary: [] }),
}));
