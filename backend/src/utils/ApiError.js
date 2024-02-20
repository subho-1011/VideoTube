class ApiError extends Error {
    constructor(
        statusCode,
        message = "Seomthing error",
        errors = [],
        statck = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.succes = false; 
        this.errors = errors;

        if (statck) {
            this.statck = statck;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};

export { ApiError };