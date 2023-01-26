const mongoose = require("mongoose");
const Joi = require("joi");

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

const User = mongoose.model("user", schema);

module.exports = {
    User,
    userValidationSchema,
    subscriptionValidationSchema
}