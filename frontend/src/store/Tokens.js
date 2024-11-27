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

import { create } from "zustand";

export const useTokensStore = create((set, get) => ({
    tokens: [],
    isFetching: false,
    setTokens: (tokens) => set({ tokens }),    
    createToken: async (newToken) => {
        if (!newToken.network || !newToken.contractAddress || !newToken.priceFeedAddress || !newToken.tokenName || !newToken.symbol || !newToken.iconUrl) {
            return { success: false, message: "Please fill in all fields." }
        } 
        const res = await fetch("/api/tokens", { 
            method: "POST", 
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newToken)
        });

        const data = await res.json();
        set((state) => ({ tokens: [...state.tokens, data.data] }));
        return { success: true, message: "Token created successfully" };
    },
    updateToken: async (id, token) => {
        if (!token.network || !token.contractAddress || !token.priceFeedAddress || !token.tokenName || !token.symbol || !token.iconUrl) {
            return { success: false, message: "Please fill in all fields." }
        } 
        const res = await fetch(`/api/tokens/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(token)
        });
        const data = await res.json();        
        if (!data.success) return { success: false, message: data.message };
        set(state => ({ 
            tokens: state.tokens.map(token => token._id === id ? data.data : token)
        }));        
        return { success: true, message: data.message };
    },
    deleteToken: async (id) => {        
        const res = await fetch(`/api/tokens/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) return { success: false, message: data.message };
        set(state => ({ tokens: state.tokens.filter(token => token._id !== id) }));
        return { success: true, message: data.message };
    },
    fetchTokens: async () => {
        set({ isFetching: true });
        const res = await fetch("/api/tokens");
        const data = await res.json();        
        set({ tokens: data.data, isFetching: false });
    },    
    getTokenById: (id) => { 
        return get().tokens.find(token => token._id === id);
    },
}));
