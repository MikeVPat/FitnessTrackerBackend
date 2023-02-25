const client = require('./client');
const bcrypt = require("bcrypt");

export async function createUser({ username, password }) {
    const SALT_COUNT = 10;

    const hashedPwd = await bcrypt.hash(password, SALT_COUNT)
    try {
        const { rows: [ user ]} = await client.query(`
        INSERT INTO users(username, password)
        VALUES($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, hashedPwd]);

        delete user.password; // confirm this?

        return user;
    } catch (error) {
        throw error;
    }
}

export async function getUser({ username, password }) {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;

    const comparePassword = await bcrypt.compare(password, hashedPassword)

    if (comparePassword) {
        delete user["password"];

        return user;
    }


}

export async function getUserById(id) {
    try {
        const { rows: [ user ] } = await client.query(`
        SELECT *
        FROM users
        WHERE id=$1;
      `, [id]);

        return user
      } catch (error) {
          throw error;
      }
}


export async function getUserByUsername(username) {
    try {
        const { rows: [ user ] } = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1;
        `, [username]);

      return user;
    } catch (error) {
      throw error;
    }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
