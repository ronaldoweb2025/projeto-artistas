/**
 * MOTOR DA PESQUISA INTERATIVA - GALERIA DIGITAL PARA ARTISTAS VISUAIS
 * Vanilla JavaScript ES6+ puro. Acessível, responsivo e seguro.
 */

(function () {
  "use strict";

  // Configuração padrão da aplicação
  const CONFIG = window.SURVEY_CONFIG || {
    apiEndpoint: "/api/respostas",
    turnstileSiteKey: "",
    storageKey: "artist_survey_draft_v1"
  };

  // Referência às perguntas carregadas do questions.js
  const QUESTIONS = window.SURVEY_QUESTIONS || [];
  const TOTAL_STEPS = QUESTIONS.length; // 10 etapas

  // Estado interno do Quiz
  const state = {
    submissionId: null,
    currentStepIndex: 0, // 0 = Tela Inicial, 1 a 10 = Perguntas
    startedAt: null,
    answers: {},
    isSubmitting: false,
    source: "direto"
  };

  // Elementos do DOM
  let elements = {};

  // Inicializador quando o DOM estiver carregado
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDOMElements();
    detectSource();
    bindGlobalEvents();
    checkExistingDraft();
    renderStep();
  }

  // Mapear elementos do DOM
  function cacheDOMElements() {
    elements = {
      shell: document.getElementById("quiz-shell"),
      header: document.getElementById("quiz-header"),
      startCard: document.getElementById("quiz-start-card"),
      stepContainer: document.getElementById("quiz-step-container"),
      progressContainer: document.getElementById("progress-container"),
      progressBar: document.getElementById("progress-bar"),
      progressLabel: document.getElementById("progress-label"),
      progressPercent: document.getElementById("progress-percent"),
      resumeBanner: document.getElementById("resume-banner"),
      btnResume: document.getElementById("btn-resume"),
      btnRestart: document.getElementById("btn-restart"),
      btnStart: document.getElementById("btn-start"),
      btnPrev: document.getElementById("btn-prev"),
      btnNext: document.getElementById("btn-next"),
      btnSubmit: document.getElementById("btn-submit"),
      actionsContainer: document.getElementById("quiz-actions"),
      liveAnnouncer: document.getElementById("live-announcer"),
      errorMessage: document.getElementById("global-error-message")
    };
  }

  // Capturar parâmetro 'origem' da URL
  function detectSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramSource = urlParams.get("origem") || urlParams.get("utm_source");
    if (paramSource) {
      state.source = paramSource.substring(0, 50).trim();
    }
  }

  // Vincular ouvintes de eventos globais
  function bindGlobalEvents() {
    if (elements.btnStart) {
      elements.btnStart.addEventListener("click", startQuiz);
    }
    if (elements.btnPrev) {
      elements.btnPrev.addEventListener("click", navigatePrev);
    }
    if (elements.btnNext) {
      elements.btnNext.addEventListener("click", navigateNext);
    }
    if (elements.btnSubmit) {
      elements.btnSubmit.addEventListener("click", handleSubmit);
    }
    if (elements.btnResume) {
      elements.btnResume.addEventListener("click", resumeDraft);
    }
    if (elements.btnRestart) {
      elements.btnRestart.addEventListener("click", clearDraftAndRestart);
    }
  }

  // Gerar ou recuperar UUID único da participação
  function getOrCreateSubmissionId() {
    if (state.submissionId) return state.submissionId;
    
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      state.submissionId = window.crypto.randomUUID();
    } else {
      // Fallback seguro de UUID v4 caso randomUUID não esteja disponível
      state.submissionId = '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
    return state.submissionId;
  }

  // ==========================================================================
  // GESTÃO DE RASCUNHO (localStorage)
  // ==========================================================================

  function checkExistingDraft() {
    try {
      const rawDraft = localStorage.getItem(CONFIG.storageKey);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft && draft.answers && draft.currentStepIndex > 0) {
          if (elements.resumeBanner) {
            elements.resumeBanner.style.display = "flex";
            announceToScreenReader("Existe um rascunho salvo da sua pesquisa.");
          }
        }
      }
    } catch (e) {
      console.warn("Erro ao acessar localStorage:", e);
    }
  }

  function saveDraft() {
    try {
      const draftData = {
        submissionId: getOrCreateSubmissionId(),
        currentStepIndex: state.currentStepIndex,
        answers: state.answers,
        startedAt: state.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(draftData));
    } catch (e) {
      console.warn("Não foi possível salvar o rascunho:", e);
    }
  }

  function resumeDraft() {
    try {
      const rawDraft = localStorage.getItem(CONFIG.storageKey);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        state.submissionId = draft.submissionId;
        state.currentStepIndex = draft.currentStepIndex || 1;
        state.answers = draft.answers || {};
        state.startedAt = draft.startedAt;
        
        if (elements.resumeBanner) {
          elements.resumeBanner.style.display = "none";
        }
        renderStep();
        announceToScreenReader(`Rascunho recuperado. Etapa ${state.currentStepIndex} de ${TOTAL_STEPS}.`);
      }
    } catch (e) {
      console.error("Erro ao retomar rascunho:", e);
    }
  }

  function clearDraftAndRestart() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (e) {
      console.warn("Erro ao limpar rascunho:", e);
    }
    state.submissionId = null;
    state.currentStepIndex = 0;
    state.answers = {};
    state.startedAt = null;

    if (elements.resumeBanner) {
      elements.resumeBanner.style.display = "none";
    }
    renderStep();
  }

  function clearDraft() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (e) {
      console.warn("Erro ao limpar rascunho:", e);
    }
  }

  // ==========================================================================
  // NAVEGAÇÃO E FLUXO DO QUIZ
  // ==========================================================================

  function startQuiz() {
    state.currentStepIndex = 1;
    state.startedAt = new Date().toISOString();
    getOrCreateSubmissionId();
    saveDraft();
    renderStep();
  }

  function navigatePrev() {
    if (state.currentStepIndex > 1) {
      state.currentStepIndex--;
      hideErrorMessage();
      saveDraft();
      renderStep();
    }
  }

  function navigateNext() {
    hideErrorMessage();
    const currentQuestion = QUESTIONS[state.currentStepIndex - 1];

    if (!validateCurrentStep(currentQuestion)) {
      return;
    }

    if (state.currentStepIndex < TOTAL_STEPS) {
      state.currentStepIndex++;
      saveDraft();
      renderStep();
    }
  }

  // Validar etapa atual antes de prosseguir
  function validateCurrentStep(question) {
    if (!question) return true;

    const answer = state.answers[question.id];

    // Se for pergunta obrigatória
    if (question.required) {
      if (!answer) {
        showErrorMessage(question.validationMessage || "Por favor, preencha esta pergunta para continuar.");
        return false;
      }

      if (question.type === "multiple" && Array.isArray(answer) && answer.length === 0) {
        showErrorMessage(question.validationMessage || "Selecione ao menos uma opção.");
        return false;
      }
    }

    // Validação especial para "Outro" / "Outra"
    if (question.type === "single" && answer === "outro") {
      const otherVal = state.answers[`${question.id}_other`];
      if (!otherVal || !otherVal.trim()) {
        showErrorMessage("Por favor, especifique o campo 'Outro'.");
        return false;
      }
    }

    if (question.type === "multiple" && Array.isArray(answer) && (answer.includes("outro") || answer.includes("outra"))) {
      const otherVal = state.answers[`${question.id}_other`];
      if (!otherVal || !otherVal.trim()) {
        showErrorMessage("Por favor, especifique a opção 'Outro(a)'.");
        return false;
      }
    }

    // Validação da etapa 10 (contato e consentimento condicional)
    if (question.type === "contact") {
      const name = (state.answers.name || "").trim();
      const email = (state.answers.email || "").trim();
      const whatsapp = (state.answers.whatsapp || "").trim();
      const consent = !!state.answers.consent;

      const hasContactData = name.length > 0 || email.length > 0 || whatsapp.length > 0;

      if (email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showErrorMessage("Por favor, insira um endereço de e-mail válido.");
          return false;
        }
      }

      if (hasContactData && !consent) {
        showErrorMessage("Para enviar seus dados de contato, é necessário aceitar os termos de autorização.");
        return false;
      }
    }

    return true;
  }

  // ==========================================================================
  // RENDERIZAÇÃO DE TELA E PASSO
  // ==========================================================================

  function renderStep() {
    hideErrorMessage();

    // Se estiver na tela inicial (index 0)
    if (state.currentStepIndex === 0) {
      if (elements.startCard) elements.startCard.style.display = "block";
      if (elements.stepContainer) elements.stepContainer.style.display = "none";
      if (elements.progressContainer) elements.progressContainer.style.display = "none";
      if (elements.actionsContainer) elements.actionsContainer.style.display = "none";
      return;
    }

    // Se estiver em uma etapa de pergunta (1 a 10)
    if (elements.startCard) elements.startCard.style.display = "none";
    if (elements.stepContainer) elements.stepContainer.style.display = "block";
    if (elements.progressContainer) elements.progressContainer.style.display = "flex";
    if (elements.actionsContainer) elements.actionsContainer.style.display = "flex";

    updateProgress();

    const currentQuestion = QUESTIONS[state.currentStepIndex - 1];
    if (!currentQuestion) return;

    // Limpar o contêiner de etapas
    elements.stepContainer.innerHTML = "";

    // Criar elemento de etapa
    const stepEl = document.createElement("section");
    stepEl.className = "quiz-step quiz-step--active";
    stepEl.setAttribute("aria-labelledby", "step-title");

    // Título e Descrição
    const titleEl = document.createElement("h2");
    titleEl.id = "step-title";
    titleEl.className = "quiz-step__title";
    titleEl.tabIndex = -1; // Permite foco para acessibilidade
    titleEl.textContent = `${currentQuestion.stepNumber}. ${currentQuestion.title}`;

    const descEl = document.createElement("p");
    descEl.className = "quiz-step__description";
    descEl.textContent = currentQuestion.description;

    stepEl.appendChild(titleEl);
    stepEl.appendChild(descEl);

    // Renderizar conteúdo específico pelo tipo da pergunta
    if (currentQuestion.type === "single" || currentQuestion.type === "multiple") {
      renderChoiceQuestion(stepEl, currentQuestion);
    } else if (currentQuestion.type === "text") {
      renderTextQuestion(stepEl, currentQuestion);
    } else if (currentQuestion.type === "contact") {
      renderContactQuestion(stepEl, currentQuestion);
    }

    elements.stepContainer.appendChild(stepEl);

    // Ajustar botões de ação
    if (state.currentStepIndex === 1) {
      elements.btnPrev.style.display = "none";
    } else {
      elements.btnPrev.style.display = "inline-flex";
    }

    if (state.currentStepIndex === TOTAL_STEPS) {
      elements.btnNext.style.display = "none";
      elements.btnSubmit.style.display = "inline-flex";
    } else {
      elements.btnNext.style.display = "inline-flex";
      elements.btnSubmit.style.display = "none";
    }

    // Focar no título para navegadores e leitores de tela
    setTimeout(() => {
      titleEl.focus();
    }, 50);

    announceToScreenReader(`Etapa ${state.currentStepIndex} de ${TOTAL_STEPS}: ${currentQuestion.title}`);
  }

  // Atualizar Barra de Progresso
  function updateProgress() {
    const percent = Math.round((state.currentStepIndex / TOTAL_STEPS) * 100);
    if (elements.progressBar) elements.progressBar.style.width = `${percent}%`;
    if (elements.progressLabel) elements.progressLabel.textContent = `Etapa ${state.currentStepIndex} de ${TOTAL_STEPS}`;
    if (elements.progressPercent) elements.progressPercent.textContent = `${percent}%`;
    if (elements.progressContainer) {
      elements.progressContainer.setAttribute("aria-valuenow", percent);
    }
  }

  // RENDER: Questões de Escolha Única ou Múltipla
  function renderChoiceQuestion(container, question) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "choice-grid";

    const legend = document.createElement("legend");
    legend.className = "sr-only";
    legend.textContent = question.title;
    fieldset.appendChild(legend);

    // Contador de escolhas para pergunta 5 (limite de 3)
    let counterBadge = null;
    if (question.maxSelections) {
      counterBadge = document.createElement("div");
      counterBadge.className = "quiz-step__counter-badge";
      counterBadge.id = "selection-counter";
      updateCounterBadgeText(counterBadge, question);
      container.insertBefore(counterBadge, container.children[2] || null);
    }

    const currentAnswer = state.answers[question.id] || (question.type === "multiple" ? [] : "");

    question.options.forEach(option => {
      const isSelected = question.type === "multiple"
        ? Array.isArray(currentAnswer) && currentAnswer.includes(option.id)
        : currentAnswer === option.id;

      const card = document.createElement("label");
      card.className = `choice-card ${question.type === "multiple" ? "choice-card--multiple" : ""} ${isSelected ? "choice-card--selected" : ""}`;
      
      const input = document.createElement("input");
      input.type = question.type === "multiple" ? "checkbox" : "radio";
      input.name = question.id;
      input.value = option.id;
      input.checked = isSelected;
      input.className = "choice-card__input";

      // Desabilitar opções não selecionadas se atingiu limite máximo
      if (question.maxSelections && !isSelected && Array.isArray(currentAnswer) && currentAnswer.length >= question.maxSelections) {
        card.classList.add("choice-card--disabled");
        input.disabled = true;
      }

      const indicator = document.createElement("span");
      indicator.className = "choice-card__indicator";
      indicator.setAttribute("aria-hidden", "true");

      const labelText = document.createElement("span");
      labelText.className = "choice-card__label";
      labelText.textContent = option.label;

      card.appendChild(input);
      card.appendChild(indicator);
      card.appendChild(labelText);

      // Ouvinte de Mudança
      input.addEventListener("change", () => {
        handleOptionChange(question, option, input.checked);
      });

      // Suporte a teclado no Label
      card.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (!input.disabled) {
            input.checked = question.type === "single" ? true : !input.checked;
            handleOptionChange(question, option, input.checked);
          }
        }
      });

      fieldset.appendChild(card);
    });

    container.appendChild(fieldset);

    // Contêiner para o campo de texto "Outro(a)" se aplicável
    const otherContainer = document.createElement("div");
    otherContainer.id = `other-container-${question.id}`;
    otherContainer.style.display = isOtherSelected(question) ? "block" : "none";

    const otherField = document.createElement("div");
    otherField.className = "form-field";
    
    const otherLabel = document.createElement("label");
    otherLabel.className = "form-field__label form-field__label--required";
    otherLabel.htmlFor = `input-other-${question.id}`;
    otherLabel.textContent = "Especifique a sua resposta:";

    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.id = `input-other-${question.id}`;
    otherInput.className = "form-field__input";
    otherInput.placeholder = "Digite aqui...";
    otherInput.value = state.answers[`${question.id}_other`] || "";

    otherInput.addEventListener("input", (e) => {
      state.answers[`${question.id}_other`] = e.target.value;
      saveDraft();
    });

    otherField.appendChild(otherLabel);
    otherField.appendChild(otherInput);
    otherContainer.appendChild(otherField);

    container.appendChild(otherContainer);
  }

  // Manipular mudança de seleção de opção
  function handleOptionChange(question, option, isChecked) {
    hideErrorMessage();

    if (question.type === "single") {
      state.answers[question.id] = option.id;
    } else if (question.type === "multiple") {
      let currentList = state.answers[question.id] || [];
      if (!Array.isArray(currentList)) currentList = [];

      if (isChecked) {
        // Verificar limite máximo (ex: 3 na pergunta 5)
        if (question.maxSelections && currentList.length >= question.maxSelections) {
          showErrorMessage(`Você só pode selecionar até ${question.maxSelections} opções nesta pergunta.`);
          renderStep(); // Re-renderizar para manter estado consistente
          return;
        }
        if (!currentList.includes(option.id)) {
          currentList.push(option.id);
        }
      } else {
        currentList = currentList.filter(id => id !== option.id);
      }
      state.answers[question.id] = currentList;
    }

    // Se desmarcar 'Outro', limpar campo de texto complementar
    if (!isOtherSelected(question)) {
      delete state.answers[`${question.id}_other`];
    }

    saveDraft();
    renderStep();
  }

  function isOtherSelected(question) {
    const val = state.answers[question.id];
    if (!val) return false;
    if (question.type === "single") return val === "outro" || val === "outra";
    if (question.type === "multiple" && Array.isArray(val)) return val.includes("outro") || val.includes("outra");
    return false;
  }

  function updateCounterBadgeText(badgeEl, question) {
    if (!badgeEl) return;
    const currentList = state.answers[question.id] || [];
    const count = Array.isArray(currentList) ? currentList.length : 0;
    badgeEl.textContent = `${count} de ${question.maxSelections} selecionadas`;
  }

  // RENDER: Pergunta de Texto Livre
  function renderTextQuestion(container, question) {
    const fieldWrapper = document.createElement("div");
    fieldWrapper.className = "form-field";

    const label = document.createElement("label");
    label.className = `form-field__label ${question.required ? "form-field__label--required" : ""}`;
    label.htmlFor = `input-${question.id}`;
    label.textContent = "Sua resposta:";

    const textarea = document.createElement("textarea");
    textarea.id = `input-${question.id}`;
    textarea.className = "form-field__textarea";
    textarea.placeholder = question.placeholder || "";
    textarea.maxLength = question.maxLength || 1000;
    textarea.value = state.answers[question.id] || "";

    const footer = document.createElement("div");
    footer.className = "form-field__footer";

    const charCounter = document.createElement("span");
    const updateCharCount = () => {
      const len = textarea.value.length;
      charCounter.textContent = `${len} / ${question.maxLength || 1000} caracteres`;
    };
    updateCharCount();

    textarea.addEventListener("input", (e) => {
      state.answers[question.id] = e.target.value;
      updateCharCount();
      saveDraft();
    });

    fieldWrapper.appendChild(label);
    fieldWrapper.appendChild(textarea);
    footer.appendChild(charCounter);
    fieldWrapper.appendChild(footer);

    container.appendChild(fieldWrapper);
  }

  // RENDER: Form de Contato (Etapa 10)
  function renderContactQuestion(container, question) {
    const formBox = document.createElement("div");
    formBox.className = "contact-form";

    question.fields.forEach(fieldConfig => {
      const field = document.createElement("div");
      field.className = "form-field";

      const label = document.createElement("label");
      label.className = "form-field__label";
      label.htmlFor = `input-contact-${fieldConfig.id}`;
      label.textContent = fieldConfig.label;

      const input = document.createElement("input");
      input.type = fieldConfig.type;
      input.id = `input-contact-${fieldConfig.id}`;
      input.className = "form-field__input";
      input.placeholder = fieldConfig.placeholder;
      input.value = state.answers[fieldConfig.id] || "";

      input.addEventListener("input", (e) => {
        state.answers[fieldConfig.id] = e.target.value;
        toggleConsentRequirement();
        saveDraft();
      });

      field.appendChild(label);
      field.appendChild(input);
      formBox.appendChild(field);
    });

    // Caixa de Consentimento
    const consentBox = document.createElement("div");
    consentBox.className = "consent-box";

    const consentLabel = document.createElement("label");
    consentLabel.className = "choice-card choice-card--multiple";
    consentLabel.id = "consent-card-label";

    const consentInput = document.createElement("input");
    consentInput.type = "checkbox";
    consentInput.id = "input-consent";
    consentInput.className = "choice-card__input";
    consentInput.checked = !!state.answers.consent;

    const indicator = document.createElement("span");
    indicator.className = "choice-card__indicator";

    const text = document.createElement("span");
    text.className = "choice-card__label";
    text.id = "consent-text";
    text.textContent = question.consentText;

    consentInput.addEventListener("change", () => {
      state.answers.consent = consentInput.checked;
      if (consentInput.checked) {
        consentLabel.classList.add("choice-card--selected");
      } else {
        consentLabel.classList.remove("choice-card--selected");
      }
      hideErrorMessage();
      saveDraft();
    });

    if (consentInput.checked) {
      consentLabel.classList.add("choice-card--selected");
    }

    consentLabel.appendChild(consentInput);
    consentLabel.appendChild(indicator);
    consentLabel.appendChild(text);
    consentBox.appendChild(consentLabel);

    // Campo Honeypot invisível contra bots
    const honeypot = document.createElement("input");
    honeypot.type = "text";
    honeypot.name = "hp_field";
    honeypot.id = "hp_field";
    honeypot.style.display = "none";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";

    container.appendChild(formBox);
    container.appendChild(consentBox);
    container.appendChild(honeypot);

    toggleConsentRequirement();
  }

  // Alternar obrigatoriedade visual do consentimento
  function toggleConsentRequirement() {
    const name = (state.answers.name || "").trim();
    const email = (state.answers.email || "").trim();
    const whatsapp = (state.answers.whatsapp || "").trim();
    const textEl = document.getElementById("consent-text");

    const hasContact = name.length > 0 || email.length > 0 || whatsapp.length > 0;

    if (textEl) {
      if (hasContact) {
        textEl.innerHTML = `<strong>(Obrigatório caso informe contatos)</strong> ${QUESTIONS[9].consentText}`;
      } else {
        textEl.textContent = QUESTIONS[9].consentText;
      }
    }
  }

  // ==========================================================================
  // ENVIO DOS DADOS (API Cloudflare Functions)
  // ==========================================================================

  async function handleSubmit() {
    hideErrorMessage();
    const currentQuestion = QUESTIONS[state.currentStepIndex - 1];
    
    if (!validateCurrentStep(currentQuestion)) {
      return;
    }

    // Prevenção contra duplo clique e estado de envio
    if (state.isSubmitting) return;
    setSubmittingState(true);

    const hpValue = document.getElementById("hp_field") ? document.getElementById("hp_field").value : "";

    // Payload normalizado para envio
    const payload = {
      submission_id: getOrCreateSubmissionId(),
      source: state.source,
      current_presentation: state.answers.current_presentation || null,
      current_presentation_other: state.answers.current_presentation_other || null,
      difficulties: state.answers.difficulties || [],
      difficulties_other: state.answers.difficulties_other || null,
      artwork_information: state.answers.artwork_information || [],
      exploration_preferences: state.answers.exploration_preferences || [],
      desired_features: state.answers.desired_features || [],
      priority_feature: state.answers.priority_feature || null,
      catalog_frequency: state.answers.catalog_frequency || null,
      beta_interest: state.answers.beta_interest || null,
      open_pain: state.answers.open_pain || null,
      name: state.answers.name || null,
      email: state.answers.email || null,
      whatsapp: state.answers.whatsapp || null,
      country: state.answers.country || null,
      consent: !!state.answers.consent,
      started_at: state.startedAt || new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      hp_field: hpValue
    };

    try {
      const response = await fetch(CONFIG.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        clearDraft();
        // Redirecionar para página de agradecimento
        window.location.href = "obrigado.html";
      } else {
        setSubmittingState(false);
        showErrorMessage(result.message || "Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro de conexão no envio:", error);
      setSubmittingState(false);
      showErrorMessage("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    }
  }

  function setSubmittingState(isSubmitting) {
    state.isSubmitting = isSubmitting;
    if (elements.btnSubmit) {
      elements.btnSubmit.disabled = isSubmitting;
      elements.btnSubmit.textContent = isSubmitting ? "Enviando..." : "Enviar respostas";
    }
    if (elements.btnPrev) {
      elements.btnPrev.disabled = isSubmitting;
    }
  }

  // ==========================================================================
  // FEEDBACKS E ACESSIBILIDADE
  // ==========================================================================

  function showErrorMessage(msg) {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = msg;
      elements.errorMessage.style.display = "block";
      elements.errorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
      announceToScreenReader(`Erro: ${msg}`);
    }
  }

  function hideErrorMessage() {
    if (elements.errorMessage) {
      elements.errorMessage.style.display = "none";
      elements.errorMessage.textContent = "";
    }
  }

  function announceToScreenReader(message) {
    if (elements.liveAnnouncer) {
      elements.liveAnnouncer.textContent = message;
    }
  }

})();
