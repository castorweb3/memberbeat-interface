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
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  anvil,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import BillingPlansAdminPage from './pages/BillingPlansAdminPage.jsx';
import { Route, Routes } from 'react-router-dom';
import PageContainer from './components/PageContainer.jsx';
import { MemberbeatProvider } from './context/MemberbeatContext.jsx';
import TokensAdminPage from './pages/TokensAdminPage.jsx';
import PlansAdminPage from './pages/PlansAdminPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const config = getDefaultConfig({
  appName: 'Memberbeat',
  projectId: 'Memberbeat',
  chains: [mainnet, polygon, optimism, arbitrum, base, anvil],
  ssr: false,
});

const queryClient = new QueryClient();

const memberbeatContractAddress = import.meta.env.VITE_MEMBERBEAT_CONTRACT_ADDRESS;

const App = () => {      
  return (    
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>    
  );
};

export default App;
