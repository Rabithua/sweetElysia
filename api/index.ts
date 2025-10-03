import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

export default new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Elysia API",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/", ({ set, status }) => {
    set.headers["x-powered-by"] = "Elysia";
    return status(418, "I'm a teapot");
  })
  .compile();
