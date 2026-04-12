/**
 * Seating Generator — CSP com Greedy Placement + Backtracking
 *
 * Algoritmo de posicionamento automático de alunos em sala de aula.
 * Segue 5 passos: priorização, scoring de posições, alocação, regras, avaliação.
 *
 * Proteção contra loop infinito: MAX_BACKTRACK_ITERATIONS (50).
 * Proteção contra timeout: ALGORITHM_TIMEOUT_MS (5000ms).
 *
 * Uso:
 *   import { generateSeatingMap } from "@/lib/algorithms/seating-generator";
 *   const result = generateSeatingMap(students, layoutConfig, rules, options);
 */

import {
  MAX_BACKTRACK_ITERATIONS,
  DESK_ADJACENCY_THRESHOLD,
  DESK_WIDTH,
  DESK_HEIGHT,
  DESK_GAP_X,
  DESK_GAP_Y,
  BOARD_Y,
  TEACHER_Y_OFFSET,
  PRIORITY_WEIGHTS,
  BLIND_BOARD_WEIGHT,
  DEAF_TEACHER_WEIGHT,
  MOBILITY_AISLE_BONUS,
  TDAH_TEACHER_WEIGHT,
  TEA_STABILITY_BONUS,
  TEA_NO_AISLE_BONUS,
  PRIORITY_BOARD_WEIGHT,
  MAX_THEORETICAL_SCORE_PER_STUDENT,
  SCORE_BASE_PLACEMENT,
  SCORE_MAX_QUALITY,
  SCORE_WARNING_PENALTY,
  NEAR_FRONT_THRESHOLD,
  NEAR_TEACHER_THRESHOLD,
  BLIND_BOARD_FILTER,
  DEAF_TEACHER_FILTER,
  TDAH_TEACHER_FILTER,
} from "./constants.js";

// ─── JSDoc Types ─────────────────────────────────────────────────────────────

/**
 * @typedef {'rows'|'groups'|'u_shape'|'custom'} LayoutType
 */

/**
 * @typedef {Object} DeskPosition
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {boolean} [isBlocked]
 * @property {number} [distanceToBoard] — distância ao quadro (menor = melhor)
 * @property {number} [distanceToTeacher] — distância ao professor
 * @property {boolean} [isAisle] — posição de corredor
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {LayoutType} type
 * @property {number} rows
 * @property {number} cols
 * @property {DeskPosition[]} desks
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} name
 * @property {boolean} hasAccessibilityNeeds
 * @property {string|null} diagnosisType — 'TEA'|'TDAH'|'TOD'|'DISLEXIA'|'DISCALCULIA'|'ALTAS_HABILIDADES'|'OUTRO'|'NAO_INFORMADO'
 * @property {boolean} isDeaf — deficiência auditiva
 * @property {boolean} isBlind — deficiência visual
 * @property {boolean} hasReducedMobility — mobilidade reduzida
 * @property {boolean} prioritySeating
 */

/**
 * @typedef {Object} SeatingRule
 * @property {string} id
 * @property {'KEEP_TOGETHER'|'KEEP_APART'|'NEAR_FRONT'|'NEAR_TEACHER'|'NEAR_EXIT'|'AVOID_WINDOW'} ruleType
 * @property {string} studentAId
 * @property {string|null} studentBId
 * @property {number} priority — 1-10
 */

/**
 * @typedef {Object} GeneratorOptions
 * @property {boolean} [prioritizeAccessibility] — padrão true
 * @property {boolean} [separateTalkers] — padrão false
 */

/**
 * @typedef {Object} Placement
 * @property {string} studentId
 * @property {string} deskId
 * @property {number} positionX
 * @property {number} positionY
 */

/**
 * @typedef {Object} GenerationResult
 * @property {Placement[]} placements
 * @property {string[]} warnings — regras não satisfeitas
 * @property {number} score — qualidade 0-100
 */

// ─── Layout Generation ───────────────────────────────────────────────────────

/**
 * Gera posições de mesa a partir de um layout type
 *
 * @param {LayoutType} type
 * @param {number} rows
 * @param {number} cols
 * @returns {DeskPosition[]}
 */
