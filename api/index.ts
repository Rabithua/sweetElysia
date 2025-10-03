import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { geminiRoutes } from "./routes/chat.js";

const app = new Elysia()
  .use(openapi())
  .use(geminiRoutes)
  .all("/", "hello,sweet elysia!");

export default app;
