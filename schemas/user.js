const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const schema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        validate: {
                validator: function (v) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: "Please enter a valid email"
            },
    },
    password: {
        type: String,
        minLength: [6, "password should be at least 6 characters long"]
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
        default: null,
     },
    avatarURL: String,
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: [true, 'Verify token is required'],
    },
},
{
    timestamps: true,
});

const userValidationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const subscriptionValidationSchema = Joi.object({
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter"),
});

schema.pre("save", async function () {
  console.log("pre save", this);
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
});

const User = mongoose.model("user", schema);

module.exports = {
    User,
    userValidationSchema,
    subscriptionValidationSchema
}