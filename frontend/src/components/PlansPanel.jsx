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

import React, { useEffect, useState } from 'react';
import { usePlansStore } from '../store/Plans.js';
import { useMemberbeat } from '../context/MemberbeatContext.jsx';
import { BillingPlan, Period, Plan, PricingType } from 'memberbeat-sdk-js';
import { useNavigate } from 'react-router-dom';

const PlansPanel = () => {
  const {plans, fetchPlans, isFetching} = usePlansStore();
  const [selectedBillingPlans, setSelectedBillingPlans] = useState({});
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentBillingPlan, setCurrentBillingPlan] = useState(null);
  const [selectedToken, setSelectedToken] = useState('');
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const {memberbeat} = useMemberbeat();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleBillingPlanChange = (planId, event) => {
    const [billingPlanId, tokenAddress] = event.target.value.split('|');

    if (tokenAddress) {
      setSelectedToken(tokenAddress);
    } else {
      setSelectedToken('');
    }

    setSelectedBillingPlans({
      ...selectedBillingPlans,
      [planId]: billingPlanId,
    });
  };

  const handleSubscribeClick = (planId) => {    
    const selectedBillingPlanId = selectedBillingPlans[planId];
    if (!selectedBillingPlanId) {
      return;
    }
  
    const selectedBillingPlan = plans.find(plan => plan._id === planId).billingPlans.find(bp => bp._id === selectedBillingPlanId);
    const selectedPlan = plans.find(plan => plan._id === planId);

    if (selectedToken) {
      subscribeUser(selectedPlan, selectedBillingPlan._id, selectedToken);
    } else if (selectedBillingPlan.tokens.length === 1) {
      subscribeUser(selectedPlan, selectedBillingPlan._id, selectedBillingPlan.tokens[0].token.contractAddress);
    } else {
      setCurrentPlan(selectedPlan);
      setCurrentBillingPlan(selectedBillingPlan);
      setShowTokenModal(true);
    }
  };
  
  const subscribeUser = async (plan, billingPlanId, tokenAddress) => {    
    if (!memberbeat) {
      setMessage("Please connect the wallet");
      setMessageType('warning');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    setLoading(plan._id);
    setMessage('');
    setMessageType('');

    try {
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

      const planIndex = plans.findIndex(p => p._id === plan._id);
      const planObj = new Plan(planIndex + 1, plan.planName, billingPlans);
      const billingPlanIndex = plan.billingPlans.findIndex(bp => bp._id === billingPlanId);

      const startTimestamp = Math.floor(Date.now() / 1000);
      await memberbeat.subscribe(planObj, billingPlanIndex, tokenAddress, startTimestamp);
      setMessage(`Subscribed to plan "${plan.name}" successfully!`);
      setMessageType('success');

      setTimeout(() => { 
        navigate('/profile'); 
      }, 3000);
    } catch (error) {      
      setMessage(`Error subscribing to plan: "${error.message}"`);
      setMessageType('danger');
    } finally {
      setLoading(null);
    }
  };

  const handleTokenSelect = () => {
    subscribeUser(currentPlan, currentBillingPlan._id, selectedToken);
    setShowTokenModal(false);
  };

  const getUniqueTokens = (billingPlans) => {
    const tokensMap = new Map();

    billingPlans.forEach((billingPlan) => {
      billingPlan.tokens.forEach((tokenEntry) => {
        tokensMap.set(tokenEntry.token._id, tokenEntry.token);
      });
    });

    return Array.from(tokensMap.values());
  };

  const handleCancel = () => {
    setSelectedToken('');
    setShowTokenModal(false);
  };

  if (isFetching) {
    return (
      <div className="container my-4" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-grow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="row">
        {plans.map((plan) => (
          <div key={plan._id} className="col-md-4 mb-4 d-flex">
            <div className="card h-100 w-100 d-flex flex-column">
              <div className="card-body flex-grow-1 d-flex flex-column">
                <h2 className="card-title">{plan.name}</h2>
                <p className="card-text">{plan.description}</p>
                <ul className="list-unstyled text-start" style={{ minHeight: "100px" }}>
                  {plan.features.split('\n').map((feature, index) => (
                    <li key={index}>
                      <i className="bi bi-check-circle-fill me-2"></i>{feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className="token-tray mb-3">
                    {getUniqueTokens(plan.billingPlans).map((token, index) => (
                      <img key={index} src={token.iconUrl} alt={token.tokenName} width="20" height="20" className="me-2" />
                    ))}
                  </div>
                  <select
                    className="form-select mb-3"
                    value={selectedBillingPlans[plan._id] || ''}
                    onChange={(e) => handleBillingPlanChange(plan._id, e)}
                  >
                    <option value="" disabled>Select a billing plan</option>
                    {plan.billingPlans.map((billingPlan) => (
                      billingPlan.pricingType === 'FiatPrice' ? (
                        <option key={billingPlan._id} value={billingPlan._id}>
                          {billingPlan.period === 'Lifetime'
                            ? billingPlan.period
                            : `${billingPlan.periodValue} ${billingPlan.period}${billingPlan.periodValue > 1 ? '(s)' : ''} - Recurring`} 
                          - ${billingPlan.fiatPrice}/month
                        </option>
                      ) : (
                        billingPlan.tokens.map((tokenEntry) => (
                          <option key={tokenEntry.token._id} value={`${billingPlan._id}|${tokenEntry.token.contractAddress}`}>
                            {billingPlan.period === 'Lifetime'
                              ? billingPlan.period
                              : `${billingPlan.periodValue} ${billingPlan.period}${billingPlan.periodValue > 1 ? '(s)' : ''} - Recurring`} 
                            - {tokenEntry.token.symbol} ${tokenEntry.tokenPrice}/month
                          </option>
                        ))
                      )
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSubscribeClick(plan._id)}
                    disabled={loading === plan._id}
                  >
                    {loading === plan._id ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`alert alert-${messageType} mt-4`} role="alert">
          {message}
        </div>
      )}      

      {showTokenModal && (
        <div className="modal fade show" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', height: '100vh', display: 'flex' }}>
          <div className="modal-dialog" style={{ margin: 'auto' }}>
            <div className="modal-content bg-dark text-white">
              <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <p>Select a token to subscribe</p>
                <div className="token-selection" style={{ textAlign: 'center' }}>
                  {currentBillingPlan?.tokens.map((tokenEntry) => (
                    <div key={tokenEntry.token._id} style={{ display: 'inline-block', margin: '10px' }}>
                      <img
                        src={tokenEntry.token.iconUrl}
                        alt={tokenEntry.token.tokenName}
                        width="30"
                        height="30"
                        style={{
                          cursor: 'pointer',
                          border: selectedToken === tokenEntry.token.contractAddress ? '3px solid white' : 'none',
                          borderRadius: '50%',
                        }}
                        onClick={() => setSelectedToken(tokenEntry.token.contractAddress)}
                      />
                      <div style={{ fontSize: '12px', color: 'white', marginTop: '5px' }}>{tokenEntry.token.symbol}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: 'none' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTokenSelect}
                  disabled={!selectedToken}
                  title={!selectedToken ? "Please click on a token icon to subscribe" : ""}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPanel;
