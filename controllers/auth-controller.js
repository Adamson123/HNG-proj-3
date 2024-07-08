const { sequelize } = require("../models");
const { User, UserOrganisations, Organisation } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

       
        const requiredFields = [
            {
                required: firstName,
                msg: { field: "firstName", message: "First Name is required" },
            },
            {
                required: lastName,
                msg: { field: "lastName", message: "Last Name is required" },
            },
            {
                required: email,
                msg: { field: "email", message: "Email is required" },
            },
            {
                required: password,
                msg: { field: "password", message: "Password is required" },
            },
        ];

        const errors = requiredFields
            .filter((field) => !field.required)
            .map((field) => field.msg);
        if (errors.length) return res.status(422).json({ errors });

        const emailUsed = await User.findOne({ where: { email } });
        if (emailUsed)
            return res.status(422).json({
                errors: [
                    { field: "email", message: "Email is already in use" },
                ],
            });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            userId: `USER_${Date.now()}`,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
        });

        const org = await Organisation.create({
            orgId: `ORG_${Date.now()}`,
            name: `${firstName}'s Organisation`,
            description: "",
        });

        await UserOrganisations.create({
            userId: user.userId,
            orgId: org.orgId,
        });

        const token = jwt.sign(
            { userId: user.userId },
            process.env.SECRET_KEY,
            { expiresIn: "5h" }
        );

        res.status(201).json({
            status: "success",
            message: "Registration successful",
            data: {
                accessToken: token,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                },
            },
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            status: "Bad request",
            message: "Registration unsuccessful",
            statusCode: 400,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const requiredFields = [
            {
                required: email,
                msg: { field: "email", message: "Email is required" },
            },
            {
                required: password,
                msg: { field: "password", message: "Password is required" },
            },
        ];

        const errors = requiredFields
            .filter((field) => !field.required)
            .map((field) => field.msg);
        if (errors.length) return res.status(422).json({ errors });

        const user = await User.findOne({ where: { email } });
        if (!user)
            return res.status(404).json({
                status: "Not Found",
                message: "User with this email doesn't exist",
            });

        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect)
            return res.status(401).json({
                status: "Bad Request",
                message: "Password is incorrect",
            });

        const token = jwt.sign(
            { userId: user.userId },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            status: "success",
            message: "Login Successful",
            data: {
                accessToken: token,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                },
            },
        });
    } catch (error) {
        console.error(error.message);
        res.status(401).json({
            status: "Bad request",
            message: "Authentication failed",
            statusCode: 401,
        });
    }
};

module.exports = { register, login };
