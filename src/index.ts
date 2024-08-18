import { Elysia, t } from "elysia";
import { userDB, User } from "./Database/db";
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt'
import { timingMiddleware } from './Middleware/timeRequestMiddleware'

let start: number;

const app = new Elysia()
  .use(timingMiddleware)
  .use(jwt({
    name: 'jwt',
    secret: '182770cc8b7e093e0f31138af403c39682594c3d39eb295bf4760fb90a314d8e',
    exp: '1h'
  }))
  .decorate('db', new userDB())
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
  }).get('/user/:id', async ({ db, params }) => {                   // Get User With ID
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
  }).post('/user',
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
    })
  .put('/user/:id', async ({ db, params, body }) => {                           // Update User
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
    })
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
  .post('/login', async ({ jwt, body, db }) => {
    try {
        const input = body as User;
        const findUserByMail = await db.searchUserByMail(input.email) as User;
        
        if (!findUserByMail) {
          return {
            status: {
              code: 400,
              message: "Can't find the user"
            }
          }
        }

        const payload = {
          id: findUserByMail.id,
          name: findUserByMail.name,
          email: findUserByMail.email
        }

        const token = await jwt.sign(payload);
        
        return {
          status: {
            code: 200,
            message: "Success to login"
          }, 
          token: token
        }
    } catch (error) {
        return {
          status:{
            code: 400,
            message: "An error occurred during login."
          },
            error: error
        };
    }
}).get('/checkauth', async({headers, jwt}) => {
  const bearer = headers.authorization?.split(' ')[1];

  if (!bearer) {
    return {
      status:{
        code: 401,
        message: "Not authorized"
      }
    }
  }

  const jwtPayload = await jwt.verify(bearer)

  try {
    return {
      status: {
        code: 200,
        message: "Authorized"
      },
      data: jwtPayload
    }
  } catch (error) {
    return{
      status: {
        code: 401,
        message: "Not Authorized"
      }
    }
  }
})
  .use(cors())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);