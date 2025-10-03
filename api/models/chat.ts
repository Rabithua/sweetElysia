import { t } from "elysia";

export const ChatModel = {
  messages: t.Array(
    t.Object({
      role: t.Enum({ user: "user", assistant: "assistant" }),
      content: t.String(),
    })
  ),
  prompt: t.String(),
};
