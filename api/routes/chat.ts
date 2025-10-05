import { Elysia, sse, t } from "elysia";
import OpenAI from "openai";
import { GEMINI_MODEL, ZGEN_PROMPT } from "../constants/chat.js";
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
        model: GEMINI_MODEL,
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
      try {
        const stream = await openai.chat.completions.create({
          model: GEMINI_MODEL,
          messages: [
            { role: "system", content: ZGEN_PROMPT },
            ...body.messages,
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;

          if (content) {
            // JSON.stringify 会自动转义特殊字符
            yield sse(
              JSON.stringify({
                content: content,
                type: "chunk",
              })
            );
          }

          if (chunk.choices[0]?.finish_reason) {
            yield sse(
              JSON.stringify({
                type: "done",
                finish_reason: chunk.choices[0].finish_reason,
              })
            );
            break;
          }
        }
      } catch (error) {
        yield sse(
          JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })
        );
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
        model: GEMINI_MODEL,
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
