/**
 * CLOUDFLARE PAGES FUNCTION - API DE RESPOSTAS DA PESQUISA
 * Endpoint: POST /api/respostas
 * Banco de Dados: Cloudflare D1 (via binding context.env.DB)
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Validar Método HTTP (Apenas POST)
  if (request.method !== "POST") {
    return createJsonResponse(
      { success: false, message: "Método não permitido." },
      405
    );
  }

  // 2. Validar Header Content-Type (Apenas application/json)
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return createJsonResponse(
      { success: false, message: "Header Content-Type deve ser application/json." },
      400
    );
  }

  // 3. Validar Tamanho do Payload (Máximo 64 KB)
  const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
  if (contentLength > 64 * 1024) {
    return createJsonResponse(
      { success: false, message: "Payload excede o tamanho máximo de 64 KB." },
      413
    );
  }

  try {
    const data = await request.json();

    // 4. Verificação Honeypot (Proteção contra Spam/Bots)
    if (data.hp_field && data.hp_field.trim() !== "") {
      // Retorna sucesso falso sem gravar para enganar o bot
      return createJsonResponse(
        { success: true, message: "Resposta recebida com sucesso." },
        200
      );
    }

    // 5. Validar UUID submission_id
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!data.submission_id || typeof data.submission_id !== "string" || !uuidRegex.test(data.submission_id)) {
      return createJsonResponse(
        { success: false, message: "Identificador de submissão inválido." },
        400
      );
    }

    // 6. Validar Limite Máximo de 3 Escolhas para desired_features
    const desiredFeatures = Array.isArray(data.desired_features) ? data.desired_features : [];
    if (desiredFeatures.length > 3) {
      return createJsonResponse(
        { success: false, message: "É permitido selecionar no máximo 3 funções desejadas." },
        400
      );
    }

    // 7. Sanitizar e Normalizar Entradas
    const name = sanitizeString(data.name, 100);
    const email = sanitizeString(data.email, 150);
    const whatsapp = sanitizeString(data.whatsapp, 50);
    const country = sanitizeString(data.country, 60);
    const consent = !!data.consent;

    const hasContact = (name && name.length > 0) || (email && email.length > 0) || (whatsapp && whatsapp.length > 0);

    // 8. Consentimento Obrigatório caso Existam Dados de Contato
    if (hasContact && !consent) {
      return createJsonResponse(
        { success: false, message: "É necessário autorizar o uso dos dados de contato para prosseguir." },
        400
      );
    }

    // 9. Validação Opcional do Cloudflare Turnstile (Se configurado)
    if (env.TURNSTILE_SECRET_KEY) {
      const token = data.turnstile_token;
      if (!token) {
        return createJsonResponse(
          { success: false, message: "Validação de segurança Turnstile ausente." },
          400
        );
      }

      const ip = request.headers.get("cf-connecting-ip") || "";
      const formData = new FormData();
      formData.append("secret", env.TURNSTILE_SECRET_KEY);
      formData.append("response", token);
      if (ip) formData.append("remoteip", ip);

      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData
      });
      const turnstileOutcome = await turnstileRes.json();

      if (!turnstileOutcome.success) {
        return createJsonResponse(
          { success: false, message: "Falha na verificação de segurança Turnstile." },
          400
        );
      }
    }

    // 10. Verificar Binding do Banco D1
    if (!env.DB) {
      console.error("Binding D1 (context.env.DB) não foi configurado.");
      return createJsonResponse(
        { success: false, message: "Erro de configuração do banco de dados no servidor." },
        500
      );
    }

    // 11. Proteção contra Envio Duplicado (Consulta por submission_id)
    const existing = await env.DB.prepare(
      "SELECT id FROM artist_survey_responses WHERE submission_id = ?"
    ).bind(data.submission_id).first();

    if (existing) {
      return createJsonResponse(
        {
          success: true,
          duplicate: true,
          message: "Esta resposta já foi registrada anteriormente."
        },
        200
      );
    }

    // 12. Inserção Limpa no Banco D1
    const query = `
      INSERT INTO artist_survey_responses (
        submission_id,
        source,
        current_presentation,
        current_presentation_other,
        difficulties,
        difficulties_other,
        artwork_information,
        exploration_preferences,
        desired_features,
        priority_feature,
        catalog_frequency,
        beta_interest,
        open_pain,
        name,
        email,
        whatsapp,
        country,
        consent,
        started_at,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await env.DB.prepare(query).bind(
      data.submission_id,
      sanitizeString(data.source, 50) || "direto",
      sanitizeString(data.current_presentation, 100),
      sanitizeString(data.current_presentation_other, 250),
      JSON.stringify(Array.isArray(data.difficulties) ? data.difficulties : []),
      sanitizeString(data.difficulties_other, 250),
      JSON.stringify(Array.isArray(data.artwork_information) ? data.artwork_information : []),
      JSON.stringify(Array.isArray(data.exploration_preferences) ? data.exploration_preferences : []),
      JSON.stringify(desiredFeatures),
      sanitizeString(data.priority_feature, 100),
      sanitizeString(data.catalog_frequency, 100),
      sanitizeString(data.beta_interest, 100),
      sanitizeString(data.open_pain, 1000),
      name,
      email,
      whatsapp,
      country,
      consent ? 1 : 0,
      sanitizeString(data.started_at, 50),
      sanitizeString(data.submitted_at, 50)
    ).run();

    return createJsonResponse(
      {
        success: true,
        message: "Resposta registrada com sucesso."
      },
      200
    );

  } catch (err) {
    console.error("Erro interno no processamento da resposta:", err);
    return createJsonResponse(
      {
        success: false,
        message: "Não foi possível registrar sua resposta agora. Tente novamente."
      },
      500
    );
  }
}

// Suporte para métodos não permitidos
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return createJsonResponse(
      { success: false, message: "Método não permitido." },
      405
    );
  }
}

// Funções Auxiliares
function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

function sanitizeString(val, maxLength = 255) {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed.length === 0) return null;
  return trimmed.substring(0, maxLength);
}
