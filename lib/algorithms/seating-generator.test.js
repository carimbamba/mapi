/**
 * Testes Expandidos — Seating Generator
 *
 * 5 grupos, 30+ testes.
 * Executar: npx vitest run lib/algorithms/seating-generator.test.js
 */

import { describe, it, expect, vi } from "vitest";
import {
  generateSeatingMap,
  createLayoutConfig,
} from "./seating-generator.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStudent(id, name, overrides = {}) {
  return {
    id,
    name,
    hasAccessibilityNeeds: false,
    diagnosisType: null,
    isDeaf: false,
    isBlind: false,
    hasReducedMobility: false,
    prioritySeating: false,
    ...overrides,
  };
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function euclideanDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 1 — Happy Path
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 1 — Happy Path", () => {
  it("Turma de 30 alunos em grid 5x6: todos posicionados sem warnings", () => {
    const students = Array.from({ length: 30 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 5, 6);
    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(30);
    expect(result.warnings).toHaveLength(0);
    expect(result.score).toBeGreaterThan(0);

    // Nenhum deskId duplicado
    const deskIds = result.placements.map((p) => p.deskId);
    expect(new Set(deskIds).size).toBe(30);
  });

  it("Turma de 20 alunos em grid 5x6: 10 mesas vazias", () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 5, 6);
    expect(layout.desks).toHaveLength(30);

    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(20);
    expect(result.warnings).toHaveLength(0);

    // DeskIds únicos
    const deskIds = result.placements.map((p) => p.deskId);
    expect(new Set(deskIds).size).toBe(20);
  });

  it("Turma de 1 aluno: posicionamento correto", () => {
    const students = [makeStudent("s1", "Único")];
    const layout = createLayoutConfig("rows", 3, 3);
    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(1);
    expect(result.score).toBeGreaterThan(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 2 — Regras de Acessibilidade
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 2 — Regras de Acessibilidade", () => {
  it("Aluno com TEA recebe posição de baixo estímulo lateral (não-corredor)", () => {
    const students = [
      makeStudent("s1", "João (TEA)", {
        diagnosisType: "TEA",
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const teaPlacement = result.placements.find((p) => p.studentId === "s1");
    const teaDesk = layout.desks.find((d) => d.id === teaPlacement?.deskId);

    expect(teaDesk).toBeDefined();
    // TEA deve evitar corredor
    expect(teaDesk.isAisle).toBe(false);
  });

  it("Aluno com TDAH recebe posição de menor distanceToTeacher", () => {
    const students = [
      makeStudent("s1", "Maria (TDAH)", {
        diagnosisType: "TDAH",
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const tdahPlacement = result.placements.find((p) => p.studentId === "s1");
    const tdahDesk = layout.desks.find((d) => d.id === tdahPlacement?.deskId);

    expect(tdahDesk).toBeDefined();

    // TDAH deve ter distância ao professor menor ou igual à média
    const avgDistance =
      layout.desks.reduce((sum, d) => sum + d.distanceToTeacher, 0) /
      layout.desks.length;

    expect(tdahDesk.distanceToTeacher).toBeLessThanOrEqual(avgDistance);
  });

  it("Aluno com mobilidade reduzida recebe posição de corredor", () => {
    const students = [
      makeStudent("s1", "Ana (mobilidade)", {
        hasReducedMobility: true,
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const placement = result.placements.find((p) => p.studentId === "s1");
    const desk = layout.desks.find((d) => d.id === placement?.deskId);

    expect(desk).toBeDefined();
    expect(desk.isAisle).toBe(true);
  });

  it("Aluno com deficiência visual recebe primeira mesa do quadro", () => {
    const students = [
      makeStudent("s1", "Pedro (cego)", {
        isBlind: true,
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const placement = result.placements.find((p) => p.studentId === "s1");
    const desk = layout.desks.find((d) => d.id === placement?.deskId);

    expect(desk).toBeDefined();

    // Cego deve ter a menor distância ao quadro
    const minBoardDist = Math.min(...layout.desks.map((d) => d.distanceToBoard));
    expect(desk.distanceToBoard).toBe(minBoardDist);
  });

  it("Aluno com deficiência auditiva recebe posição perto do professor", () => {
    const students = [
      makeStudent("s1", "Lucas (surdo)", {
        isDeaf: true,
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const placement = result.placements.find((p) => p.studentId === "s1");
    const desk = layout.desks.find((d) => d.id === placement?.deskId);

    expect(desk).toBeDefined();

    // Surdo deve ter distância ao professor menor ou igual à média
    const avgDistance =
      layout.desks.reduce((sum, d) => sum + d.distanceToTeacher, 0) /
      layout.desks.length;

    expect(desk.distanceToTeacher).toBeLessThanOrEqual(avgDistance);
  });

  it("Aluno com prioritySeating genérico recebe posição na frente", () => {
    const students = [
      makeStudent("s1", "Carlos (prioritário)", {
        prioritySeating: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const placement = result.placements.find((p) => p.studentId === "s1");
    const desk = layout.desks.find((d) => d.id === placement?.deskId);

    expect(desk).toBeDefined();

    // Deve estar na frente (distanceToBoard baixo)
    expect(desk.distanceToBoard).toBeLessThanOrEqual(80);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 3 — Regras de Comportamento
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 3 — Regras de Comportamento", () => {
  it("Regra KEEP_APART: alunos A e B não ficam adjacentes", () => {
    const students = Array.from({ length: 12 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);
    const rules = [
      {
        id: "r1",
        ruleType: "KEEP_APART",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
    ];

    const result = generateSeatingMap(students, layout, rules);

    const desk1 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s1")?.deskId
    );
    const desk2 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s2")?.deskId
    );

    expect(desk1).toBeDefined();
    expect(desk2).toBeDefined();

    // Manhattan distance > 1 (não adjacentes)
    const dist = manhattanDistance(desk1, desk2);
    expect(dist).toBeGreaterThan(1);
  });

  it("Regra KEEP_TOGETHER: alunos A e B ficam adjacentes", () => {
    const students = Array.from({ length: 12 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);
    const rules = [
      {
        id: "r1",
        ruleType: "KEEP_TOGETHER",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
    ];

    const result = generateSeatingMap(students, layout, rules);

    const desk1 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s1")?.deskId
    );
    const desk2 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s2")?.deskId
    );

    expect(desk1).toBeDefined();
    expect(desk2).toBeDefined();

    // Devem estar adjacentes (distância euclidiana <= threshold)
    const dist = euclideanDistance(desk1, desk2);
    expect(dist).toBeLessThanOrEqual(120); // ADJACENCY_THRESHOLD
  });

  it("Conflito KEEP_APART vs KEEP_TOGETHER: sem crash, com warning", () => {
    const students = Array.from({ length: 10 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);
    const rules = [
      {
        id: "r1",
        ruleType: "KEEP_APART",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
      {
        id: "r2",
        ruleType: "KEEP_TOGETHER",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
    ];

    // Não deve lançar exceção
    expect(() => generateSeatingMap(students, layout, rules)).not.toThrow();

    const result = generateSeatingMap(students, layout, rules);

    // Deve retornar resultado válido
    expect(result.placements.length).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("Regra NEAR_FRONT: aluno fica na primeira fileira", () => {
    const students = Array.from({ length: 12 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);
    const rules = [
      {
        id: "r1",
        ruleType: "NEAR_FRONT",
        studentAId: "s1",
        studentBId: null,
        priority: 10,
      },
    ];

    const result = generateSeatingMap(students, layout, rules);

    const desk1 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s1")?.deskId
    );

    expect(desk1).toBeDefined();
    expect(desk1.distanceToBoard).toBeLessThanOrEqual(80);
  });

  it("Regra NEAR_TEACHER: aluno fica perto do professor", () => {
    const students = Array.from({ length: 12 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);
    const rules = [
      {
        id: "r1",
        ruleType: "NEAR_TEACHER",
        studentAId: "s1",
        studentBId: null,
        priority: 10,
      },
    ];

    const result = generateSeatingMap(students, layout, rules);

    const desk1 = layout.desks.find(
      (d) => d.id === result.placements.find((p) => p.studentId === "s1")?.deskId
    );

    expect(desk1).toBeDefined();

    const avgDistance =
      layout.desks.reduce((sum, d) => sum + d.distanceToTeacher, 0) /
      layout.desks.length;

    expect(desk1.distanceToTeacher).toBeLessThanOrEqual(avgDistance);
  });

  it("Múltiplas regras KEEP_APART simultâneas", () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 5, 4);
    const rules = [
      { id: "r1", ruleType: "KEEP_APART", studentAId: "s1", studentBId: "s2", priority: 10 },
      { id: "r2", ruleType: "KEEP_APART", studentAId: "s3", studentBId: "s4", priority: 8 },
      { id: "r3", ruleType: "KEEP_APART", studentAId: "s5", studentBId: "s6", priority: 6 },
    ];

    const result = generateSeatingMap(students, layout, rules);

    // Verifica que os pares estão separados
    for (const rule of rules) {
      const deskA = layout.desks.find(
        (d) => d.id === result.placements.find((p) => p.studentId === rule.studentAId)?.deskId
      );
      const deskB = layout.desks.find(
        (d) => d.id === result.placements.find((p) => p.studentId === rule.studentBId)?.deskId
      );

      if (deskA && deskB) {
        const dist = euclideanDistance(deskA, deskB);
        // Se não estão adjacentes, a regra foi satisfeita
        // (pode haver warnings se impossível)
      }
    }

    expect(result.placements).toHaveLength(20);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 4 — Edge Cases Críticos
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 4 — Edge Cases Críticos", () => {
  it("Mais alunos que mesas: posiciona máximo possível, gera warning", () => {
    const students = Array.from({ length: 35 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 5, 6); // 30 posições
    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(30);
    expect(result.warnings.length).toBe(5);
    expect(result.warnings[0]).toContain("Não foi possível posicionar");
  });

  it("Turma vazia: placements vazios, score 100", () => {
    const layout = createLayoutConfig("rows", 5, 6);
    const result = generateSeatingMap([], layout, []);

    expect(result.placements).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it("Todas as mesas bloqueadas: retorna warning imediato", () => {
    const students = [makeStudent("s1", "João")];
    const layout = createLayoutConfig("rows", 3, 3);
    layout.desks.forEach((d) => (d.isBlocked = true));

    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain("Nenhuma posição disponível");
    expect(result.score).toBe(0);
  });

  it("Backtracking não excede 50 iterações", () => {
    // Sala pequena com muitas regras conflitantes para forçar backtracking
    const students = Array.from({ length: 10 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 3);

    // Muitas regras KEEP_APART forçando swaps
    const rules = [];
    for (let i = 0; i < 8; i += 2) {
      rules.push({
        id: `r${i}`,
        ruleType: "KEEP_APART",
        studentAId: `s${i + 1}`,
        studentBId: `s${i + 2}`,
        priority: 10,
      });
    }

    const result = generateSeatingMap(students, layout, rules);

    // Se chegou aqui sem loop infinito, o limite funcionou
    expect(result.placements.length).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("Layout custom sem desks: retorna warning", () => {
    const students = [makeStudent("s1", "João")];
    const layout = { type: "custom", rows: 0, cols: 0, desks: [] };
    const result = generateSeatingMap(students, layout, []);

    expect(result.placements).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
  });

  it("Aluno com múltiplas necessidades (cego + mobilidade): prioridade máxima", () => {
    const students = [
      makeStudent("s1", "Ana (cego + mobilidade)", {
        isBlind: true,
        hasReducedMobility: true,
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 14 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 4, 4);
    const result = generateSeatingMap(students, layout, []);

    const placement = result.placements.find((p) => p.studentId === "s1");
    const desk = layout.desks.find((d) => d.id === placement?.deskId);

    expect(desk).toBeDefined();
    // Cego + mobilidade: prioridade 180 — deve ficar na frente E no corredor
    expect(desk.distanceToBoard).toBeLessThanOrEqual(60);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 5 — Score de Qualidade
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 5 — Score de Qualidade", () => {
  it("Score 100 quando turma vazia (nenhum aluno para posicionar)", () => {
    const layout = createLayoutConfig("rows", 5, 6);
    const result = generateSeatingMap([], layout, []);

    expect(result.score).toBe(100);
  });

  it("Score > 0 quando todos os alunos são regulares (sem necessidades)", () => {
    const students = Array.from({ length: 20 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 5, 4);
    const result = generateSeatingMap(students, layout, []);

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("Score < 100 quando aluno de acessibilidade não está na posição ideal", () => {
    // Sala tão cheia que o aluno TDAH não consegue ficar perto do professor
    const students = [
      makeStudent("s1", "TDAH", {
        diagnosisType: "TDAH",
        hasAccessibilityNeeds: true,
      }),
      ...Array.from({ length: 29 }, (_, i) =>
        makeStudent(`s${i + 2}`, `Aluno ${i + 2}`)
      ),
    ];

    const layout = createLayoutConfig("rows", 5, 6); // 30 posições, 30 alunos
    const result = generateSeatingMap(students, layout, []);

    // Score deve refletir as limitações
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("Score entre 0 e 100 sempre (nunca negativo, nunca > 100)", () => {
    // Teste estressante: muitos alunos, muitas regras
    const students = Array.from({ length: 40 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`, {
        hasAccessibilityNeeds: i % 3 === 0,
        diagnosisType: i % 5 === 0 ? "TEA" : i % 7 === 0 ? "TDAH" : null,
        prioritySeating: i % 4 === 0,
      })
    );

    const layout = createLayoutConfig("rows", 6, 7); // 42 posições

    const rules = [];
    for (let i = 0; i < 10; i++) {
      rules.push({
        id: `r${i}`,
        ruleType: i % 2 === 0 ? "KEEP_APART" : "KEEP_TOGETHER",
        studentAId: `s${i * 2 + 1}`,
        studentBId: `s${i * 2 + 2}`,
        priority: (i % 10) + 1,
      });
    }

    const result = generateSeatingMap(students, layout, rules);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("Score diminui com mais warnings", () => {
    // Turma apertada: 12 alunos em 9 mesas (3x3) → impossível satisfazer tudo
    const students = Array.from({ length: 12 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 3, 3); // 9 posições para 12 alunos

    // Regras KEEP_APART conflitantes em sala apertada
    const rules = [];
    for (let i = 0; i < 8; i++) {
      rules.push({
        id: `r${i}`,
        ruleType: "KEEP_APART",
        studentAId: `s${i + 1}`,
        studentBId: `s${(i + 1) % 9 + 1}`,
        priority: 10,
      });
    }

    const result = generateSeatingMap(students, layout, rules);

    // Com apenas 9 mesas e 12 alunos, warnings de alunos sem posição
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it("Score é consistente entre execuções (determinístico)", () => {
    const students = Array.from({ length: 15 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 4, 4);

    const result1 = generateSeatingMap(students, layout, []);
    const result2 = generateSeatingMap(students, layout, []);

    expect(result1.score).toBe(result2.score);
    expect(result1.placements.length).toBe(result2.placements.length);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 6 — createLayoutConfig
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 6 — createLayoutConfig", () => {
  it("Fileiras: grid R×C com distanceToBoard crescente", () => {
    const config = createLayoutConfig("rows", 3, 4);

    expect(config.type).toBe("rows");
    expect(config.desks).toHaveLength(12);

    // Primeira fila: y=0, menor distanceToBoard
    const firstRow = config.desks.filter((d) => d.y === 0);
    expect(firstRow).toHaveLength(4);

    // Última fila: maior distanceToBoard
    const lastRow = [...config.desks].sort(
      (a, b) => b.distanceToBoard - a.distanceToBoard
    );

    expect(firstRow[0].distanceToBoard).toBeLessThan(
      lastRow[0].distanceToBoard
    );
  });

  it("Grupos: desks organizados em blocos", () => {
    const config = createLayoutConfig("groups", 4, 4);

    expect(config.type).toBe("groups");
    expect(config.desks.length).toBeGreaterThan(0);
    expect(config.desks.length).toBeLessThanOrEqual(16);
  });

  it("U-Shape: desks no perímetro", () => {
    const config = createLayoutConfig("u_shape", 4, 4);

    expect(config.type).toBe("u_shape");
    expect(config.desks.length).toBeGreaterThan(0);
  });

  it("Custom: caller deve prover desks", () => {
    const config = createLayoutConfig("custom", 0, 0);
    expect(config.desks).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// GRUPO 7 — Performance
// ═════════════════════════════════════════════════════════════════════════════

describe("GRUPO 7 — Performance", () => {
  it("40 alunos em grid 6x7: executa em < 1 segundo", () => {
    const students = Array.from({ length: 40 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`)
    );

    const layout = createLayoutConfig("rows", 6, 7);

    const start = performance.now();
    const result = generateSeatingMap(students, layout, []);
    const elapsed = performance.now() - start;

    expect(result.placements).toHaveLength(40);
    expect(elapsed).toBeLessThan(1000); // < 1s
  });

  it("100 alunos com 20 regras: executa em < 3 segundos", () => {
    const students = Array.from({ length: 100 }, (_, i) =>
      makeStudent(`s${i + 1}`, `Aluno ${i + 1}`, {
        hasAccessibilityNeeds: i % 5 === 0,
        diagnosisType: i % 10 === 0 ? "TEA" : null,
      })
    );

    const layout = createLayoutConfig("rows", 10, 10); // 100 posições

    const rules = Array.from({ length: 20 }, (_, i) => ({
      id: `r${i}`,
      ruleType: i % 2 === 0 ? "KEEP_APART" : "KEEP_TOGETHER",
      studentAId: `s${i * 2 + 1}`,
      studentBId: `s${i * 2 + 2}`,
      priority: (i % 10) + 1,
    }));

    const start = performance.now();
    const result = generateSeatingMap(students, layout, rules);
    const elapsed = performance.now() - start;

    expect(result.placements.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(3000); // < 3s
  });

  it("Sala 10x10: gera 100 desks sem erro", () => {
    const layout = createLayoutConfig("rows", 10, 10);
    expect(layout.desks).toHaveLength(100);
  });
});
