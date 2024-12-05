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

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            const isWalletConnected = localStorage.getItem('walletConnected');
            if (isWalletConnected === 'true') {
                await connectWallet();
            }
        };

        checkConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const newProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(newProvider);
                localStorage.setItem('walletConnected', 'true');
            } catch (err) {
                setError('User denied account access or there was an issue with connecting.');
                localStorage.removeItem('walletConnected');
            }
        } else {
            setError('MetaMask is not installed!');
        }
    };

    return { provider, error, connectWallet };
};

export default useWallet;


