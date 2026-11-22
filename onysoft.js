const { OpenAI } = require("openai");

function createOnysoftSession(
  config,
  { system, prompt, tools = [], maxTokens = 4096 }
) {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: "https://api.onysoft.com/v1",
    maxRetries: 2
  });

  const messages = [
    { role: "system", content: system },
    { role: "user", content: prompt }
  ];

  return {
    async next({ toolName } = {}) {
      if (toolName && !tools.some(tool => tool.name === toolName)) {
        throw new Error("Tanımlanmamış araç seçildi: " + toolName);
      }

      const raw = await client.chat.completions.create({
        model: config.model,
        messages,
        max_tokens: maxTokens,

        ...(tools.length ? {
          tools: tools.map(tool => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.input_schema,
              ...(tool.strict === true ? { strict: true } : {})
            }
          }))
        } : {}),

        ...(toolName ? {
          tool_choice: {
            type: "function",
            function: { name: toolName }
          }
        } : {})
      });

      const response = Array.isArray(raw?.choices)
        ? raw
        : raw?.data;

      const choice = response?.choices?.[0];

      if (
        !choice ||
        !["stop", "tool_calls"].includes(choice.finish_reason) ||
        !choice.message
      ) {
        const error = new Error(
          raw?.error?.message ||
          "Onysoft yanıtı tamamlanmadı: " +
          (choice?.finish_reason ?? "beklenmeyen yanıt biçimi")
        );

        error.details = {
          provider: "onysoft",
          model: config.model,
          finishReason: choice?.finish_reason,
          usage: response?.usage
        };

        throw error;
      }

      const message = choice.message;

      const toolCalls = (message.tool_calls || []).map(call => ({
        id: call.id,
        name: call.function.name,
        input: JSON.parse(call.function.arguments)
      }));

      messages.push(message);

      if (typeof response.cost?.amount === "number") {
        console.log("[Onysoft]", {
          model: config.model,
          costUSD: response.cost.amount
        });
      }

      return {
        text: typeof message.content === "string"
          ? message.content
          : "",
        toolCalls
      };
    },

    addToolResults(results) {
      for (const result of results) {
        messages.push({
          role: "tool",
          tool_call_id: result.id,
          content: result.isError
            ? "Araç hatası: " + result.content
            : result.content
        });
      }
    },

    addUser(text) {
      messages.push({
        role: "user",
        content: text
      });
    }
  };
}

module.exports = { createOnysoftSession };