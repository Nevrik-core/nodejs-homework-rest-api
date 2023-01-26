const express = require("express");
const { tryCatchWrapper } = require("../../helpers/index");

const { getCurrentUser, subscriptionStatusUpdate } = require("../../controllers/user.controller");
const { auth } = require("../../middlewares/auth");

const userRouter = express.Router();

userRouter.get("/current", tryCatchWrapper(auth), tryCatchWrapper(getCurrentUser));
userRouter.patch("/", tryCatchWrapper(auth), tryCatchWrapper(subscriptionStatusUpdate));

module.exports = {userRouter};