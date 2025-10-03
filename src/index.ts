import { Elysia, file } from "elysia";

const app = new Elysia()
  .get("/", ({ set, status }) => {
    set.headers["x-powered-by"] = "Elysia";
    return status(418, "I'm a teapot");
  })
  .get("/file", () => file("public/README.md"))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
