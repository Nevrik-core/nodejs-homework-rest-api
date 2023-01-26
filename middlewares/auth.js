const { HttpError } = require("../helpers");
const jwt = require("jsonwebtoken");
const { User } = require("../schemas/user");

async function auth (req, res, next) {
   
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(" ");   
    if (type !== "Bearer") {
        throw HttpError(401, "token type is not valid", "UnauthorizedError")
    }
    if (!token) {
        throw HttpError(401, "no token provided", "UnauthorizedError")
    }
    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);
        if (!user || !user.token) {
          throw new HttpError(401, "Not authorized", "UnauthorizedError");
        }
        req.user = user;
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            throw HttpError(401, "jwt token is not valid", "UnauthorizedError")
        }
        throw error;
    }   
    next();
}

module.exports = {
    auth    
}