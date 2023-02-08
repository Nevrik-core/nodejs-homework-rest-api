const { Conflict, Unauthorized, BadRequest } = require("http-errors");
const { HttpError } = require("../helpers");
const sendMail = require("../helpers/sendMail")
const { User, userValidationSchema } = require('../schemas/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require("gravatar");
const { v4 } = require("uuid");

const { JWT_SECRET } = process.env;

async function register(req, res, next) {
    const { email, password } = req.body; 
    const verificationToken = v4();
    try {

        // Validate the input
        const validationResult = userValidationSchema.validate({ email, password });
        if (validationResult.error) {
            throw new BadRequest(validationResult.error.message);
        }

         // Check if the email already exists
        const user = await User.findOne({ email });
        if (user) {
            throw new Conflict("Email already in use");
        }

         // Generate the avatar URL
        const avatarURL = gravatar.url(email);

        // Save the user
        const savedUser = await User.create({
            email,
            password,
            avatarURL,
            verificationToken
        });
        
        // Send confirmation email
        await sendMail(email, verificationToken);

        res.status(201).json({
            data: {
                user: {
                    email,
                    subscription: "starter",
                    avatarURL
                },
            },
        });
        console.log(`user ${email}, successfully created!`)
    } catch (error) {
        if (error.message.includes('E11000 duplicate')) {
            throw Conflict("Email in use");
        }
        throw error;
    }
};

async function login(req, res, next) {

    const { email: userEmail, password } = req.body;
    const user = await User.findOne({
        email: userEmail,
    })
    if (!user) {
        throw new HttpError(401, "Email or password is wrong", "WrongUser")
    };

    if (!user.verify) {
        throw new HttpError(401, "Email is not verified. Please check your mail box.", "WrongUser")
    };

    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        throw new HttpError(400, "missing required name field", "ValidationError");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Unauthorized("Password is not valid")
    }
    const payload = { id: user._id };
    const token = jwt.sign(payload, JWT_SECRET);
    await User.findByIdAndUpdate(user._id, { token });
    const { email, subscription} = user;
    return res.status(200).json({
        data: {
            token,
            user: {
                email,
                subscription,
            },
        },
    });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
};

module.exports = {
    register,
    login,
    logout
}