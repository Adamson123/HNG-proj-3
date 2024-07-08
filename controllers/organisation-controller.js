const { where } = require("sequelize");
const { sequelize } = require("../models");
const { User, UserOrganisations, Organisation } = require("../models");

const getUserOrganisations = async (req, res) => {
    try {
        const userId = req.userId;

        const organisations = await Organisation.findAll({
            include: [
                {
                    model: User,
                    as: "users",
                    where: { userId },
                },
            ],
        });

        const org = organisations.map(
            (o) =>
                (o = {
                    orgId: o.orgId,
                    name: o.name,
                    description: o.description,
                })
        );
        res.status(200).json({
            status: "success",
            message: "Organisations retrieved successfully",
            data: { organisations: org },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching the organisations",
            error: error.message,
        });
    }
};

const getSingleOrganisation = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const userId = req.userId;

        const organisation = await Organisation.findByPk(orgId, {
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        });

        if (!organisation) {
            return res.status(404).json({
                status: "error",
                message: "Organisation not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Organisation retrieved successfully",
            data: organisation,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching the organisation",
            error: error.message,
        });
    }
};

const createOrganisation = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.userId;

        if (!name) {
            return res.status(422).json({
                errors: [{ field: "name", message: "Name is required" }],
            });
        }

        const org = await Organisation.create({
            orgId: `ORG_${Date.now()}`,
            name: `${name}'s Organisation`,
            description: description,
        });

        await UserOrganisations.create({
            userId,
            orgId: org.orgId,
        });

        res.status(201).json({
            status: "success",
            message: "Organisation created successfully",
            data: {
                orgId: org.orgId,
                name: org.name,
                description: org.description,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "Bad Request",
            message: "Client error",
            statusCode: 400,
        });
    }
};

const addUserToOrganisation = async (req, res) => {
    try {
        const { userId } = req.body;
        const orgId = req.params.orgId;

        const organisation = await Organisation.findByPk(orgId);
        if (!organisation) {
            return res.status(404).json({
                status: "error",
                message: "Organisation not found",
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        const alreadyInOrg = await UserOrganisations.findOne({
            where: { userId, orgId },
        });

        if (alreadyInOrg) {
            return res.status(400).json({
                status: "error",
                message: "User already in organisation",
            });
        }

        await UserOrganisations.create({ userId, orgId });

        res.status(200).json({
            status: "success",
            message: "User added to organisation successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message:
                "An error occurred while adding the user to the organisation",
            error: error.message,
        });
    }
};

module.exports = {
    getUserOrganisations,
    getSingleOrganisation,
    createOrganisation,
    addUserToOrganisation,
};
