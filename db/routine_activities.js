const client = require('./client');

const util = require("./util");

export async function getRoutineActivityById(id) {
    try {
        const { rows: [ routine_activity ] } = await client.query(`
        SELECT * 
        FROM routine_activities
        WHERE id=$1
        `, [id])
        
        return routine_activity
    } catch (error) {
        throw error
    }
}

export async function addActivityToRoutine({
    routineId,
    activityId,
    count,
    duration
}) {

    try {
        const { rows: [routine_activity] } = await client.query(`
        INSERT INTO routine_activities("routineId", "activityId", "duration", "count") 
        VALUES($1, $2, $3, $4)
        ON CONFLICT ("routineId", "activityId")
        DO NOTHING 
        RETURNING *;
      `, [routineId, activityId, duration, count]);

        return routine_activity;
    } catch (error) {
        throw error;
    }
}

export async function updateRoutineActivity ({id, ...fields}) {
    try {
      const toUpdate = {}
      for(let column in fields) {
        if(fields[column] !== undefined) toUpdate[column] = fields[column];
      }
      let routineActivity;
      if (util.dbFields(fields).insert.length > 0) {
        const {rows} = await client.query(`
          UPDATE routine_activities
          SET ${ util.dbFields(toUpdate).insert }
          WHERE id = ${ id }
          RETURNING *;
        `, Object.values(toUpdate));
        routineActivity = rows[0];
        return routineActivity;
      }
    } catch (error) {
      throw error;
    }
  }

export async function destroyRoutineActivity(id) {
    try {
        const { rows: [ deleteRoutineActivity ] } = await client.query(`
        DELETE 
        FROM routine_activities
        WHERE id=$1
        RETURNING *;
        `,[id])

        return deleteRoutineActivity
    } catch (error) {
        throw error
    }
}

export async function getRoutineActivitiesByRoutine({ id }) {
    try {
        const { rows:  activities  } = await client.query(`
        SELECT "activityId"
        FROM routine_activities
        WHERE "routineId"=$1
        `, [id])

        return activities
    } catch (error) {
        throw error
    }
}

export async function canEditRoutineActivity( routineActivityId, userId ) {
    const { rows: [ routineFromRoutineActivity ] } = await client.query(`
        SELECT * FROM routine_activities
        JOIN routines ON routine_activities."routineId" = routines.id
        AND routine_activities.id = $1
      `, [routineActivityId]);
      return routineFromRoutineActivity.creatorId === userId;
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
