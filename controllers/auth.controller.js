const { Conflict, Unauthorized } = require("http-errors");
const { User, userValidationSchema } = require('../schemas/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const { HttpError } = require("../helpers");

async function register(req, res, next) {
    const { email, password } = req.body; 

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt)
    try {
        const savedUser = await User.create({
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            data: {
                user: {
                    email,
                    subscription: "starter",
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
        userEmail,
    })
    if (!user) {
        throw new HttpError(401, "Email or password is wrong", "WrongUser")
    };
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        throw HttpError(400, "missing required name field", "ValidationError");
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
  res.status(204).json();
};

module.exports = {
    register,
    login,
    logout
}