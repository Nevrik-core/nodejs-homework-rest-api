const { HttpError } = require("../helpers");
const { subscriptionValidationSchema, User } = require("../schemas/user");


async function getCurrentUser(req, res, next) {
    const { user } = req;
    const { email, _id: id } = user;
    return res.status(201).json({
        data: {
            user: {
                email,
                id
            },
        },
    });
};




async function subscriptionStatusUpdate(req, res, next) {
    const { _id } = req.user;
    const { error } = subscriptionValidationSchema.validate(req.body);
    if (error) {
        throw HttpError(401, "missing field subscription", "ValidationError");
    }
    const data = await User.findByIdAndUpdate(_id, req.body, { new: true });
    if (!data) {
        throw HttpError(404, "Not found");
    }
    res.status(200).json(data);
}


module.exports = {
    getCurrentUser,
    subscriptionStatusUpdate
}