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

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlansStore } from "../store/Plans.js";
import { useTokensStore } from "../store/Tokens.js";
import useOwnershipCheck from "../hooks/useOwnershipCheck.js";

const periodEnum = ['Day', 'Month', 'Year', 'Lifetime'];
const pricingTypeEnum = ['TokenPrice', 'FiatPrice'];

const BillingPlansAdminPage = () => {  
  const isOwner = useOwnershipCheck();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { planId } = useParams();
  const { getPlanById, plans, fetchPlans, isFetching, createBillingPlan, updateBillingPlan, deleteBillingPlan } = usePlansStore();
  const { tokens, fetchTokens } = useTokensStore();
  const [plan, setPlan] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });  
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentBillingPlan, setCurrentBillingPlan] = useState(null);
  const [billingPlanData, setBillingPlanData] = useState({
    period: '',
    periodValue: '',
    pricingType: '',
    tokens: [],
    fiatPrice: '',
  });
  const [billingPlanIdToDelete, setBillingPlanIdToDelete] = useState(null);

  useEffect(() => {
    if (isOwner !== null) {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        navigate("/admin");
        return;
      }

      if (plans.length === 0 && !isFetching) {
        console.log("Fetching plans...");
        await fetchPlans();
      }

      const foundPlan = getPlanById(planId);      
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        navigate("/admin");
      }      
    };

    loadPlan();
    fetchTokens();
  }, [navigate, planId, plans, getPlanById, fetchPlans, isFetching, fetchTokens]);    

  if (!plan) {
    return (
      <div>
        <p>Plan not found.</p>
      </div>
    );
  }

  const handleAddBillingPlan = () => {
    setCurrentBillingPlan(null);
    setBillingPlanData({
      period: '',
      periodValue: '',
      pricingType: '',
      tokens: [],
      fiatPrice: '',
    });
    setShowModal(true);
  };

  const handleEditBillingPlan = (billingPlan) => {
    setCurrentBillingPlan(billingPlan);
    setBillingPlanData({
      ...billingPlan,
      tokens: billingPlan.tokens.map(tokenEntry => ({
        token: tokenEntry.token._id,
        tokenPrice: tokenEntry.tokenPrice,
      }))
    });
    setShowModal(true);
  };

  const confirmDeleteBillingPlan = (billingPlanId) => {
    setBillingPlanIdToDelete(billingPlanId);
    setShowConfirmationModal(true);
  };

  const handleDeleteBillingPlan = async () => {
    const { success, message } = await deleteBillingPlan(planId, billingPlanIdToDelete);
    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });
    if (success) {
      setShowConfirmationModal(false);
      setBillingPlanIdToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingPlanData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleTokenChange = (index, field, value) => {
    const newTokens = [...billingPlanData.tokens];
    newTokens[index] = {
      ...newTokens[index],
      [field]: value,
    };
    setBillingPlanData(prevState => ({
      ...prevState,
      tokens: newTokens,
    }));
  };

  const handleAddToken = () => {
    setBillingPlanData(prevState => ({
      ...prevState,
      tokens: [...prevState.tokens, { token: '', tokenPrice: '' }],
    }));
  };

  const handleRemoveToken = (index) => {
    const newTokens = billingPlanData.tokens.filter((_, i) => i !== index);
    setBillingPlanData(prevState => ({
      ...prevState,
      tokens: newTokens,
    }));
  };

  const handleSaveBillingPlan = async () => {
    const { success, message } = currentBillingPlan 
      ? await updateBillingPlan(planId, currentBillingPlan._id, billingPlanData) 
      : await createBillingPlan(planId, billingPlanData);

    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });    

    if (success) {
      setShowModal(false);
    }
  };

  const handleToastClose = () => { 
    setToast({ show: false, message: '', type: '' }); 
  };

  if (loading) {
    return <div className="container min-vh-100 d-flex flex-column py-5 align-items-center">Loading...</div>;
  }

  if (!isOwner) { 
    return <div className="alert alert-danger">You do not have access to this page.</div>;
  }

  return (
    <div className="container my-4 text-start">      
      <div className="d-flex justify-content-between py-3">
        <h3>Manage Billing Plans for {plan.name}</h3>
        <div>
          <button onClick={handleAddBillingPlan} className="btn btn-primary">Add billing plan</button>
        </div>
      </div>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Period</th>            
            <th scope="col">Pricing Type</th>
            <th scope="col" className="text-end" style={{ width: "200px" }}>Price</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {plan.billingPlans.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">No records found</td>
            </tr>
          )}
          {plan.billingPlans.map((billingPlan, index) => (
            <tr key={billingPlan._id}>
              <td>{index + 1}</td>
              <td>
                {billingPlan.period === "Lifetime" 
                  ? billingPlan.period 
                  : `${billingPlan.periodValue} ${billingPlan.period}${billingPlan.periodValue > 1 ? '(s)' : ''}`}
              </td>             
              <td>{billingPlan.pricingType}</td>
              <td className="text-end">
                {billingPlan.pricingType === "FiatPrice" ? (
                  <div className="d-flex flex-column align-items-end">
                    <span>{billingPlan.fiatPrice}</span>
                    <div className="d-flex justify-content-end">
                      {billingPlan.tokens.map((tokenEntry, index) => (
                        <img key={index} src={tokenEntry.token.iconUrl} alt={tokenEntry.token.symbol} width="20" height="20" className="ms-1" title={tokenEntry.token.symbol} />
                      ))}
                    </div>                    
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-end">
                    {billingPlan.tokens.map((tokenEntry, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center w-100" style={{ gap: '10px' }}>
                        <img src={tokenEntry.token.iconUrl} alt={tokenEntry.token.symbol} width="20" height="20" />
                        <span>{tokenEntry.token.symbol}</span>
                        <span>{tokenEntry.tokenPrice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </td>

              <td className="text-end">
                <a href="#" onClick={() => handleEditBillingPlan(billingPlan)} className="text-decoration-none me-3">
                  <i className="bi bi-pencil-square"></i>
                </a>
                <a href="#" onClick={() => confirmDeleteBillingPlan(billingPlan._id)} className="text-decoration-none text-danger">
                  <i className="bi bi-trash"></i>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">{currentBillingPlan ? "Edit Billing Plan" : "Add Billing Plan"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="periodValue" className="form-label">Period Value</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="periodValue" 
                        name="periodValue" 
                        value={billingPlanData.periodValue} 
                        onChange={handleInputChange} 
                        disabled={billingPlanData.period === "Lifetime"} 
                        placeholder="Enter period value"
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="period" className="form-label">Period</label>
                      <select 
                        className="form-control" 
                        id="period" 
                        name="period" 
                        value={billingPlanData.period} 
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select Period --</option>
                        {periodEnum.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="pricingType" className="form-label">Pricing Type</label>
                    <select 
                      className="form-control" 
                      id="pricingType" 
                      name="pricingType" 
                      value={billingPlanData.pricingType} 
                      onChange={handleInputChange}                      
                    >
                      <option value="">&mdash; Select Pricing Type &mdash;</option>
                      {pricingTypeEnum.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {billingPlanData.pricingType === "FiatPrice" && (
                    <div className="mb-3">
                      <label htmlFor="fiatPrice" className="form-label">Fiat Price</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="fiatPrice" 
                        name="fiatPrice" 
                        value={billingPlanData.fiatPrice} 
                        placeholder="Enter price"
                        onChange={handleInputChange} 
                      />
                    </div>
                  )}
                  {billingPlanData.pricingType === "FiatPrice" || billingPlanData.pricingType === "TokenPrice" ? (
                    <div>
                      <button type="button" className="btn btn-outline-primary mb-3" onClick={handleAddToken}>Add Token</button>
                      {billingPlanData.tokens.map((tokenEntry, index) => (
                        <div className="row mb-3" key={index}>
                          <div className="col">
                            <label htmlFor={`token_${index}`} className="form-label">Token</label>
                            <select
                              className="form-control"
                              id={`token_${index}`}
                              name={`token_${index}`}
                              value={tokenEntry.token}
                              onChange={(e) => handleTokenChange(index, "token", e.target.value)}
                            >
                              <option value="">&mdash; Select Token &mdash;</option>
                              {tokens.map((token) => (
                                <option key={token._id} value={token._id}>
                                  {token.tokenName}
                                </option>
                              ))}
                            </select>
                          </div>
                          {billingPlanData.pricingType === "TokenPrice" && (
                            <div className="col">
                              <label htmlFor={`tokenPrice_${index}`} className="form-label">Token Price</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                id={`tokenPrice_${index}`} 
                                name={`tokenPrice_${index}`} 
                                value={tokenEntry.tokenPrice} 
                                placeholder="Enter price"
                                onChange={(e) => handleTokenChange(index, "tokenPrice", e.target.value)} 
                              />
                            </div>
                          )}
                          <div className="col-auto d-flex align-items-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveToken(index)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveBillingPlan}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}            

      {showConfirmationModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Removal</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmationModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to remove this billing plan?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmationModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteBillingPlan}>Remove</button>
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

export default BillingPlansAdminPage;
