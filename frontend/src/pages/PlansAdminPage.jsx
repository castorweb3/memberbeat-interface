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

import { useEffect, useState } from "react";
import { usePlansStore } from "../store/Plans";
import { Toast } from 'bootstrap';
import { useNavigate } from "react-router-dom";
import useOwnershipCheck from "../hooks/useOwnershipCheck";
import { useMemberbeat } from "../context/MemberbeatContext";
import { BillingPlan, Period, Plan, PricingType } from "memberbeat-sdk-js";

const PlansAdminPage = () => {
  const [loading, setLoading] = useState(true);
  const isOwner = useOwnershipCheck();
  const { fetchPlans, createPlan, updatePlan, deletePlan, plans } = usePlansStore();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [plan, setPlan] = useState({ name: '', description: '', features: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { memberbeat } = useMemberbeat();
  const navigate = useNavigate(); 

  useEffect(() => {
    if (isOwner !== null) {
      setLoading(false);
    }
  }, [isOwner]);

  const handleEditBillingPlan = (plan) => { 
    console.log("Plan", plan);
    navigate(`/admin/billing-plans/${plan._id}`, { state: { plan } }); 
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPlan = () => {
    setIsEditing(false);
    setShowModal(true);
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };  

  const confirmPublish = async () => {
    if (!memberbeat) {
      return;
    }

    setIsPublishing(true);

    try {
      const newPlans = plans.map((plan, index) => {
        const billingPlans = plan.billingPlans.map(bp => {
          return new BillingPlan(
            Period[bp.period],
            bp.periodValue,
            PricingType[bp.pricingType],
            bp.tokens.map(t => t.token.contractAddress),
            bp.tokens.map(t => t.tokenPrice),
            bp.fiatPrice
          );
        });  
        return new Plan(index + 1, plan.name, billingPlans);
      });
  
      console.log("New plans", newPlans);
      const existingPlans = await memberbeat.getPlans();
      console.log("Existing plans", existingPlans);    

      const existingPlanMap = {};
      for (const plan of existingPlans) {      
        existingPlanMap[plan.planId] = plan;
      }
      for (const newPlan of newPlans) {
        const existingPlan = existingPlanMap[newPlan.planId];
        if (existingPlan) {
          await memberbeat.updatePlan(newPlan);
        } else {
          await memberbeat.createPlan(newPlan);
        }
      }
  
      for (const existingPlan of existingPlans) {
        const newPlan = newPlans.find(plan => plan.planId === existingPlan.planId);
        if (!newPlan) {
          await memberbeat.deletePlan(existingPlan.planId);
        }
      }

      setToast({
        show: true,
        message: 'Plans published successfully!',
        type: 'success'
      });

      setShowPublishModal(false);
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to publish plans. Please try again.',
        type: 'error'
      });
      console.error("Error publishing plans: ", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditPlan = (plan) => {
    setIsEditing(true);
    setCurrentPlanId(plan._id);
    setPlan(plan);
    setShowModal(true);
  };

  const handleDeletePlan = (planId) => {
    setCurrentPlanId(planId);
    setShowDeleteModal(true);
  };

  const confirmDeletePlan = async () => {
    const { success, message } = await deletePlan(currentPlanId);

    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });

    if (success) {
      setShowDeleteModal(false);
      setCurrentPlanId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPlan({ name: '', description: '', features: '' });
    setCurrentPlanId(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentPlanId(null);
  };

  const handleClosePublishModal = () => {
    setShowPublishModal(false);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPlan(prevPlan => ({ ...prevPlan, [id]: value }));
  };

  const handleSavePlan = async () => {
    const { success, message } = isEditing 
      ? await updatePlan(currentPlanId, plan) 
      : await createPlan(plan);

    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });

    if (success) {
      setShowModal(false);
      setPlan({ name: '', description: '', features: '' });
      setCurrentPlanId(null);
    }
  };

  useEffect(() => {
    if (toast.show) {
      const toastElement = document.getElementById('toast');
      const bootstrapToast = new Toast(toastElement);
      bootstrapToast.show();    
    }
  }, [toast]);

  const handleToastClose = () => { 
    setToast({ show: false, message: '', type: '' }); 
  };

  if (loading) {
    <div className="container my-4" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner-grow" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  }

  if (!isOwner) { 
    return <div className="alert alert-danger">You do not have access to this page.</div>;
  }
  
  return (
    <div className="container my-4 text-start">
      <div className="d-flex justify-content-between py-3">
        <h2>Plans</h2>
        <div>
          <button onClick={handleAddPlan} className="btn btn-primary me-2">Add plan</button>
          <button onClick={handlePublish} className="btn btn-secondary">Publish</button>
        </div>
      </div>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Billing plans</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {plans.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">No records found</td>
            </tr>
          )}
          {plans.map((plan, index) => (
            <tr key={plan._id}>
              <td>{index + 1}</td>
              <td>{plan.name}</td>
              <td>{plan.billingPlans.length}</td>
              <td className="text-end">
                <a href="#" className="text-decoration-none me-3" onClick={() => handleEditPlan(plan)}>
                  <i className="bi bi-pencil-square"></i>
                </a>
                <a href="#" className="text-decoration-none me-3" onClick={() => handleEditBillingPlan(plan)}> 
                  <i className="bi bi-currency-exchange"></i> 
                </a>
                <a href="#" className="text-decoration-none text-danger" onClick={() => handleDeletePlan(plan._id)}>
                  <i className="bi bi-trash"></i>
                </a>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPublishModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Publish</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClosePublishModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to publish the data to the network?</p>
                {isPublishing && (
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClosePublishModal} disabled={isPublishing}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmPublish} disabled={isPublishing}>Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit Plan" : "Add New Plan"}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input type="text" className="form-control" id="name" placeholder="Enter plan name" value={plan.name} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea className="form-control" id="description" rows="3" placeholder="Enter plan description" value={plan.description} onChange={handleInputChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="features" className="form-label">Features</label>
                  <textarea className="form-control" id="features" rows="3" placeholder="Enter plan features" value={plan.features} onChange={handleInputChange}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSavePlan}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseDeleteModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this plan?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDeletePlan}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div
        id="toast"
        className={`toast align-items-center text-white bg-dark border-0 position-fixed top-0 end-0 m-4 ${toast.show ? 'show' : ''}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            {toast.message}
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={handleToastClose}></button>
        </div>
      </div>
    </div>
  );
};

export default PlansAdminPage;
