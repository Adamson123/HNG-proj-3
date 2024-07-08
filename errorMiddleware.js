class CustomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof CustomError) {
        return res.status(err.status).json(err.message);
    }

    return res.status(500).send("Internal Server Error");
};

module.exports = { CustomError, errorMiddleware };
