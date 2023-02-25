
const express = require('express');
const activitiesRouter = express.Router();


const { getAllActivities,
        createActivity,
        updateActivity,
        getActivityById,
        getPublicRoutinesByActivity
} = require('../db/activities');
const { ActivityExistsError,
        ActivityNotFoundError
} = require('../errors')



activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
    const fields = {};
    fields.id = req.params.activityId;
    console.log("id:",fields.id);
    try{
        const doesActivityExist = await getActivityById(fields.id);
        console.log("doesActivityExist", doesActivityExist);
        if(doesActivityExist){
            console.log("activity Exists");
            const publicRoutinesByActivity = await getPublicRoutinesByActivity(fields.id);
        console.log("routines:",publicRoutinesByActivity);
        res.send(publicRoutinesByActivity);
        } else {
            res.send({
                name:"ActivityNotFoundError",
                message:ActivityNotFoundError(req.params.activityId),
                error: ActivityExistsError(req.params.activityId)
            })
        }  
    } catch (error){
        next(error);
    }
})


activitiesRouter.get("/", async (req, res, next) => {
    try{
        const allActivities = await getAllActivities()
        res.send(allActivities);
    } catch (error){
        next(error);
    }
})


activitiesRouter.post("/", async (req, res, next) => {
    
    const fields = {};
    fields.name = req.body.name;
    fields.description = req.body.description;
    
    try{
        const newActivity = await createActivity(fields);
        
        if(newActivity === true){
        res.send({
            name:"ActivityExistsError",
            message:ActivityExistsError(req.body.name),
            error: ActivityExistsError(req.body.name)
        })
        }
        else {
        
        res.send(newActivity);
        }
    } catch (error){
        next(error)
    }
})



activitiesRouter.patch("/:activityId", requireUser, requiredNotSent({requiredParams: ['name', 'description'], atLeastOne: true}), async(request, response, next) => {
    try {
        const { activityId } = request.params;
        const { name, description } = request.body;
        const getActivity = await getActivityById(activityId)

        if (!getActivity) {
            next({
                name: "ActivityNotFound",
                message: `There is no activity by this ID ${activityId}`
            })
        } else {
            const updatedActivity = await updateActivity( {id: activityId, name, description });
            if(updatedActivity) {
                response.send(updatedActivity);
            } else {
                next({
                    name: "UpdateError",
                    message: "Failed to update activity"
                })
            }
        }
    } catch (error) {
        next(error)
    }  
});

module.exports = activitiesRouter;


