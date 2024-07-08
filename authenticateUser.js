const { User } = require("./models");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
    try {
        const rawToken = req.headers["authorization"];

        if (!rawToken) {
            return res.status(403).json({
                status: "error",
                message: "No token was provided. Access denied",
            });
        }

        const token = rawToken.split(" ")[1];

        const { userId } = jwt.verify(token, process.env.SECRET_KEY);
        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token. Access denied",
            });
        }

        const userExist = await User.findOne({ where: { userId } });
        if (!userExist) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token. Access denied",
            });
        }
        req.userId = userId;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: error.message,
            message: "Error occurred during token validation",
        });
    }
};

module.exports = authenticateUser;
