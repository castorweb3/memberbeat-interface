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

const mongoose = require("mongoose");
const Token = require("../models/Token.model.js");

const getTokens = async (req, res) => {
    try {
        const tokens = await Token.find({}); 
        res.status(200).json({ status: true, data: tokens });
    } catch (error) {
        console.error("Error in fetching tokens: ", error.message);
        res.status(500).json({ status: false, message: "Server Error" });
    }
}

const getToken = async (req, res) => {
    const { id } = req.params;
    try {
        const token = await Token.findById(id);
        if (!token) {
            return res.status(404).json({ status: false, message: "Token not found" });
        }
        res.status(200).json({ status: true, data: token });
    } catch (error) {
        console.error("Error in fetching token: ", error.message);
        res.status(500).json({ status: false, message: "Server Error" });
    }
}

const createToken = async (req, res) => {
    const token = req.body;
    if (!token.network || !token.contractAddress || !token.priceFeedAddress || !token.tokenName || !token.symbol || !token.iconUrl) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }        

    const newToken = new Token(token);

    try {
        await newToken.save();
        res.status(201).json({ success: true, data: newToken });
    } catch (error) {
        console.error("Error in Create token: ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const updateToken = async (req, res) => {
    const {id} = req.params;

    const token = req.body;
    if (!token.network || !token.contractAddress || !token.priceFeedAddress || !token.tokenName || !token.symbol || !token.iconUrl) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    } 
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Token not found" });
    }

    try {
        const updatedToken = await Token.findByIdAndUpdate(id, token, { new: true });
        res.status(200).json({ success: true, message: "Token updated", data: updatedToken });
    } catch (error) {
        console.error("Error in updating token ", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const deleteToken = async (req, res) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Token not found" });
    }

    try {
        await Token.findByIdAndDelete(id);        
        res.status(200).json({ success: true, message: "Token deleted" });
    } catch (error) {
        console.error("Error in deleting token: ", error.message)
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

module.exports = {
    getTokens,
    getToken,
    createToken,
    updateToken,
    deleteToken,
}