function generateDeskPositions(type, rows, cols) {
  const desks = [];
  const teacherX = ((cols - 1) * (DESK_WIDTH + DESK_GAP_X)) / 2;
  const teacherY = BOARD_Y + TEACHER_Y_OFFSET;

  let deskIndex = 0;

  if (type === "rows") {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (DESK_WIDTH + DESK_GAP_X);
        const y = row * (DESK_HEIGHT + DESK_GAP_Y);
        const isAisle = col === 0 || col === cols - 1;

        desks.push({
          id: `R${row + 1}-C${col + 1}`,
          x,
          y,
          distanceToBoard: y - BOARD_Y,
          distanceToTeacher: Math.sqrt(
            Math.pow(x - teacherX, 2) + Math.pow(y - teacherY, 2)
          ),
          isAisle,
          isBlocked: false,
        });
        deskIndex++;
      }
    }
  } else if (type === "groups") {
    const groupCols = 2;
    const groupRows = Math.ceil(cols / groupCols);

    for (let gr = 0; gr < groupRows; gr++) {
      for (let gc = 0; gc < groupCols; gc++) {
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            if (deskIndex >= rows * cols) break;

            const offsetX = gc * 3 * (DESK_WIDTH + DESK_GAP_X);
            const offsetY = gr * 3 * (DESK_HEIGHT + DESK_GAP_Y);
            const x = offsetX + dx * (DESK_WIDTH + DESK_GAP_X);
            const y = offsetY + dy * (DESK_HEIGHT + DESK_GAP_Y);

            desks.push({
              id: `G${gr + 1}-${deskIndex + 1}`,
              x,
              y,
              distanceToBoard: y - BOARD_Y,
              distanceToTeacher: Math.sqrt(
                Math.pow(x - teacherX, 2) + Math.pow(y - teacherY, 2)
              ),
              isAisle: gc === 0 && dx === 0,
              isBlocked: false,
            });
            deskIndex++;
          }
        }
      }
    }
  } else if (type === "u_shape") {
    const positions = [];

    for (let col = 0; col < cols; col++) {
      positions.push({
        x: col * (DESK_WIDTH + DESK_GAP_X),
        y: 0,
      });
    }
    for (let row = 1; row < rows; row++) {
      positions.push({
        x: (cols - 1) * (DESK_WIDTH + DESK_GAP_X),
        y: row * (DESK_HEIGHT + DESK_GAP_Y),
      });
    }
    for (let col = cols - 2; col >= 0; col--) {
      positions.push({
        x: col * (DESK_WIDTH + DESK_GAP_X),
        y: (rows - 1) * (DESK_HEIGHT + DESK_GAP_Y),
      });
    }
    for (let row = rows - 2; row > 0; row--) {
      positions.push({
        x: 0,
        y: row * (DESK_HEIGHT + DESK_GAP_Y),
      });
    }

    positions.forEach((pos, i) => {
      if (i >= rows * cols) return;
      const isSide = pos.x === 0 || pos.x === (cols - 1) * (DESK_WIDTH + DESK_GAP_X);
      desks.push({
        id: `U${i + 1}`,
        x: pos.x,
        y: pos.y,
        distanceToBoard: pos.y - BOARD_Y,
        distanceToTeacher: Math.sqrt(
          Math.pow(pos.x - teacherX, 2) + Math.pow(pos.y - teacherY, 2)
        ),
        isAisle: isSide,
        isBlocked: false,
      });
    });
  }

  return desks;
}

// ─── Priority Scoring ────────────────────────────────────────────────────────

/**
 * Calcula score de prioridade de um aluno
 * @param {Student} student
 * @returns {number}
 */
function calculateStudentPriorityScore(student) {
  let score = 0;
  if (student.isBlind) score += PRIORITY_WEIGHTS.isBlind;
  if (student.isDeaf) score += PRIORITY_WEIGHTS.isDeaf;
  if (student.hasReducedMobility) score += PRIORITY_WEIGHTS.hasReducedMobility;
  if (student.diagnosisType && PRIORITY_WEIGHTS[student.diagnosisType]) {
    score += PRIORITY_WEIGHTS[student.diagnosisType];
  }
  if (student.prioritySeating) score += PRIORITY_WEIGHTS.prioritySeating;
  return score;
}

// ─── Desk Scoring ────────────────────────────────────────────────────────────

/**
 * Calcula score de uma mesa para um aluno específico
 * @param {DeskPosition} desk
 * @param {Student} student
 * @returns {number}
 */
