const { Anthropic } = require("@anthropic-ai/sdk");
const { OpenAI } = require("openai");
const { createOnysoftSession } = require("./onysoft.js");
// Groq ücretsiz katmanı: istek başına (girdi + max_tokens) en fazla bu kadar token.
const GROQ_TOKEN_LIMIT = Number(process.env.GROQ_TPM_LIMIT) || 8000;
const GROQ_MIN_OUTPUT_TOKENS = 1024;

// Kaba ve temkinli token tahmini (Türkçe + JSON için ~3 karakter/token).
function estimateTokens(value) {
  return Math.ceil(JSON.stringify(value ?? "").length / 3);
}

function fitGroqRequest(history, extra, maxTokens) {
  const head = history.slice(0, 2);
  let tail = history.slice(2);

  const size = () =>
    estimateTokens(head) + estimateTokens(tail) + estimateTokens(extra);

  while (
    tail.length > 1 &&
    size() > GROQ_TOKEN_LIMIT - GROQ_MIN_OUTPUT_TOKENS
  ) {
    tail = tail.slice(1);

    // Ait olduğu assistant mesajı atılmış araç sonuçları geçersizdir.
    while (tail.length > 1 && tail[0].role === "tool") {
      tail = tail.slice(1);
    }
  }
console.log("[Groq bağlamı]", {
  toplamMesaj: history.length,
  gonderilenMesaj: head.length + tail.length,
  silinenMesaj: history.length - head.length - tail.length,
  tahminiGirdi: size(),
  istenenCikti: maxTokens,
  gonderilenCikti: Math.max(
    256,
    Math.min(maxTokens, GROQ_TOKEN_LIMIT - size())
  )
});
  return {
    messages: [...head, ...tail],
    max_tokens: Math.max(
      256,
      Math.min(maxTokens, GROQ_TOKEN_LIMIT - size())
    )
    ,
  };
}

// gpt-oss yanıtlarındaki "reasoning" metni geçmişe eklenmez; gereksiz token.
function cleanAssistantMessage(message) {
  const hasToolCalls = Boolean(message.tool_calls?.length);

  return {
    role: "assistant",
    content: message.content ?? null,

    ...(hasToolCalls
      ? { tool_calls: message.tool_calls }
      : {}),

    ...(hasToolCalls && typeof message.reasoning === "string"
      ? { reasoning: message.reasoning }
      : {})
  };
}

function createModelSession(
  config,
  { system, prompt, tools = [], maxTokens = 4096 }
) {
  const { provider, model, apiKey } = config;
  if (provider === "onysoft") {
  return createOnysoftSession(config, {
    system,
    prompt,
    tools,
    maxTokens
  });
}

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
const localSubmissionIds = new Set();
let localSubmissionSequence = 0;
  return {
   async next({ toolName } = {}) {
    const toolChoice = !toolName
  ? {}
  : {
      tool_choice:
        provider === "anthropic"
          ? { type: "tool", name: toolName }
          : provider === "openai"
            ? { type: "function", name: toolName }
            : {
                type: "function",
                function: { name: toolName }
              }
    };
      if (provider === "anthropic") {
const response = await client.messages.create({
  model,
  ...toolChoice,
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
          ...toolChoice,
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
if (
  provider === "groq" &&
  toolName === "submitArgument" &&
  ["openai/gpt-oss-20b", "openai/gpt-oss-120b"].includes(model)
) {
  const submitTool = tools.find(
    (tool) => tool.name === "submitArgument"
  );

  if (!submitTool) {
    throw new Error("submitArgument tanımı bulunamadı.");
  }

  history.push({
    role: "user",
    content:
      "Bu aşamada konuşmanı JSON nesnesi olarak sun. " +
      "Alanlar: text ve evidenceIds. " +
      "text en fazla 2000 karakter; evidenceIds en fazla iki " +
      "okunmuş veya ortak tutanakta sunulmuş delil kimliği."
  });

  const responseFormat = {
    type: "json_schema",
    json_schema: {
      name: "court_argument",
      strict: true,
      schema: submitTool.input_schema
    }
  };

  const response = await client.chat.completions.create({
    model,
    ...fitGroqRequest(history, responseFormat, maxTokens),
    response_format: responseFormat
  });

  const choice = response.choices?.[0];

  if (
    choice?.finish_reason !== "stop" ||
    typeof choice.message?.content !== "string"
  ) {
    const error = new Error(
      "Groq konuşması tamamlanmadı: " +
      (choice?.finish_reason ?? "boş yanıt")
    );

    error.details = {
      provider,
      model,
      maxTokens,
      usage: response.usage
    };

    throw error;
  }

  const input = JSON.parse(choice.message.content);

  history.push(cleanAssistantMessage(choice.message));

  const id = "local-submit-" + (++localSubmissionSequence);
  localSubmissionIds.add(id);

  return {
    text: "",
    toolCalls: [
      {
        id,
        name: "submitArgument",
        input
      }
    ]
  };
}
const chatTools = tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema
  }
}));

const response = await client.chat.completions.create({
  model,
  ...toolChoice,

  ...(provider === "groq"
    ? fitGroqRequest(history, chatTools, maxTokens)
    : { messages: history, max_tokens: maxTokens }),

  ...(tools.length ? { tools: chatTools } : {})
});

const choice = response.choices?.[0];

if (
  !choice ||
  !["stop", "tool_calls"].includes(choice.finish_reason)
) {
  const error = new Error(
    "Model yanıtı tamamlanmadı: " +
    (choice?.finish_reason ?? "Yanıtta choices bulunamadı")
  );

  error.details = {
    provider,
    model,
    maxTokens,
    finishReason: choice?.finish_reason,
    usage: response.usage
  };

  throw error;
}
      const message = choice.message;
      history.push(
        provider === "groq" ? cleanAssistantMessage(message) : message
      );

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
if (localSubmissionIds.delete(result.id)) {
  history.push({
    role: "user",
    content
  });

  continue;
}
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