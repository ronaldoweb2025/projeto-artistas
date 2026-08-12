/**
 * CONFIGURAÇÃO DE PERGUNTAS DA PESQUISA - GALERIA DIGITAL DE ARTISTAS
 * Arquivo isolado para facilitar manutenção, tradução (i18n) e expansão.
 */

window.SURVEY_QUESTIONS = [
  {
    id: "current_presentation",
    stepNumber: 1,
    title: "Atualmente, como você apresenta suas obras na internet?",
    description: "Selecione a opção que melhor descreve sua presença online hoje.",
    type: "single",
    required: true,
    options: [
      { id: "site_proprio", label: "Site próprio" },
      { id: "redes_sociais", label: "Instagram ou Facebook" },
      { id: "loja_virtual", label: "Loja virtual" },
      { id: "plataformas_arte", label: "Plataformas de arte (ex: Artmajeur, Saatchi)" },
      { id: "envio_direto", label: "Envio fotografias diretamente aos interessados" },
      { id: "sem_portfolio", label: "Ainda não tenho um portfólio digital organizado" },
      { id: "outro", label: "Outro", hasOtherInput: true }
    ],
    validationMessage: "Por favor, selecione uma opção para continuar."
  },
  {
    id: "difficulties",
    stepNumber: 2,
    title: "Qual é sua maior dificuldade hoje?",
    description: "Você pode selecionar mais de uma opção.",
    type: "multiple",
    required: true,
    options: [
      { id: "atualizar_site", label: "Atualizar o site ou portfólio" },
      { id: "organizar_obras", label: "Organizar muitas obras" },
      { id: "separar_categorias", label: "Separar as obras por categorias" },
      { id: "informar_disponibilidade", label: "Informar quais estão disponíveis ou vendidas" },
      { id: "criar_catalogos", label: "Criar catálogos para enviar aos clientes" },
      { id: "divulgar_obras", label: "Divulgar as obras para novos públicos" },
      { id: "receber_consultas", label: "Receber consultas de pessoas interessadas" },
      { id: "proteger_imagens", label: "Proteger e identificar as imagens" },
      { id: "emitir_certificados", label: "Emitir certificados de autenticidade" },
      { id: "outra", label: "Outra", hasOtherInput: true }
    ],
    validationMessage: "Por favor, selecione ao menos uma dificuldade."
  },
  {
    id: "artwork_information",
    stepNumber: 3,
    title: "Quais informações você gostaria de cadastrar em cada obra?",
    description: "Marque todos os dados que considera importantes no seu acervo.",
    type: "multiple",
    required: true,
    options: [
      { id: "nome_obra", label: "Nome da obra" },
      { id: "fotografia", label: "Fotografia" },
      { id: "tecnica", label: "Técnica utilizada" },
      { id: "dimensoes", label: "Dimensões" },
      { id: "ano_criacao", label: "Ano de criação" },
      { id: "descricao_historia", label: "Descrição ou história da obra" },
      { id: "valor", label: "Valor" },
      { id: "disponibilidade", label: "Disponibilidade" },
      { id: "exposicoes", label: "Exposições em que participou" },
      { id: "localizacao", label: "Localização atual" },
      { id: "comprador_colecao", label: "Nome do comprador ou coleção" },
      { id: "outras_informacoes", label: "Outras informações" }
    ],
    validationMessage: "Por favor, selecione ao menos um tipo de informação."
  },
  {
    id: "exploration_preferences",
    stepNumber: 4,
    title: "Como você gostaria que as pessoas explorassem suas obras?",
    description: "Como seu público deveria navegar pelo seu portfólio digital?",
    type: "multiple",
    required: true,
    options: [
      { id: "por_categorias", label: "Por categorias, como paisagens, retratos e abstratos" },
      { id: "por_tecnica", label: "Por técnica utilizada" },
      { id: "por_ano", label: "Por ano de criação" },
      { id: "por_disponibilidade", label: "Por disponibilidade" },
      { id: "por_preco", label: "Por faixa de preço" },
      { id: "por_colecoes", label: "Por coleções ou exposições" },
      { id: "por_pesquisa", label: "Por meio de uma pesquisa pelo nome" },
      { id: "combinando_filtros", label: "Combinando vários filtros" }
    ],
    validationMessage: "Por favor, selecione ao menos uma preferência de navegação."
  },
  {
    id: "desired_features",
    stepNumber: 5,
    title: "Quais dessas funções seriam mais úteis para você?",
    description: "Escolha até 3 funções fundamentais para o seu dia a dia.",
    type: "multiple",
    maxSelections: 3,
    required: true,
    options: [
      { id: "galeria_profissional", label: "Galeria profissional com diferentes apresentações" },
      { id: "botao_whatsapp", label: "Botão para consultar cada obra pelo WhatsApp" },
      { id: "catalogo_pdf", label: "Catálogo em PDF criado automaticamente" },
      { id: "certificado_autenticidade", label: "Certificado de autenticidade com identificação da obra" },
      { id: "galeria_privada", label: "Galeria privada para enviar a clientes e curadores" },
      { id: "gestao_acervo", label: "Organização das obras disponíveis, reservadas e vendidas" },
      { id: "integracao_loja", label: "Ligação das obras com uma loja online" },
      { id: "marca_dagua", label: "Marca d’água nas fotografias" },
      { id: "visualizacao_parede", label: "Apresentação da obra aplicada em uma parede ou ambiente" },
      { id: "traducao_portfolio", label: "Tradução do portfólio para outros idiomas" }
    ],
    validationMessage: "Por favor, selecione de 1 a 3 funções úteis."
  },
  {
    id: "priority_feature",
    stepNumber: 6,
    title: "Se pudesse escolher apenas uma função para receber primeiro, qual seria?",
    description: "Qual recurso traria o maior impacto imediato para seu trabalho?",
    type: "single",
    required: true,
    options: [
      { id: "galeria_profissional", label: "Galeria profissional e organizada" },
      { id: "contato_whatsapp", label: "Contato pelo WhatsApp vinculado à obra" },
      { id: "catalogo_pdf", label: "Catálogo automático em PDF" },
      { id: "certificado_autenticidade", label: "Certificado de autenticidade" },
      { id: "galeria_privada", label: "Galeria privada" },
      { id: "controle_acervo", label: "Controle do acervo e disponibilidade" },
      { id: "integracao_loja", label: "Integração com loja online" }
    ],
    validationMessage: "Por favor, selecione a função prioridade."
  },
  {
    id: "catalog_frequency",
    stepNumber: 7,
    title: "Com que frequência você precisa criar ou atualizar um catálogo de obras?",
    description: "Entender sua rotina nos ajuda a otimizar a ferramenta.",
    type: "single",
    required: true,
    options: [
      { id: "toda_semana", label: "Toda semana" },
      { id: "todo_mes", label: "Todo mês" },
      { id: "algumas_vezes_ano", label: "Algumas vezes ao ano" },
      { id: "somente_exposicoes", label: "Somente para exposições ou oportunidades específicas" },
      { id: "nunca_gostaria", label: "Nunca criei, mas gostaria de ter" },
      { id: "sem_necessidade", label: "Não tenho necessidade" }
    ],
    validationMessage: "Por favor, selecione a frequência de atualização."
  },
  {
    id: "beta_interest",
    stepNumber: 8,
    title: "Você teria interesse em experimentar uma primeira versão e contribuir com sua opinião?",
    description: "Artistas testadores terão acesso antecipado às novidades.",
    type: "single",
    required: true,
    options: [
      { id: "sim_testes", label: "Sim, gostaria de participar dos primeiros testes" },
      { id: "talvez_conhecer", label: "Talvez, quero conhecer melhor" },
      { id: "prefiro_acompanhar", label: "Prefiro acompanhar o desenvolvimento" },
      { id: "sem_interesse", label: "Não tenho interesse neste momento" }
    ],
    validationMessage: "Por favor, escolha uma opção sobre os testes."
  },
  {
    id: "open_pain",
    stepNumber: 9,
    title: "Existe alguma dificuldade na organização, apresentação ou venda das suas obras que ainda não mencionamos?",
    description: "Pergunta opcional. Fique à vontade para compartilhar seus desafios.",
    type: "text",
    required: false,
    maxLength: 1000,
    placeholder: "Escreva aqui seus comentários, dúvidas ou sugestões..."
  },
  {
    id: "contact_info",
    stepNumber: 10,
    title: "Quer participar dos primeiros testes?",
    description: "Preencha seus contatos caso deseje receber novidades ou ser convidado(a) para testar a ferramenta em primeira mão. Se preferir, você pode enviar de forma anônima.",
    type: "contact",
    required: false,
    fields: [
      { id: "name", label: "Seu Nome Completo", type: "text", placeholder: "Ex: Maria Silva" },
      { id: "email", label: "Seu Melhores E-mail", type: "email", placeholder: "exemplo@artista.com" },
      { id: "whatsapp", label: "WhatsApp com DDD", type: "tel", placeholder: "(11) 99999-9999" },
      { id: "country", label: "País onde reside", type: "text", placeholder: "Ex: Brasil" }
    ],
    consentText: "Autorizo o uso destes dados apenas para receber informações sobre os testes e o desenvolvimento desta ferramenta."
  }
];
