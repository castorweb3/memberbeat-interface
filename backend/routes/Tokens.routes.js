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

import express from "express";
import { createToken, deleteToken, getToken, getTokens, updateToken } from "../controllers/TokensController.js";

const router = express.Router();

router.get('/', getTokens);
router.get('/:id', getToken);
router.post("/", createToken);
router.put("/:id", updateToken);
router.delete("/:id", deleteToken);

export default router;