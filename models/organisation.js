"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Organisation extends Model {
        static associate(models) {
            this.belongsToMany(models.User, {
                through: models.UserOrganisations,
                foreignKey: "orgId",
                as: "users",
            });
        }
    }

    Organisation.init(
        {
            orgId: {
                type: DataTypes.STRING,
                primaryKey: true,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "Organisation",
        }
    );

    return Organisation;
};
