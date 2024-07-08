"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserOrganisations extends Model {
        static associate(models) {
            // associations can be defined here
        }
    }

    UserOrganisations.init(
        {
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            orgId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "UserOrganisations",
        }
    );

    return UserOrganisations;
};
