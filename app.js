const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const contactsRouter = require('./routes/api/contacts');
const { authRouter } = require("./routes/api/auth");
const { userRouter } = require("./routes/api/user");

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/users', authRouter);
app.use('/api/users', userRouter);





// Error handlings

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
});


app.use((err, req, res, next) => {
  console.log(err.name);


  // validation error handling
  if (err.name === "ValidationError") {
    return res.status(400).json({message: err.message})
  }
  // duplicate name when adding contact error handling
  if (err.message.includes("E11000 duplicate key error")) {
    return res.status(400).json({message: err.message})
  }

  // login user error handling
  if (err.name === "WrongUser" || err.name === "UnauthorizedError") {
    return res.status(401).json({message: err.message})
  }
if (err.name === "NotFound") {
    return res.status(404).json({message: err.message})
  }

  // duplicated email error handling
  if (err.name === "ConflictError") {
    return res.status(409).json({message: err.message})
  }
  return res.status(500).json({ message: err.message })
});

module.exports = app;
