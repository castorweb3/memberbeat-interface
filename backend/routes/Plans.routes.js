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

import express from "express";
import {getPlans, getPlan, createPlan, updatePlan, deletePlan, addBillingPlan, updateBillingPlan, removeBillingPlan } from "../controllers/PlansController.js";

const router = express.Router();

router.get('/', getPlans);
router.get('/:id', getPlan);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

router.post('/:id/billing-plans', addBillingPlan);
router.put('/:id/billing-plans/:billingPlanId', updateBillingPlan);
router.delete('/:id/billing-plans/:billingPlanId', removeBillingPlan);

export default router;