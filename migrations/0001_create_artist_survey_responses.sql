-- ============================================================================
-- MIGRATION CLOUDFLARE D1 (SQLITE)
-- Tabela: artist_survey_responses
-- Descrição: Armazena respostas da pesquisa interativa para artistas visuais.
-- ============================================================================

CREATE TABLE IF NOT EXISTS artist_survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'direto',
    
    -- Pergunta 1: Apresentação Atual
    current_presentation TEXT,
    current_presentation_other TEXT,
    
    -- Pergunta 2: Dificuldades (JSON Array em texto)
    difficulties TEXT,
    difficulties_other TEXT,
    
    -- Pergunta 3: Informações da Obra (JSON Array em texto)
    artwork_information TEXT,
    
    -- Pergunta 4: Preferências de Navegação (JSON Array em texto)
    exploration_preferences TEXT,
    
    -- Pergunta 5: Funções Desejadas - máximo 3 (JSON Array em texto)
    desired_features TEXT,
    
    -- Pergunta 6: Função Prioritária
    priority_feature TEXT,
    
    -- Pergunta 7: Frequência de Atualização do Catálogo
    catalog_frequency TEXT,
    
    -- Pergunta 8: Interesse em Testes Beta
    beta_interest TEXT,
    
    -- Pergunta 9: Desafios Abertos / Comentários
    open_pain TEXT,
    
    -- Pergunta 10: Dados de Contato Opcionais
    name TEXT,
    email TEXT,
    whatsapp TEXT,
    country TEXT,
    consent INTEGER DEFAULT 0,
    
    -- Metadados de Tempo
    started_at TEXT,
    submitted_at TEXT
);

-- Restrição de Unicidade no submission_id para evitar entradas duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_submission_id ON artist_survey_responses(submission_id);

-- Índices para otimização de relatórios, filtros e exportações em CSV
CREATE INDEX IF NOT EXISTS idx_survey_created_at ON artist_survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_priority_feature ON artist_survey_responses(priority_feature);
CREATE INDEX IF NOT EXISTS idx_survey_beta_interest ON artist_survey_responses(beta_interest);
CREATE INDEX IF NOT EXISTS idx_survey_source ON artist_survey_responses(source);
