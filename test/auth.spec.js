const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../index");
const { sequelize, User, Organisation } = require("../models");

jest.setTimeout(30000);

describe("Auth Endpoints", () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
        await Organisation.destroy({ where: {} });
    });

    describe("POST /auth/register", () => {
        it("Should register user successfully with default organisation", async () => {
            const res = await request(app).post("/auth/register").send({
                firstName: "blu",
                lastName: "heart",
                email: "blu@example.com",
                password: "isPassword",
                phone: "1234567890",
            });
            const verifyToken = jwt.verify(
                res.body.data.accessToken,
                process.env.SECRET_KEY
            );

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.user).toHaveProperty("userId");
            expect(res.body.data.user.firstName).toBe("blu");

            expect(res.body.data.user.lastName).toBe("heart");

            expect(res.body.data.user.email).toBe("blu@example.com");
            expect(res.body.data.accessToken).toBeDefined();

            expect(verifyToken.userId).toBeDefined();

            const org = await Organisation.findOne({
                where: { name: "blu's Organisation" },
            });
            expect(org).not.toBeNull();
        });

        it("Should fail if required fields are empty", async () => {
            const requiredFields = [
                "firstName",
                "lastName",
                "email",
                "password",
            ];
            /* making request for each field that are required with them being empty */
            for (const field of requiredFields) {
                const body = {
                    firstName: "blu",
                    lastName: "heart",
                    email: "blu@example.com",
                    password: "isPassword",
                    phone: "1234567890",
                };
                body[field] = "";

                const res = await request(app)
                    .post("/auth/register")
                    .send(body);
                expect(res.statusCode).toEqual(422);
                expect(res.body.errors[0].field).toBe(field);
            }
        });

        it("Should fail if email has already beem used", async () => {
            await User.create({
                userId: "USER_1",
                firstName: "blu",
                lastName: "heart",
                email: "blu@example.com",
                password: "isPassword",
                phone: "1234567890",
            });

            const res = await request(app).post("/auth/register").send({
                firstName: "Jane",
                lastName: "heart",
                email: "blu@example.com",
                password: "isPassword",
                phone: "0987654321",
            });

            expect(res.statusCode).toEqual(422);
            expect(res.body.errors[0].field).toBe("email");
        });
    });

    describe("POST /auth/login", () => {
        beforeEach(async () => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("isPassword", salt);
            await User.create({
                userId: "USER_1",
                firstName: "blu",
                lastName: "heart",
                email: "blu@example.com",
                password: hashedPassword,
                phone: "1234567890",
            });
        });

        it("Should log the user in successfully", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "blu@example.com",

                password: "isPassword",
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.user).toHaveProperty("userId");

            expect(res.body.data.user.email).toBe("blu@example.com");
            expect(res.body.data.accessToken).toBeDefined();
        });

        it("Should fail if required fields are empty", async () => {
            const requiredFields = ["email", "password"];
            for (const field of requiredFields) {
                const body = {
                    email: "blu@example.com",
                    password: "isPassword",
                };

                body[field] = "";

                const res = await request(app).post("/auth/login").send(body);
                expect(res.statusCode).toEqual(422);
                expect(res.body.errors[0].field).toBe(field);
            }
        });

        it("Should fail if user with email does not exist", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "black@example.com",

                password: "isPassword",
            });

            expect(res.statusCode).toEqual(404);
        });

        it("Should fail if password is incorrect", async () => {
            const res = await request(app).post("/auth/login").send({
                email: "blu@example.com",
                password: "wrongpassword",
            });

            expect(res.statusCode).toEqual(401);
        });
    });
});
