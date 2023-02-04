const express = require('express');

const {register, login, logout} = require("../../controllers/auth.controller")
const {tryCatchWrapper} = require("../../helpers/index")

const authRouter = express.Router();

authRouter.post("/signup", tryCatchWrapper(register));
authRouter.post("/login", tryCatchWrapper(login));
authRouter.post("/logout", tryCatchWrapper(logout));

module.exports = {
    authRouter,
}