function getAgentConfig(role) {
  const roleName = String(role).trim().toUpperCase();

  const allowedRoles = ["LAWYER", "PROSECUTION", "JUDGE"];

  if (!allowedRoles.includes(roleName)) {
    throw new Error("Geçersiz ajan rolü.");
  }

  const provider = process.env[`PROVIDER_${roleName}`]
    ?.trim()
    .toLowerCase();

  const model = process.env[`MODEL_${roleName}`]?.trim();

  const apiKey = process.env[`API_KEY_${roleName}`]?.trim();

  const allowedProviders = [
    "anthropic",
    "openai",
    "openrouter",
    "groq",
    "onysoft"
  ];

  if (!allowedProviders.includes(provider)) {
    throw new Error(`PROVIDER_${roleName} eksik veya geçersiz.`);
  }

  if (!model) {
    throw new Error(`MODEL_${roleName} eksik.`);
  }

  if (!apiKey) {
    throw new Error(`API_KEY_${roleName} eksik.`);
  }

  return { provider, model, apiKey };
}

module.exports = { getAgentConfig };