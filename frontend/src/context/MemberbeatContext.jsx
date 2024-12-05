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

import { createMemberbeat } from 'memberbeat-sdk-js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWalletContext } from './WalletContext';

const MemberbeatContext = createContext();

export const useMemberbeat = () => useContext(MemberbeatContext);

export const MemberbeatProvider = ({ children, contractAddress }) => {
  const [memberbeat, setMemberbeat] = useState(null);
  const [signer, setSigner] = useState(null);
  const {provider, error} = useWalletContext();
  
  useEffect(() => {
    const setupSigner = async () => {
      console.log("Setting up signer", provider);
      if (provider) {
        await provider.send('eth_requestAccounts', []);
        const _signer = await provider.getSigner();
        console.log("_signer", _signer);
        setSigner(_signer);
      }        
    };

    setupSigner();
  }, [provider]);

  useEffect(() => {
    const initializeMemberbeat = async () => {
      if (signer) {        
        const memberbeatInstance = await createMemberbeat(contractAddress, signer);
        console.log('Memberbeat created:', memberbeatInstance); 
        setMemberbeat(memberbeatInstance);        
      }
    };

    initializeMemberbeat();
  }, [signer, contractAddress]);

  return (
    <MemberbeatContext.Provider value={{ memberbeat, signer }}>
      {children}
    </MemberbeatContext.Provider>
  );
};
