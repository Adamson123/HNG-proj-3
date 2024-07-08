const { sequelize } = require("../models");
const { User, UserOrganisations, Organisation } = require("../models");

const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(typeof userId);

        const user = await User.findOne({
            where: { userId },
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        });
        //   include: [
        //     {
        //         model: Organisation,
        //         as: "organisations",
        //         through: { attributes: [] },
        //     },
        // ],

        if (!user) {
            return res.status(404).json({
                status: "User not found",
                message: "Error getting user",
            });
        }

        res.json({
            status: "success",
            message: "<message>",
            data: user,
        });
    } catch (error) {
        console.log(error.message);
        // return res.status(500).json({
        //     status: error.message,
        //     message: "Error getting user",
        // });
    }
};

module.exports = { getSingleUser };
