-- Adiciona colunas para controle da janela de leitura
ALTER TABLE condominios
ADD COLUMN leitura_dia_inicio SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN leitura_dia_fim SMALLINT NOT NULL DEFAULT 31;

COMMENT ON COLUMN condominios.leitura_dia_inicio IS 'Dia do mês que inicia o período de envio de leitura';
COMMENT ON COLUMN condominios.leitura_dia_fim IS 'Dia do mês que encerra o período de envio de leitura';

-- Atualiza os condomínios existentes com valores padrão (ex: dia 1 ao 30)
UPDATE condominios SET leitura_dia_inicio = 1, leitura_dia_fim = 30;
