const express = require('express');
const router = express.Router();

const client = require("../db");
const express = require("express");
const apiRouter = express.Router();

apiRouter.use(async (request, response, next) => {
    const prefix = 'Bearer ';
    const auth = request.header('Authorization');
    
    if (!auth) { 
      next();

    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
      
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
        
        if (id) {
          request.user = await getUserById(id);
          next();
        }
      } catch (error) {
        next(error);
      }
    } else {
      next({
        name: 'AuthorizationHeaderError',
        message: `Authorization token must start with ${ prefix }`
      });
    }
  });
  
  apiRouter.use((request, response, next) => {
    if (request.user) {
      console.log("User is set:", request.user);
    }
    next();
  });


apiRouter.get("/health", async(request, response, next) => {
    response.send({
        message: "Its Healthy"
    })
})

// GET /api/health
router.get('/health', async (req, res, next) => {
});

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

module.exports = router;
