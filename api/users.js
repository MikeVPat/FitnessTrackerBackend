const express = require("express");
const usersRouter = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET = "neverTell" } = process.env;

const { getUserByUsername, getUser, createUser, getUserById, getPublicRoutinesByUser } = require("../db");
const { requireUser } = require("./utils");


const usersRouter.post("/register", async(request, response, next) => {

    try {
        const { username, password } = request.body;
        const _user = await getUserByUsername(username);
        if (_user) {
          next({
            name: 'UserExistsError',
            message: 'Username is already in use.'
          });
        } else if (password.length < 8) {
          next({
            name: 'PasswordLengthError',
            message: 'Password Too Short!'
          });

        } else {
          const user = await createUser({ username, password });
          if (!user) {
            next({
              name: 'UserCreationError',
              message: 'There was a problem registering you. Please try again.',
            });
          } else {
            const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET);
            response.send({ user, message: "you're signed up!", token });
          }
        }
      } catch (error) {
        next(error)
      }
    })

const usersRouter.post("/login", async(request, response, next) => {
    const { username, password } = request.body;

    if (!username || !password) {
        next({
          name: 'MissingCredentialsError',
          message: 'Please supply both a username and password'
        });
      }

    try {
        const user = await getUser({username, password});

        

        if (user) {
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET );

            response.send({ user, message: "You are logged in!", token: token});
        } else {
            next({
                name: "MissingCredentialsError",
                message: "Please supply both a username and password"
            });
        }
    } catch (error) {
        next(error);
    }
});

const usersRouter.get("/me", requireUser, async(request, response, next) => {
    
    try {
        response.send(request.user);
        
    } catch (error) {
        next(error)
    }
});

const usersRouter.get("/:username/routines", async(request, response, next) => {
    const { username } = request.params;

    const userRoutines = await getPublicRoutinesByUser({ username });
    response.send(userRoutines);
});


module.exports = usersRouter;