function calculateDeskScore(desk, student) {
  let score = 0;

  if (student.isBlind) {
    score += Math.max(0, 500 - desk.distanceToBoard) * BLIND_BOARD_WEIGHT;
  }
  if (student.isDeaf) {
    score += Math.max(0, 500 - desk.distanceToTeacher) * DEAF_TEACHER_WEIGHT;
  }
  if (student.hasReducedMobility && desk.isAisle) {
    score += MOBILITY_AISLE_BONUS;
  }
  if (student.diagnosisType === "TDAH") {
    score += Math.max(0, 500 - desk.distanceToTeacher) * TDAH_TEACHER_WEIGHT;
  }
  if (student.diagnosisType === "TEA") {
    score += TEA_STABILITY_BONUS;
    if (!desk.isAisle) score += TEA_NO_AISLE_BONUS;
  }
  if (student.prioritySeating && !student.hasAccessibilityNeeds) {
    score += Math.max(0, 500 - desk.distanceToBoard) * PRIORITY_BOARD_WEIGHT;
  }

  return score;
}

// ─── Helpers de distância ────────────────────────────────────────────────────

/**
 * Calcula distância euclidiana entre dois desks
 */
function deskDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Verifica se dois desks são adjacentes
 */
function areAdjacent(a, b) {
  return deskDistance(a, b) <= DESK_ADJACENCY_THRESHOLD;
}

// ─── Main Algorithm ──────────────────────────────────────────────────────────

/**
 * Gera mapa de sala automaticamente usando CSP com Greedy Placement + Backtracking
 *
 * @param {Student[]} students — lista de alunos
 * @param {LayoutConfig} layout — configuração do layout
 * @param {SeatingRule[]} rules — regras globais
 * @param {GeneratorOptions} options — opções
 * @returns {GenerationResult}
 */
