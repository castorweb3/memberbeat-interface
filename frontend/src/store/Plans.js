// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import { create } from "zustand";

export const usePlansStore = create((set, get) => ({
  plans: [],
  isFetching: false,
  setPlans: (plans) => set({ plans }),
  createPlan: async (newPlan) => {
    if (!newPlan.name || !newPlan.description || !newPlan.features) {
      return { success: false, message: "Please fill in all fields." };
    }
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPlan),
    });

    const data = await res.json();
    set((state) => ({ plans: [...state.plans, data.data] }));
    return { success: true, message: "Plan created successfully" };
  },
  updatePlan: async (id, plan) => {
    const res = await fetch(`/api/plans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plan),
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    set((state) => ({
      plans: state.plans.map((p) => (p._id === id ? data.data : p)),
    }));
    return { success: true, message: data.message };
  },
  deletePlan: async (id) => {
    const res = await fetch(`/api/plans/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    set((state) => ({ plans: state.plans.filter((plan) => plan._id !== id) }));
    return { success: true, message: data.message };
  },
  fetchPlans: async () => {
    set({ isFetching: true });
    const res = await fetch("/api/plans");
    const data = await res.json();    
    set({ plans: data.data, isFetching: false });
  },
  getPlanById: (id) => {
    return get().plans.find((plan) => plan._id === id);
  },
  createBillingPlan: async (planId, billingPlan) => {     
    const res = await fetch(`/api/plans/${planId}/billing-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billingPlan),
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan._id === planId ? { ...plan, billingPlans: [...plan.billingPlans, data.data] } : plan
      ),
    }));
    return { success: true, message: data.message };
  },
  updateBillingPlan: async (planId, billingPlanId, billingPlan) => {     
    const res = await fetch(`/api/plans/${planId}/billing-plans/${billingPlanId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billingPlan),
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan._id === planId
          ? {
              ...plan,
              billingPlans: plan.billingPlans.map((bp) =>
                bp._id === billingPlanId ? data.data : bp
              ),
            }
          : plan
      ),
    }));
    return { success: true, message: data.message };
  },
  deleteBillingPlan: async (planId, billingPlanId) => {
    const res = await fetch(`/api/plans/${planId}/billing-plans/${billingPlanId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan._id === planId
          ? {
              ...plan,
              billingPlans: plan.billingPlans.filter((bp) => bp._id !== billingPlanId),
            }
          : plan
      ),
    }));
    return { success: true, message: data.message };
  },
}));
