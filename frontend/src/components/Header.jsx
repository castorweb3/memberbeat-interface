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

import { Link } from "react-router-dom";
import useOwnershipCheck from "../hooks/useOwnershipCheck";
import { useWalletContext } from "../context/WalletContext";
import { useMemberbeat } from "../context/MemberbeatContext";

const Header = () => {
    const { provider, connectWallet } = useWalletContext();
    const { signer } = useMemberbeat();
    const isOwner = useOwnershipCheck();

    return (
        <header className="d-flex justify-content-end align-items-center py-3">
            {provider && (
                <>
                    <div className="me-3"><Link to={"/"}>Home</Link></div>
                    <div className="me-3"><Link to={"/profile"}>Profile</Link></div>
                </>
            )}
            {isOwner && (
                <>
                    <div className="me-4"><Link to={"/admin"}>Admin</Link></div>
                </>
            )}
            {signer && (
                <div>{signer.address}</div>
            )}
            {!provider && (
                <button onClick={connectWallet}>Connect wallet</button>
            )}
        </header>
    );
};

export default Header;


