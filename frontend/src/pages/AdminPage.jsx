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
import useOwnershipCheck from '../hooks/useOwnershipCheck';

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const isOwner = useOwnershipCheck();

  useEffect(() => {
    if (isOwner !== null) {
      setLoading(false);
    }
  }, [isOwner]);

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
    return <div className="alert alert-danger">You do not have access to this page.</div>;
  }

  return (
    <div className="container min-vh-100 d-flex flex-column py-5 align-items-center">
      <h3 className="mb-4">Welcome to the Memberbeat admin dashboard</h3>
      <div className="d-grid gap-2 w-50">
        <a href="/admin/plans" className="btn btn-primary">Manage Plans</a>
        <a href="/admin/tokens" className="btn btn-secondary">Manage Tokens</a>
      </div>
    </div>
  );
};

export default AdminPage;
