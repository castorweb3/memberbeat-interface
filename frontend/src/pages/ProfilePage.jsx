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

import React, { useState, useEffect } from 'react';
import { useMemberbeat } from '../context/MemberbeatContext';
import { usePlansStore } from '../store/Plans';

const ProfilePage = () => {
  const { memberbeat } = useMemberbeat();
  const { plans, fetchPlans, isFetching } = usePlansStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (!memberbeat) {
      return;
    }

    const fetchPlansAndSubscriptions = async () => {
      await fetchPlans();
      const subscriptionsData = await memberbeat.getSubscriptions();
      setSubscriptions(subscriptionsData);
      filterPlans(subscriptionsData);
    };

    fetchPlansAndSubscriptions();
  }, [fetchPlans, memberbeat]);

  const filterPlans = (subscriptionsData) => {
    const filteredPlans = plans.filter((plan, index) =>
      subscriptionsData.some(subscription => subscription.planId === index + 1)
    );

    setUserPlans(filteredPlans);
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

  const handleUnsubscribeClick = async (plan) => {
    const planIndex = plans.findIndex(p => p._id === plan._id);
    const subscription = subscriptions.find(sub => sub.planId === planIndex + 1);

    if (subscription) {
      setLoading(plan._id);
      await memberbeat.unsubscribe(planIndex + 1, subscription.token);
      await reloadPlansAndSubscriptions();
      setLoading(null);
    }
  };

  const reloadPlansAndSubscriptions = async () => {
    await fetchPlans();
    const subscriptionsData = await memberbeat.getSubscriptions();
    setSubscriptions(subscriptionsData);
    filterPlans(subscriptionsData);
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
    <div className="container">
      <h2 className="text-start">My Plans</h2>
      <div className="row mt-5">
        {userPlans.length > 0 ? (
          userPlans.map((plan) => (
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
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUnsubscribeClick(plan)}
                      disabled={loading === plan._id}>
                      {loading === plan._id ? 'Unsubscribing...' : 'Unsubscribe'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>You haven't subscribed yet.</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
