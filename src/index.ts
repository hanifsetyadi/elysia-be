import { Elysia, t } from "elysia";
import { userDB, User } from "./Database/db";
import { cors } from '@elysiajs/cors'

let start: number;

const app = new Elysia()
  .onRequest(() => {
    start = Bun.nanoseconds();
  }).onAfterHandle(() => {
    const end = Bun.nanoseconds();
    const duration = (end - start) / 1_000_000;
    console.log(`Request processed in ${duration}ms`);
  }).decorate('db', new userDB())
  .get('/', () => "Hello World")
  .get('/user', async ({ db }) => {                                 // Get User
    try {
      const users = await db.getUser();
      return {
        status: {
          code: 200,
          message: "Success fetching the API!"
        },
        data: users
      }
    } catch (error) {
      console.log(error);
      return {
        status: {
          code: 400,
          message: "Failed to fetch the API!"
        }
      }
    }
  }).get('/user/:id', async ({ db, params }) => {
    try {
      const x = await db.getUserWithID(parseInt(params.id));
      return {
        status: {
          code: 200,
          message: "Success fetching the API!"
        },
        data: x
      }
    } catch (error) {
      console.log(error);
      return {
        status: {
          code: 400,
          message: "Failed to fetch the API!"
        }
      }
    }
  })
  .post('/user',
    async ({ db, body }) => {
      try {
        const user = await db.addUser(body as User);
        return {
          status: {
            code: 200,
            message: "Success to create user!"
          },
          data: user
        }
      } catch (error) {
        console.error(error);
        return {
          status: {
            code: 400,
            message: "Failed to create user!"
          },
          error: error
        }
      }
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 1,
          maxLength: 55,
          error: "Invalid Name Format"
        }),
        email: t.String({
          format: 'email',
          maxLength: 55,
          error: "Invalid email format or exceeds 55 characters"
        })
      })
    }
  )
  .put('/user/:id', async({ db, params, body }) => {                           // Update User
    try {
      await db.updateUser(parseInt(params.id), body as User)
      return {
        status: {
          code: 200,
          message: "Success to Update user!"
        }
      }
    } catch (error) {
      console.log(error);
      return {
        status: {
          code: 400,
          message: "Failed to Update user!"
        }
      }
    }
  },
  {
    body: t.Object({
      name: t.String({
        minLength: 1,
        maxLength: 55,
        error: "Invalid Name Format"
      }),
      email: t.String({
        format: 'email',
        maxLength: 55,
        error: "Invalid email format or exceeds 55 characters"
      })
    })
  }
  )
  .delete('/user/:id', ({ db, params }) => {                        // Delete User
    try {
      db.deleteUser(parseInt(params.id))
      return {
        status: {
          code: 200,
          message: "Success to Delete user!"
        }
      }
    } catch (error) {
      console.log();
      return {
        status: {
          code: 400,
          message: "Failed to delete user!"
        }
      }
    }
  })
  .use(cors())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);