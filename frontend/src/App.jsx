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

import './App.css'

import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import BillingPlansAdminPage from './pages/BillingPlansAdminPage.jsx';
import { Route, Routes } from 'react-router-dom';
import PageContainer from './components/PageContainer.jsx';
import { MemberbeatProvider } from './context/MemberbeatContext.jsx';
import TokensAdminPage from './pages/TokensAdminPage.jsx';
import PlansAdminPage from './pages/PlansAdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { WalletProvider } from './context/WalletContext';

const memberbeatContractAddress = import.meta.env.VITE_MEMBERBEAT_CONTRACT_ADDRESS;
console.log("Memberbeat contract address", memberbeatContractAddress);

const App = () => {      
  return (    
    <WalletProvider>
      <MemberbeatProvider contractAddress={memberbeatContractAddress}>            
        <Routes>
          <Route path="/" element={<PageContainer><HomePage /></PageContainer>} />
          <Route path="/profile" element={<PageContainer><ProfilePage /></PageContainer>} />
          <Route path="/admin" element={<PageContainer><AdminPage /></PageContainer>} />
          <Route path="/admin/plans" element={<PageContainer><PlansAdminPage /></PageContainer>} />
          <Route path="/admin/tokens" element={<PageContainer><TokensAdminPage /></PageContainer>} />
          <Route path="/admin/billing-plans/:planId" element={<PageContainer><BillingPlansAdminPage /></PageContainer>} />
        </Routes>             
      </MemberbeatProvider>
    </WalletProvider>    
  );
};

export default App;
