const express = require('express');
const router = express.Router();

const routine_activities = express.Router();
const { requireUser, requiredNotSent } = require("./utils");
const { getRoutineActivityById, updateRoutineActivity, destroyRoutineActivity, canEditRoutineActivity } = require("../db");


routine_activities.patch('/:routineActivityId', requireUser, requiredNotSent({requiredParams: ['count', 'duration'], atLeastOne: true}), async (request, response, next) => {
    try {
      const {count, duration} = request.body;
      const {routineActivityId} = request.params;
      
      const getRoutineActivity = await getRoutineActivityById(routineActivityId);
      if(!getRoutineActivity) {
        next({
          name: 'NotFound',
          message: `No Activity found by the ID ${routineActivityId}`
        })
      } else {
        if(!await canEditRoutineActivity(routineActivityId, request.user.id)) {
            next({
              name: "UnauthorizedUser", 
              message: "You are not authorized to edit this Activity."
            });
        } else {
          const updatedRoutineActivity = await updateRoutineActivity({id: routineActivityId, count, duration})
          response.send(updatedRoutineActivity);
        }
      }
    } catch (error) {
      next(error);
    }
  });
  
  
  routine_activities.delete('/:routineActivityId', requireUser, async (request, response, next) => {
    try {
        const { routineActivityId } = request.params;
      if(!await canEditRoutineActivity(routineActivityId, request.user.id)) {
        next({
            name: "UnauthorizedUser", 
            message: "You are not authorized to edit this Activity."
        });
      } else {
        const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId)
        response.send({success: true, ...deletedRoutineActivity});
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = routine_activities;