const ApiError = require("../error/ApiError");

class Validate {


    validateEmail(email) {
        try {
            if (typeof email !== 'string') {
                throw ApiError.BadRequest('Email must be a string');
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                throw ApiError.BadRequest('Invalid email format');
            }
            if (email.length > 320) {
                throw ApiError.BadRequest('Email is too long');
            }
            return true;
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }

    validatePassword(password) {
        try {
            if (typeof password !== 'string') {
                throw ApiError.BadRequest('Password must be a string');
            }
            if (password.length < 6) {  
                throw ApiError.BadRequest('Password must be at least 6 characters long');
            }
            if (password.length > 60) {
                throw ApiError.BadRequest('Password must not exceed 60 characters');
            }
            return true;
        } catch (e) {
            if (e instanceof ApiError) {
                throw e;
            }
            throw ApiError.InternalError('Internal server error. Please try again later.');
        }
    }
}

module.exports = new Validate();
