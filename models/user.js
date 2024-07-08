"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.belongsToMany(models.Organisation, {
                through: models.UserOrganisations,
                foreignKey: "userId",
                as: "organisations",
            });
        }
    }

    User.init(
        {
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                unique: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "User",
        }
    );

    return User;
};
