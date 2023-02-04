const express = require("express");
const { tryCatchWrapper } = require("../../helpers/index");

const { getCurrentUser, subscriptionStatusUpdate, uploadAvatar } = require("../../controllers/user.controller");
const { auth } = require("../../middlewares/auth");
const upload = require("../../middlewares/upload")

const userRouter = express.Router();

userRouter.get("/current", tryCatchWrapper(auth), tryCatchWrapper(getCurrentUser));
userRouter.patch("/", tryCatchWrapper(auth), tryCatchWrapper(subscriptionStatusUpdate));
userRouter.patch("/avatars", tryCatchWrapper(auth), upload.single("avatar"), tryCatchWrapper(uploadAvatar));

module.exports = {userRouter};