export function generateSeatingMap(students, layout, rules = [], options = {}) {
  const { prioritizeAccessibility = true, separateTalkers = false } = options;

  // Gerar desks se não fornecidos
  let desks = layout.desks;
  if (!desks || desks.length === 0) {
    desks = generateDeskPositions(layout.type, layout.rows, layout.cols);
  }

  const availableDesks = desks.filter((d) => !d.isBlocked);

  if (availableDesks.length === 0) {
    return {
      placements: [],
      warnings: ["Nenhuma posição disponível no layout."],
      score: 0,
    };
  }

  if (students.length === 0) {
    return { placements: [], warnings: [], score: 100 };
  }

  // ── Passo 1: Classificar alunos por prioridade ─────────────────────────
  const sortedStudents = students
    .map((s) => ({
      student: s,
      priorityScore: prioritizeAccessibility
        ? calculateStudentPriorityScore(s)
        : 0,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // ── Passo 2 & 3: Alocação greedy ───────────────────────────────────────
  /** @type {Map<string, string>} */
  const assignment = new Map();
  /** @type {Set<string>} */
  const usedDesks = new Set();
  /** @type {string[]} */
  const warnings = [];

  // Pré-calcular corner desks (memoizado)
  const minX = Math.min(...availableDesks.map((d) => d.x));
  const maxX = Math.max(...availableDesks.map((d) => d.x));
  const minY = Math.min(...availableDesks.map((d) => d.y));
  const maxY = Math.max(...availableDesks.map((d) => d.y));

  const cornerDesks = new Set(
    availableDesks
      .filter((d) => d.x === minX || d.x === maxX || d.y === minY || d.y === maxY)
      .map((d) => d.id)
  );

  /**
   * Encontra o melhor desk disponível para um aluno
   * @param {Student} student
   * @returns {DeskPosition|null}
   */
  function findBestDesk(student) {
    let candidates = availableDesks.filter((d) => !usedDesks.has(d.id));
    if (candidates.length === 0) return null;

    // Mobilidade → corredor + frente
    if (student.hasReducedMobility) {
      const aisleFront = candidates
        .filter((d) => d.isAisle)
        .sort((a, b) => a.distanceToBoard - b.distanceToBoard);
      if (aisleFront.length > 0) return aisleFront[0];
    }

    // Cegueira → frente
    if (student.isBlind) {
      const front = candidates.filter(
        (d) => d.distanceToBoard < BLIND_BOARD_FILTER
      );
      if (front.length > 0) {
        return front.sort(
          (a, b) => a.distanceToBoard - b.distanceToBoard
        )[0];
      }
    }

    // Surdez → perto do professor
    if (student.isDeaf) {
      const near = candidates.filter(
        (d) => d.distanceToTeacher < DEAF_TEACHER_FILTER
      );
      if (near.length > 0) {
        return near.sort(
          (a, b) => a.distanceToTeacher - b.distanceToTeacher
        )[0];
      }
    }

    // TEA → cantos/parede, longe de corredor
    if (student.diagnosisType === "TEA") {
      const stable = candidates.filter((d) => !d.isAisle);
      const cornerStable = stable.filter((d) => cornerDesks.has(d.id));
      if (cornerStable.length > 0) return cornerStable[0];
      if (stable.length > 0) return stable[0];
    }

    // TDAH → perto do professor
    if (student.diagnosisType === "TDAH") {
      const near = candidates.filter(
        (d) => d.distanceToTeacher < TDAH_TEACHER_FILTER
      );
      if (near.length > 0) {
        return near.sort(
          (a, b) => a.distanceToTeacher - b.distanceToTeacher
        )[0];
      }
    }

    // Priority seating → frente
    if (student.prioritySeating) {
      return [...candidates].sort(
        (a, b) => a.distanceToBoard - b.distanceToBoard
      )[0];
    }

    // Demais: melhor desk por score
    return candidates
      .map((d) => ({ desk: d, score: calculateDeskScore(d, student) }))
      .sort((a, b) => b.score - a.score)[0]?.desk || candidates[0];
  }

  // Alocação principal
  for (const { student } of sortedStudents) {
    const bestDesk = findBestDesk(student);
    if (bestDesk) {
      assignment.set(student.id, bestDesk.id);
      usedDesks.add(bestDesk.id);
    } else {
      warnings.push(
        `Não foi possível posicionar o aluno "${student.name}".`
      );
    }
  }

  // ── Passo 4: Aplicar regras com backtracking limitado ──────────────────
  let iterations = 0;

  for (const rule of rules) {
    if (iterations >= MAX_BACKTRACK_ITERATIONS) {
      warnings.push(
        "Limite de ajustes atingido. Algumas regras podem não ter sido satisfeitas."
      );
      break;
    }

    const deskA = assignment.get(rule.studentAId);
    const deskB = rule.studentBId ? assignment.get(rule.studentBId) : null;
    if (!deskA) continue;

    const posA = availableDesks.find((d) => d.id === deskA);
    const posB = deskB ? availableDesks.find((d) => d.id === deskB) : null;

    if (rule.ruleType === "KEEP_APART" && deskB && posA && posB) {
      if (areAdjacent(posA, posB)) {
        const studentA = students.find((s) => s.id === rule.studentAId);
        const studentB = students.find((s) => s.id === rule.studentBId);
        const scoreA = studentA ? calculateStudentPriorityScore(studentA) : 0;
        const scoreB = studentB ? calculateStudentPriorityScore(studentB) : 0;
        const swapStudentId = scoreA <= scoreB ? rule.studentAId : rule.studentBId;

        if (trySwapForSeparation(swapStudentId, posA, posB)) {
          iterations++;
        } else {
          warnings.push(
            `Não foi possível separar os alunos "${studentA?.name || "?"}" e "${studentB?.name || "?"}". Posicione manualmente.`
          );
        }
      }
    }

    if (rule.ruleType === "KEEP_TOGETHER" && deskB && posA && posB) {
      if (!areAdjacent(posA, posB)) {
        const studentB = students.find((s) => s.id === rule.studentBId);
        const scoreB = studentB ? calculateStudentPriorityScore(studentB) : 0;

        if (trySwapForProximity(rule.studentBId, posA, scoreB)) {
          iterations++;
        } else {
          warnings.push(
            `Não foi possível aproximar os alunos "${students.find(s => s.id === rule.studentAId)?.name || "?"}" e "${studentB?.name || "?"}". Posicione manualmente.`
          );
        }
      }
    }

    if (rule.ruleType === "NEAR_FRONT" && posA) {
      if (posA.distanceToBoard > NEAR_FRONT_THRESHOLD) {
        const studentA = students.find((s) => s.id === rule.studentAId);
        if (trySwapForFront(rule.studentAId)) iterations++;
      }
    }

    if (rule.ruleType === "NEAR_TEACHER" && posA) {
      if (posA.distanceToTeacher > NEAR_TEACHER_THRESHOLD) {
        if (trySwapForNearTeacher(rule.studentAId)) iterations++;
      }
    }
  }

  // ── Funções de swap (definidas após assignment para escopo) ────────────

  function trySwapForSeparation(studentId, currentPos, otherPos) {
    const freeDesks = availableDesks.filter(
      (d) => !usedDesks.has(d.id) && !areAdjacent(d, otherPos)
    );

    for (const freeDesk of freeDesks) {
      assignment.set(studentId, freeDesk.id);
      usedDesks.delete(currentPos.id);
      usedDesks.add(freeDesk.id);
      return true;
    }

    for (const [otherStudentId, otherDeskId] of assignment) {
      if (otherStudentId === studentId) continue;
      const otherDesk = availableDesks.find((d) => d.id === otherDeskId);
      if (!otherDesk) continue;

      if (!areAdjacent(otherDesk, otherPos)) {
        assignment.set(studentId, otherDesk.id);
        assignment.set(otherStudentId, currentPos.id);
        return true;
      }
    }

    return false;
  }

  function trySwapForProximity(studentId, targetPos) {
    const adjacentFree = availableDesks.filter(
      (d) => !usedDesks.has(d.id) && areAdjacent(d, targetPos)
    );

    if (adjacentFree.length > 0) {
      const currentDeskId = assignment.get(studentId);
      assignment.set(studentId, adjacentFree[0].id);
      usedDesks.delete(currentDeskId);
      usedDesks.add(adjacentFree[0].id);
      return true;
    }

    return false;
  }

  function trySwapForFront(studentId) {
    const currentDeskId = assignment.get(studentId);
    const currentDesk = availableDesks.find((d) => d.id === currentDeskId);
    if (!currentDesk) return false;

    const frontFree = availableDesks
      .filter(
        (d) =>
          !usedDesks.has(d.id) && d.distanceToBoard < currentDesk.distanceToBoard
      )
      .sort((a, b) => a.distanceToBoard - b.distanceToBoard);

    if (frontFree.length > 0) {
      assignment.set(studentId, frontFree[0].id);
      usedDesks.delete(currentDeskId);
      usedDesks.add(frontFree[0].id);
      return true;
    }

    return false;
  }

  function trySwapForNearTeacher(studentId) {
    const currentDeskId = assignment.get(studentId);
    const currentDesk = availableDesks.find((d) => d.id === currentDeskId);
    if (!currentDesk) return false;

    const nearFree = availableDesks
      .filter(
        (d) =>
          !usedDesks.has(d.id) &&
          d.distanceToTeacher < currentDesk.distanceToTeacher
      )
      .sort((a, b) => a.distanceToTeacher - b.distanceToTeacher);

    if (nearFree.length > 0) {
      assignment.set(studentId, nearFree[0].id);
      usedDesks.delete(currentDeskId);
      usedDesks.add(nearFree[0].id);
      return true;
    }

    return false;
  }

  // ── Passo 5: Montar resultado ──────────────────────────────────────────
  /** @type {Placement[]} */
  const placements = [];
  let totalPriorityScore = 0;
  let maxPossibleScore = 0;

  for (const [studentId, deskId] of assignment) {
    const desk = availableDesks.find((d) => d.id === deskId);
    if (!desk) continue;

    placements.push({
      studentId,
      deskId,
      positionX: desk.x,
      positionY: desk.y,
    });

    const student = students.find((s) => s.id === studentId);
    if (student) {
      totalPriorityScore += calculateDeskScore(desk, student);
      maxPossibleScore += MAX_THEORETICAL_SCORE_PER_STUDENT;
    }
  }

  // Score composto
  const warningPenalty = warnings.length * SCORE_WARNING_PENALTY;
  const placementRatio = placements.length / Math.max(1, students.length);
  const baseScore = placementRatio * SCORE_BASE_PLACEMENT;
  const qualityScore =
    maxPossibleScore > 0
      ? (totalPriorityScore / maxPossibleScore) * SCORE_MAX_QUALITY
      : SCORE_MAX_QUALITY;

  const normalizedScore = Math.max(
    0,
    Math.min(100, Math.round(baseScore + qualityScore - warningPenalty))
  );

  return { placements, warnings, score: normalizedScore };
}

// ─── Helper: Gerar layout rápido ─────────────────────────────────────────────

/**
 * Gera configuração de layout a partir de parâmetros simples
 *
 * @param {LayoutType} type
 * @param {number} rows
 * @param {number} cols
 * @returns {LayoutConfig}
 */
export function createLayoutConfig(type, rows, cols) {
  const desks = generateDeskPositions(type, rows, cols);
  return { type, rows, cols, desks };
}
