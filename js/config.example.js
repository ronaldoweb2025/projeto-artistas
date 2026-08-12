/**
 * CONFIGURAÇÃO PÚBLICA DO CLIENTE - EXEMPLO
 * Copie este arquivo ou utilize os valores padrão no app.js para customizar a chave do Turnstile
 * ou alterar o endpoint da API se necessário.
 */

window.SURVEY_CONFIG = {
  // Endpoint da Cloudflare Function para recebimento dos dados
  apiEndpoint: "/api/respostas",

  // Chave pública do Cloudflare Turnstile (Opcional - deixe vazio se não utilizar Turnstile)
  // Exemplo de site key de teste da Cloudflare: "1x00000000000000000000AA"
  turnstileSiteKey: "",

  // Chave para armazenamento no localStorage
  storageKey: "artist_survey_draft_v1"
};
