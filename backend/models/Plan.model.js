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

import mongoose from "mongoose";
import { billingPlanSchema } from "./BillingPlan.model.js";

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    features: {
        type: String,
        required: true
    },
    billingPlans: {
        type: [billingPlanSchema], 
        required: false
    }
}, {
    timestamps: true
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;