const { HttpError } = require("../helpers");
const { subscriptionValidationSchema, User } = require("../schemas/user");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const sendEmail = require('../helpers/sendMail')



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




async function uploadAvatar(req, res, next) {
    console.log("req.file", req.file);
    const { _id: id } = req.user;

    if (!id) {
    throw HttpError(401, "Not authorized", "UnauthorizedError");
    }
    
    const { filename, mimetype } = req.file;
    const avatarPublicPath = path.resolve(__dirname, "../public/avatars", filename);
    const avatarTmpPath = path.resolve(__dirname, "../tmp", filename);

    // Validate the image format
    if (!mimetype.startsWith("image")) {
        await fs.unlink(avatarTmpPath);
        throw HttpError(400, "File is not an image", "ValidationError");
    }

    try {
        // Move the image to its permanent location
        await fs.rename(avatarTmpPath, avatarPublicPath);

        // Resize the image
        const resizedImage = await Jimp.read(avatarPublicPath);
        resizedImage.resize(250, 250).write(avatarPublicPath);

        // Update the user's avatar URL
        const avatarURL = path.join("public", "avatars", filename);
        await User.findByIdAndUpdate(id, { avatarURL });
        res.json({ avatarURL });
    } catch (error) {
        await fs.unlink(avatarTmpPath);
        throw error;
    };
};

async function verifyEmail(req, res, next ) {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "Not found", "NotFound");
    }
    await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
    });
    res.json({ message: "Success" });
}

async function resendEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
        throw HttpError("missing required field email", "ValidationError");
    }
    
    const user = await User.findOne({email})
    if (!user) {
        throw HttpError(404, "Email not found", "NotFound");
    }
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed", "ValidationError");
    }
    const verificationToken = user.verificationToken;
    await sendEmail(email, verificationToken);
    res.json({ message: "Verification email resended" });
    
}


module.exports = {
    getCurrentUser,
    subscriptionStatusUpdate,
    uploadAvatar,
    verifyEmail,
    resendEmail,
}