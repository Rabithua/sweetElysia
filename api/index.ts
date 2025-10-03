import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";

export default new Elysia()
  .use(openapi())
  .get("/", ({ set, status }) => {
    set.headers["x-powered-by"] = "Elysia";
    return status(200, "hello elysia");
  })
  .compile();
