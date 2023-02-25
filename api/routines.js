const express = require('express');
const router = express.Router();

const { requireUser, requiredNotSent} = require("./utils");
const { getAllPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine } = require("../db/routines");
const {getRoutineActivitiesByRoutine, addActivityToRoutine } = require("../db/routine_activities");

routinesRouter.get("/", async(req, res, next) => {
    try {
        const allPublicRoutinesWithactivities = await getAllPublicRoutines();
        response.send(allPublicRoutinesWithactivities);

    } catch (error) {
        throw (error);
    }
});

const routinesRouter.post("/", requireUser, async(req, res, next) => {
    const { name, goal, isPublic } = req.body;
    const creatorId = req.user.id; 

    try {
        const createdRoutine = await createRoutine({ creatorId, isPublic, name, goal });
        res.send(createdRoutine);

    } catch(error) {
        throw (error);
    }
});

const routinesRouter.patch('/:routineId', requireUser, requiredNotSent({requiredParams: ['name', 'goal', 'isPublic'], atLeastOne: true}), async (request, response, next) => {
    try {
      const {routineId} = request.params;
      const {isPublic, name, goal} = request.body;
      const getRoutine = await getRoutineById(routineId);
      if(!getRoutine) {
        next({
          name: 'NotFound',
          message: `No routine found using ID ${routineId}`
        })
      } else if(getRoutine.creatorId !== request.user.id) {
        next({
          name: "WrongUserError",
          message: "You can not update a routine which is not yours."
        });
      } else {
        const updatedRoutine = await updateRoutine({id: routineId, isPublic, name, goal});
        if(updatedRoutine) {
          response.send(updatedRoutine);
        } else {
          next({
            name: 'FailedToUpdate',
            message: 'Error updating your routine'
          })
        }
      }
    } catch (error) {
      next(error);
    }
  });
module.exports = router;

const routinesRouter.delete('/:routineId', requireUser, async (request, response, next) => {
    try {
      const {routineId} = request.params;
      const getRoutine = await getRoutineById(routineId);
      if(!getRoutine) {
        next({
          name: 'NotFound',
          message: `No routine by this ID ${routineId}`
        })
      } else if( getRoutine.creatorId !== request.user.id) {
        next({
          name: "WrongUserError",
          message: "You can get routine which is not yours"
        });
      } else {
        const deletedRoutine = await destroyRoutine(routineId)
        response.send({success: true, ...deletedRoutine});
      }
    } catch (error) {
      next(error);
    }
  });

 const routinesRouter.post("/:routineId/activities", requiredNotSent({requiredParams: ['activityId', 'count', 'duration']}), async(request, response, next) => {
    
    try {
        const {activityId, count, duration} = request.body;
        const {routineId} = request.params;

        const foundRoutineActivities = await getRoutineActivitiesByRoutine({id: routineId});
        const existingRoutineActivities = foundRoutineActivities && foundRoutineActivities.filter(routineActivity => routineActivity.activityId === activityId);

        if(existingRoutineActivities && existingRoutineActivities.length) {
          next({
            name: 'RoutineActivityExistsError',
            message: "A routine_activity by that routineId and activityId combination already exists"
          });

        } else {
          const attachActivityToRoutine = await addActivityToRoutine({ routineId, activityId, count, duration });
          if(attachActivityToRoutine) {
            response.send(attachActivityToRoutine);

          } else {
            next({
              name: 'FailedToCreate',
              message: "There was an error adding Activity"
            })
          }
        }
     } catch (error) {
        throw (error);
    }
});

module.exports = routinesRouter;
