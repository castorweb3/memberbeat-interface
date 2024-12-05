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

const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/db.js");
const planRoutes = require("./routes/Plans.routes.js");
const tokenRoutes = require("./routes/Tokens.routes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 

const dirname = path.resolve();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/api/plans", planRoutes);
app.use("/api/tokens", tokenRoutes);

app.use((req, res, next) => { 
    console.log(`${req.method} ${req.url}`); 
    next(); 
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:" + PORT);
});