const { Anthropic } = require("@anthropic-ai/sdk");
const { OpenAI } = require("openai");

function createModelSession(
  config,
  { system, prompt, tools = [], maxTokens = 4096 }
) {
  const { provider, model, apiKey } = config;

  const baseURLs = {
    openai: "https://api.openai.com/v1",
    openrouter: "https://openrouter.ai/api/v1",
    groq: "https://api.groq.com/openai/v1"
  };

  if (provider !== "anthropic" && !Object.hasOwn(baseURLs, provider)) {
    throw new Error("Desteklenmeyen sağlayıcı: " + provider);
  }

  const client = provider === "anthropic"
    ? new Anthropic({ apiKey })
    : new OpenAI({
        apiKey,
        baseURL: baseURLs[provider]
      });

  const history = [
    ...(provider === "openrouter" || provider === "groq"
      ? [{ role: "system", content: system }]
      : []),

    { role: "user", content: prompt }
  ];

  let previousResponseId;

  return {
    async next() {
      if (provider === "anthropic") {
        const response = await client.messages.create({
          model,
          system,
          messages: history,
          max_tokens: maxTokens,
          ...(tools.length ? { tools } : {})
        });

        if (!["tool_use", "end_turn"].includes(response.stop_reason)) {
          throw new Error(
            "Claude yanıtı tamamlanmadı: " + response.stop_reason
          );
        }

        history.push({
          role: "assistant",
          content: response.content
        });

        return {
          text: response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n"),

          toolCalls: response.content
            .filter((block) => block.type === "tool_use")
            .map((block) => ({
              id: block.id,
              name: block.name,
              input: block.input
            }))
        };
      }

      if (provider === "openai") {
        const response = await client.responses.create({
          model,
          instructions: system,
          input: history,
          previous_response_id: previousResponseId,
          store: true,
          max_output_tokens: maxTokens,

          ...(tools.length ? {
            tools: tools.map((tool) => ({
              type: "function",
              name: tool.name,
              description: tool.description,
              parameters: tool.input_schema,
              strict: tool.strict === true
            }))
          } : {})
        });

        if (response.status !== "completed") {
          throw new Error(
            "OpenAI yanıtı tamamlanmadı: " +
            (
              response.error?.message ||
              response.incomplete_details?.reason ||
              response.status
            )
          );
        }

        const toolCalls = response.output
          .filter((item) => item.type === "function_call")
          .map((item) => ({
            id: item.call_id,
            name: item.name,
            input: JSON.parse(item.arguments)
          }));

        previousResponseId = response.id;
        history.length = 0;

        return {
          text: response.output_text || "",
          toolCalls
        };
      }

      const response = await client.chat.completions.create({
        model,
        messages: history,
        max_tokens: maxTokens,

        ...(tools.length ? {
          tools: tools.map((tool) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.input_schema
            }
          }))
        } : {})
      });

      const choice = response.choices[0];

      if (
        !choice ||
        !["stop", "tool_calls"].includes(choice.finish_reason)
      ) {
        throw new Error(
          "Model yanıtı tamamlanmadı: " + choice?.finish_reason
        );
      }

      const message = choice.message;
      history.push(message);

      return {
        text: message.content || "",

        toolCalls: (message.tool_calls || []).map((call) => ({
          id: call.id,
          name: call.function.name,
          input: JSON.parse(call.function.arguments)
        }))
      };
    },

    addToolResults(results) {
      if (provider === "anthropic") {
        history.push({
          role: "user",
          content: results.map((result) => ({
            type: "tool_result",
            tool_use_id: result.id,
            content: result.content,
            is_error: Boolean(result.isError)
          }))
        });

        return;
      }

      for (const result of results) {
        const content = result.isError
          ? "Araç hatası: " + result.content
          : result.content;

        history.push(
          provider === "openai"
            ? {
                type: "function_call_output",
                call_id: result.id,
                output: content
              }
            : {
                role: "tool",
                tool_call_id: result.id,
                content
              }
        );
      }
    },

    addUser(text) {
      history.push({
        role: "user",
        content: text
      });
    }
  };
}

module.exports = { createModelSession };