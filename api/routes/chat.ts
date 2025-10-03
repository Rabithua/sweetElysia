import { Elysia, sse, t } from "elysia";
import OpenAI from "openai";
import { ZGEN_PROMPT } from "../constants/chat.js";
import { ChatModel } from "../models/chat.js";

let openai: OpenAI;

export const geminiRoutes = new Elysia({
  prefix: "/v1/chat",
})
  .onBeforeHandle(() => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set, please set it in the environment variables."
      );
    } else {
      openai = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    }
  })
  .get(
    "/completions",
    async ({ query: { prompt } }) => {
      return await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: ZGEN_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
    },
    {
      query: t.Object({
        prompt: ChatModel.prompt,
      }),
    }
  )
  .post(
    "/completions/stream",
    async function* ({ body }) {
      const stream = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: ZGEN_PROMPT,
          },
          ...body.messages,
        ],
        stream: true,
      });
      for await (const event of stream) {
        yield sse(event.choices[0]?.delta.content || "done");
      }
    },
    {
      body: t.Object({
        messages: ChatModel.messages,
      }),
    }
  )
  .post(
    "/completions",
    async ({ body }) => {
      return await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: ZGEN_PROMPT,
          },
          ...body.messages,
        ],
      });
    },
    {
      body: t.Object({
        messages: ChatModel.messages,
      }),
    }
  );
