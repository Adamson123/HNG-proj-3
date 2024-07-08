require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authenticateUser = require("./authenticateUser");
const { register, login } = require("./controllers/auth-controller");
const { getSingleUser } = require("./controllers/user-controller");

const {
    getUserOrganisations,
    getSingleOrganisation,
    createOrganisation,
    addUserToOrganisation,
} = require("./controllers/organisation-controller");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const authRouter = express.Router();
const orgRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

orgRouter.get("/", getUserOrganisations);
orgRouter.get("/:orgId", getSingleOrganisation);
orgRouter.post("/", createOrganisation);
orgRouter.post("/:orgId/users", addUserToOrganisation);

app.get("/", (req, res) => {
    res.send("welcome! welcome!! welcome!!!");
});

app.use("/api/auth", authRouter);
app.get("/api/users/:id", authenticateUser, getSingleUser);
app.use("/api/organisation", authenticateUser, orgRouter);

app.use((req, res) => {
    res.status(404).json({ msg: "404 not found" });
});

module.exports = app;
