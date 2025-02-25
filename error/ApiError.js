class ApiError extends Error {
    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'User is not authorized');
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static InternalError(message, errors = []) {
        return new ApiError(500, message, errors);
    }

    static Forbidden(message, errors = []) {
        return new ApiError(403, message, errors);
    }
}

module.exports = ApiError;
