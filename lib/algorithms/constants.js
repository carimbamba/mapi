/**
 * Constantes do algoritmo de geração de mapa de sala
 *
 * Centraliza magic numbers para facilitar tuning e testes.
 */

// ─── Algoritmo CSP ───────────────────────────────────────────────────────────

/**
 * Máximo de iterações de backtracking (Passo 4)
 * Previne loop infinito quando regras conflitantes não podem ser resolvidas.
 */
export const MAX_BACKTRACK_ITERATIONS = 50;

/**
 * Timeout em milissegundos para execução completa do algoritmo.
 * Previne travamento em turmas muito grandes.
 */
export const ALGORITHM_TIMEOUT_MS = 5000;

/**
 * Distância em pixels abaixo da qual dois desks são considerados adjacentes.
 */
export const DESK_ADJACENCY_THRESHOLD = 120;

// ─── Layout físico ───────────────────────────────────────────────────────────

/** Largura padrão de uma mesa em pixels */
export const DESK_WIDTH = 80;

/** Altura padrão de uma mesa em pixels */
export const DESK_HEIGHT = 60;

/** Espaçamento horizontal entre mesas */
export const DESK_GAP_X = 20;

/** Espaçamento vertical entre mesas */
export const DESK_GAP_Y = 20;

/** Posição Y do quadro (acima da primeira fila) */
export const BOARD_Y = -40;

/** Posição do professor em Y (acima do quadro) */
export const TEACHER_Y_OFFSET = -20;

// ─── Pesos de prioridade por condição ────────────────────────────────────────

export const PRIORITY_WEIGHTS = {
  /** Deficiência visual — máxima prioridade (precisa estar na frente) */
  isBlind: 100,
  /** Deficiência auditiva — máxima prioridade (precisa estar perto do professor) */
  isDeaf: 100,
  /** Mobilidade reduzida — precisa de acesso a corredor */
  hasReducedMobility: 80,
  /** TEA — precisa de posição estável, baixo estímulo lateral */
  TEA: 70,
  /** TDAH — precisa de proximidade ao professor */
  TDAH: 60,
  /** Assento prioritário genérico */
  prioritySeating: 50,
  /** Aluno sem necessidades especiais */
  default: 0,
};

// ─── Desk scoring weights ────────────────────────────────────────────────────

/** Peso de distância ao quadro para cegos (por pixel) */
export const BLIND_BOARD_WEIGHT = 0.3;

/** Peso de distância ao professor para surdos (por pixel) */
export const DEAF_TEACHER_WEIGHT = 0.3;

/** Bônus fixo para mobilidade reduzida em corredor */
export const MOBILITY_AISLE_BONUS = 50;

/** Peso de distância ao professor para TDAH */
export const TDAH_TEACHER_WEIGHT = 0.25;

/** Bônus base para TEA em posição estável */
export const TEA_STABILITY_BONUS = 15;

/** Bônus extra para TEA longe de corredor */
export const TEA_NO_AISLE_BONUS = 10;

/** Peso de distância ao quadro para priority seating genérico */
export const PRIORITY_BOARD_WEIGHT = 0.15;

/** Score máximo teórico por aluno (usado na normalização) */
export const MAX_THEORETICAL_SCORE_PER_STUDENT = 200;

// ─── Score thresholds ────────────────────────────────────────────────────────

/** Score base para alunos posicionados (metade do score total) */
export const SCORE_BASE_PLACEMENT = 50;

/** Score máximo para qualidade de posicionamento (metade do score total) */
export const SCORE_MAX_QUALITY = 50;

/** Penalidade por warning no score final */
export const SCORE_WARNING_PENALTY = 5;

// ─── Distância threshold para regras de posicionamento ───────────────────────

/** Distância máxima ao quadro para NEAR_FRONT */
export const NEAR_FRONT_THRESHOLD = 200;

/** Distância máxima ao professor para NEAR_TEACHER */
export const NEAR_TEACHER_THRESHOLD = 250;

/** Distância máxima para filtro de cego no board */
export const BLIND_BOARD_FILTER = 200;

/** Distância máxima para filtro de surdo no teacher */
export const DEAF_TEACHER_FILTER = 200;

/** Distância máxima para filtro de TDAH no teacher */
export const TDAH_TEACHER_FILTER = 300;
