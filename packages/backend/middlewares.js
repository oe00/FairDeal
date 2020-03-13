const jwt = require('jsonwebtoken');
const {
    OAuth2Request,
} = require('./models');
const {UnauthorisedError} = require('./exceptions');
const {tokenSecret} = process.env;

const authMiddleware = async (req, res, next) => {
    // This should be replaced by key-value pair storage like memcache
    // or redis when traffic increased
    try {
        if (!req.headers.authorization) {
            throw new UnauthorisedError('Unauthorised request.');
        }

        const auth = new OAuth2Request();
        const res = await auth.validateToken(
            req.headers.authorization
        );

        next();
    } catch (err) {
        res.status(err.statusCode).send(err);
    }
};

const userCodeVerifier = (req, res, next) => {
    try {

        const decoded = jwt.verify(
            req.headers.authorization,
            tokenSecret
        );

        if (!decoded || decoded.data.code !== req.params.code) {
            throw new UnauthorisedError('Invalid user ID.');
        }
        res.locals.auth = decoded.data;
        next();
    } catch (err) {
        res.status(err.statusCode).send(err);
    }
};

const storeIdVerifier = (req, res, next) => {
        next();
};

module.exports = {
    authMiddleware,
    userCodeVerifier,
    storeIdVerifier,
};
