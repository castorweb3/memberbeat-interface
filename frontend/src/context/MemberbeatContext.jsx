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

import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { createMemberbeat } from 'memberbeat-sdk-js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConfig, useClient } from 'wagmi';

const MemberbeatContext = createContext();

export const useMemberbeat = () => useContext(MemberbeatContext);

export const MemberbeatProvider = ({ children, contractAddress }) => {
  const [memberbeat, setMemberbeat] = useState(null);
  const [signer, setSigner] = useState(null);

  const account = useAccount();
  const config = useConfig();  
  const client = useClient({ config });   

  useEffect(() => {
    const setupSigner = async () => {
      if (account.isConnected) {
        const { chain, transport } = client;
        const network = {
          chainId: chain.id,
          name: chain.name,
          ensAddress: chain.contracts?.ensRegistry?.address,
        };
        const provider = new BrowserProvider(transport, network);
        const newSigner = new JsonRpcSigner(provider, account.address);        

        setSigner(newSigner);
      }
    };

    setupSigner();
  }, [account, client]);

  useEffect(() => {
    const initializeMemberbeat = async () => {
      if (account.isConnected && signer) {
        const memberbeatInstance = await createMemberbeat(contractAddress, signer);
        console.log('Memberbeat created:', memberbeatInstance); 
        setMemberbeat(memberbeatInstance);        
      }
    };

    initializeMemberbeat();
  }, [account, signer, contractAddress]);

  return (
    <MemberbeatContext.Provider value={{ memberbeat, signer }}>
      {children}
    </MemberbeatContext.Provider>
  );
};
