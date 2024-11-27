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
import Plan from "../models/Plan.model.js";
import {periodEnum, pricingTypeEnum} from "../models/BillingPlan.model.js";

export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({}).populate(
            { path: 'billingPlans.tokens.token', model: 'Token' }
        );
        res.status(200).json({ status: true, data: plans });
    } catch (error) {
        console.error("Error in fetching plans: ", error.message);
        res.status(500).json({ status: false, message: "Server Error" });
    }
}

export const getPlan = async (req, res) => {
    const { id } = req.params;
    try {
        const plan = await Plan.findById(id).populate(
            { path: 'billingPlans.tokens.token', model: 'Token' }
        );
        if (!plan) {
            return res.status(404).json({ status: false, message: "Plan not found" });
        }
        res.status(200).json({ status: true, data: plan });
    } catch (error) {
        console.error("Error in fetching plan: ", error.message);
        res.status(500).json({ status: false, message: "Server Error" });
    }
}

export const createPlan = async (req, res) => {
    const plan = req.body;
    if (!plan.name || !plan.description || !plan.features) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }        

    const newPlan = new Plan(plan);

    try {
        await newPlan.save();
        res.status(201).json({ success: true, data: newPlan });
    } catch (error) {
        console.error("Error in Create plan: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const updatePlan = async (req, res) => {
    const {id} = req.params;

    const plan = req.body;
    if (!plan.name || !plan.description || !plan.features) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    } 
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Plan not found" });
    }

    try {
        const updatedPlan = await Plan.findByIdAndUpdate(id, plan, { new: true }).populate(
            { path: 'billingPlans.tokens.token', model: 'Token' }
        );
        res.status(200).json({ success: true, message: "Plan updated", data: updatedPlan });
    } catch (error) {
        console.error("Error in updating plan ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const deletePlan = async (req, res) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Plan not found" });
    }

    try {
        await Plan.findByIdAndDelete(id);        
        res.status(200).json({ success: true, message: "Plan deleted" });
    } catch (error) {
        console.error("Error in deleting plan: ", error.message)
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const validateBillingPlan = (billingPlan) => {
    console.log("Validating billing plan", billingPlan);

    if (!billingPlan.period) {
        return { valid: false, message: "Please select the period" };
    }
    
    if (billingPlan.period !== periodEnum[3] && (!billingPlan.periodValue || !Number.isInteger(Number(billingPlan.periodValue)) || Number(billingPlan.periodValue) < 0)) {
        return { valid: false, message: "Please enter a valid period value" };
    }

    if (billingPlan.pricingType === pricingTypeEnum[1] && (isNaN(Number(billingPlan.fiatPrice)) || Number(billingPlan.fiatPrice) <= 0)) {
        return { valid: false, message: "Please enter a valid number for the fiat price" };
    }

    if (billingPlan.tokens.length === 0) {
        return { valid: false, message: "Please select at least one token" };
    }

    for (let token of billingPlan.tokens) {
        if (!token.token) {
            return { valid: false, message: "Please select at least one token" };
        }

        if (billingPlan.pricingType == pricingTypeEnum[0] && (isNaN(Number(token.tokenPrice)) || Number(token.tokenPrice) <= 0)) {
            return { valid: false, message: "Please enter a valid token price" };
        }
    }

    return { valid: true, message: "" };
};    

export const addBillingPlan = async (req, res) => {
    const {id} = req.params;

    const billingPlan = req.body;    
    const { valid, message } = validateBillingPlan(billingPlan);
    if (!valid) {
        return res.status(400).json({ success: false, message: message });
    }

    try {    
        const plan = await Plan.findById(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }

        plan.billingPlans.push(billingPlan);
        await plan.save();

        const updatedPlan = await Plan.findById(id).populate(
            { path: 'billingPlans.tokens.token', model: 'Token' }
        );

        const createdBillingPLan = updatedPlan.billingPlans[updatedPlan.billingPlans.length - 1];    
        res.json({ success: true, message: "Billing plan added", data: createdBillingPLan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const updateBillingPlan = async (req, res) => {
    const {id, billingPlanId} = req.params;

    const billingPlan = req.body;    
    const { valid, message } = validateBillingPlan(billingPlan);
    if (!valid) {
        return res.status(400).json({ success: false, message: message });
    }

    try {        
        const plan = await Plan.findById(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
    
        const existingBillingPlan = plan.billingPlans.id(billingPlanId);
        if (!existingBillingPlan) {
            return res.status(404).json({ success: false, message: "Billing plan not found" });
        }
    
        Object.assign(existingBillingPlan, billingPlan);
        await plan.save();

        const updatedPlan = await Plan.findById(id).populate(
            { path: 'billingPlans.tokens.token', model: 'Token' }
        );

        const updatedBillingPlan = updatedPlan.billingPlans.id(billingPlanId);    
        res.json({ success: true, message: "Billing plan updated", data: updatedBillingPlan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const removeBillingPlan = async (req, res) => {
    const {id, billingPlanId} = req.params;

    try {
        const plan = await Plan.findById(id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }

        plan.billingPlans = plan.billingPlans.filter(bp => bp._id.toString() !== billingPlanId);

        await plan.save();

        res.json({ success: true, message: "Billing plan deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

