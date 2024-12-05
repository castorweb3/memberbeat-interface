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

import React from "react";
import useOwnershipCheck from "../hooks/useOwnershipCheck.js";
import { useEffect, useState } from "react";
import { useTokensStore } from "../store/Tokens.js";
import { Toast } from "bootstrap";
import { networks } from "../config/networks.js";
import { useMemberbeat } from "../context/MemberbeatContext.jsx";

const TokensAdminPage = () => {
  
  const emptyTokenObj = { network: '', contractAddress: '', priceFeedAddress: '', tokenName: '', symbol: '', iconUrl: '' };  

  const isOwner = useOwnershipCheck();
  const [loading, setLoading] = useState(true);
  const { fetchTokens, createToken, updateToken, deleteToken, tokens } = useTokensStore();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTokenId, setCurrentTokenId] = useState(null);
  const [token, setToken] = useState(emptyTokenObj);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);    
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { memberbeat } = useMemberbeat();
  
  useEffect(() => {
    if (isOwner !== null) {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleAddToken = () => {
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditToken = (token) => {
    setIsEditing(true);
    setCurrentTokenId(token._id);
    setToken(token);
    setShowModal(true);
  };

  const handleDeleteToken = (tokenId) => {
    setCurrentTokenId(tokenId);
    setShowDeleteModal(true);
  };

  const confirmDeleteToken = async () => {
    const { success, message } = await deleteToken(currentTokenId);

    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });

    if (success) {
      setShowDeleteModal(false);
      setCurrentTokenId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setToken(emptyTokenObj);
    setCurrentTokenId(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentTokenId(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setToken(prevToken => ({ ...prevToken, [id]: value }));
  };

  const handleSaveToken = async () => {    
    const { success, message } = isEditing 
      ? await updateToken(currentTokenId, token) 
      : await createToken(token);

    setToast({
      show: true,
      message: message,
      type: success ? 'success' : 'error'
    });

    if (success) {
      setShowModal(false);
      setToken(emptyTokenObj);
      setCurrentTokenId(null);
    }
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

        const registeredTokens = await memberbeat.getRegisteredTokens();
        console.log("Registered tokens", registeredTokens);
        const tokenAddresses = new Set(tokens.map(token => token.contractAddress));

        for (const registeredToken of registeredTokens) {
            if (!tokenAddresses.has(registeredToken)) {
                await memberbeat.deleteTokenPriceFeed(registeredToken);
            }
        }
        
        for (const token of tokens) {
            const isRegistered = await memberbeat.isTokenRegistered(token.contractAddress);
            if (isRegistered) {
                await memberbeat.updateTokenPriceFeed(token.contractAddress, token.priceFeedAddress);
            } else {
                await memberbeat.addTokenPriceFeed(token.contractAddress, token.priceFeedAddress);
            }
        }

        setToast({
            show: true,
            message: 'Token data published successfully!',
            type: 'success'
        });

        setShowPublishModal(false);
    } catch (error) {
        setToast({
            show: true,
            message: 'Failed to publish token data. Please try again.',
            type: 'error'
        });
        console.error("Error publishing token data: ", error);
    } finally {
        setIsPublishing(false);
    }
  };


  const handleClosePublishModal = () => {
    setShowPublishModal(false);
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
  }
  
  if (loading) {
    return (
      <div className="container my-4" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-grow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isOwner) { 
    return <div className="alert alert-danger">You do not have access to this page.</div>
  }    
  
  return (
    <div className="container my-4 text-start">
      <div className="d-flex justify-content-between py-3">
        <h2>Tokens</h2>
        <div>
          <button onClick={handleAddToken} className="btn btn-primary me-2">Add token</button>
          <button onClick={handlePublish} className="btn btn-secondary">Publish</button>
        </div>
      </div>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Icon</th>
            <th scope="col">Name</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {tokens.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">No records found</td>
            </tr>
          )}
          {tokens.map((token, index) => (
            <tr key={token._id}>
              <td>{index + 1}</td>
              <td><img src={token.iconUrl} style={{ maxWidth: '29px' }} /></td>
              <td>{token.tokenName}</td>
              <td className="text-end">
                <a href="#" className="text-decoration-none me-3" onClick={() => handleEditToken(token)}>
                  <i className="bi bi-pencil-square"></i>
                </a> 
                <a href="#" className="text-decoration-none text-danger" onClick={() => handleDeleteToken(token._id)}>
                  <i className="bi bi-trash"></i>
                </a>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit Token" : "Add New Token"}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="network" className="form-label">Network</label>
                  <select
                    className="form-control"
                    id="network"
                    value={token.network}
                    onChange={handleInputChange}
                  >
                    <option value="">&mdash; Select Network &mdash;</option>
                    {networks.map((network) => (
                      <option key={network.id} value={network.name}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="contractAddress" className="form-label">Contract Address</label>
                  <input type="text" className="form-control" id="contractAddress" placeholder="Enter contract address" value={token.contractAddress} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="priceFeedAddress" className="form-label">Price Feed Address</label>
                  <input type="text" className="form-control" id="priceFeedAddress" placeholder="Enter price feed address" value={token.priceFeedAddress} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="tokenName" className="form-label">Token Name</label>
                  <input type="text" className="form-control" id="tokenName" placeholder="Enter token name" value={token.tokenName} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="symbol" className="form-label">Symbol</label>
                  <input type="text" className="form-control" id="symbol" placeholder="Enter symbol" value={token.symbol} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="iconUrl" className="form-label">Icon URL</label>
                  <input type="text" className="form-control" id="iconUrl" placeholder="Enter icon URL" value={token.iconUrl} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveToken}>Save</button>
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
                <p>Are you sure you want to delete this token?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDeleteToken}>Delete</button>
              </div>           
            </div>
          </div>
        </div>
      )}

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

export default TokensAdminPage;
