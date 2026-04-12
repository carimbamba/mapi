/**
 * Testes de Completude dos Guias Clínicos
 *
 * Verifica que cada guia atende os requisitos mínimos de conteúdo
 * e que nenhum guia contém orientações perigosas ou antiéticas.
 *
 * Executar: npx vitest run lib/accessibility/condition-guides.test.js
 */

import { describe, it, expect } from "vitest";
import {
  getGuide,
  getAllGuides,
  getSeatingRecommendationsForClass,
} from "./condition-guides.js";

// ─── Helper ──────────────────────────────────────────────────────────────────

const requiredConditions = [
  "TEA",
  "TDAH",
  "TOD",
  "DISLEXIA",
  "DISCALCULIA",
  "ALTAS_HABILIDADES",
];

// ─── GRUPO 1: Completude dos Guias ──────────────────────────────────────────

describe("GRUPO 1 — Completude dos Guias Clínicos", () => {
  describe.each(requiredConditions)("Guia %s", (type) => {
    it("tem todos os campos obrigatórios", () => {
      const guide = getGuide(type);

      expect(guide).not.toBeNull();
      expect(guide.id).toBe(type);
      expect(guide.name).toBeTruthy();
      expect(guide.shortDescription).toBeTruthy();
      expect(guide.color).toBeTruthy();
      expect(guide.icon).toBeTruthy();
    });

    it(`tem pelo menos 3 seatingRecommendations (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.seatingRecommendations.length).toBeGreaterThanOrEqual(3);
    });

    it(`tem pelo menos 5 doList items (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.doList.length).toBeGreaterThanOrEqual(5);
    });

    it(`tem pelo menos 4 dontList items (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.dontList.length).toBeGreaterThanOrEqual(4);
    });

    it(`tem pelo menos 3 crisisProtocol steps (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.crisisProtocol.length).toBeGreaterThanOrEqual(3);
    });

    it(`tem pelo menos 3 communicationTips (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.communicationTips.length).toBeGreaterThanOrEqual(3);
    });

    it(`tem disclaimer presente e não vazio (tem: ${type})`, () => {
      const guide = getGuide(type);
      expect(guide.disclaimer).toBeTruthy();
      expect(guide.disclaimer.length).toBeGreaterThan(20);
    });

    it(`o disclaimer contém aviso de que não substitui avaliação profissional (tem: ${type})`, () => {
      const guide = getGuide(type);
      const disclaimer = guide.disclaimer.toLowerCase();
      expect(
        disclaimer.includes("não substitui") ||
        disclaimer.includes("nao substitui")
      ).toBe(true);
    });
  });
});

// ─── GRUPO 2: Segurança Clínica ─────────────────────────────────────────────

describe("GRUPO 2 — Segurança Clínica (CFP Compliance)", () => {
  it("Nenhum guia instrui contenção física de aluno", () => {
    // Termos em contexto afirmativo (não em negação como "não segure")
    const prohibitedPatterns = [
      /\bsegure\b/, // "segure" mas não "não segure"
      /\bimobilize\b/,
      /\bprenda\b/,
      /\bcontenha\b.*alun/,
    ];

    getAllGuides().forEach((guide) => {
      const allText = [
        ...guide.doList,
        ...guide.crisisProtocol,
        ...guide.seatingRecommendations,
      ].join(" ");

      // Remove frases de negação para evitar falsos positivos
      const withoutNegation = allText
        .replace(/não\s+\w+/gi, "")
        .replace(/nem\s+\w+/gi, "");

      prohibitedPatterns.forEach((pattern) => {
        expect(withoutNegation.toLowerCase()).not.toMatch(
          pattern,
          `Guia "${guide.name}" pode instruir contenção física`
        );
      });
    });
  });

  it("Nenhum guia sugere punição como estratégia", () => {
    const prohibitedPatterns = [
      /\bpun[aã]\b/,
      /\bcastig/i,
      /\bhumilh/i,
      /\bvergonha\b.*pública/,
    ];

    getAllGuides().forEach((guide) => {
      const allText = [
        ...guide.doList,
        ...guide.crisisProtocol,
      ].join(" ");

      const withoutNegation = allText
        .replace(/não\s+\w+/gi, "")
        .replace(/nem\s+\w+/gi, "");

      prohibitedPatterns.forEach((pattern) => {
        expect(withoutNegation.toLowerCase()).not.toMatch(
          pattern,
          `Guia "${guide.name}" sugere punição`
        );
      });
    });
  });

  it("Guias de crise orientam garantir segurança SEM contenção", () => {
    getAllGuides().forEach((guide) => {
      const crisisText = guide.crisisProtocol.join(" ");

      // Deve mencionar segurança
      expect(
        crisisText.toLowerCase().includes("segurança") ||
        crisisText.toLowerCase().includes("seguro") ||
        crisisText.toLowerCase().includes("proteger")
      ).toBe(true);

      // Remove negações para evitar falsos positivos
      const withoutNegation = crisisText
        .replace(/não\s+\w+/gi, "")
        .replace(/nem\s+\w+/gi, "");

      // NÃO deve mencionar contenção afirmativa
      expect(withoutNegation.toLowerCase()).not.toMatch(/\bsegure\b/);
      expect(withoutNegation.toLowerCase()).not.toMatch(/\bimobilize\b/);
      expect(withoutNegation.toLowerCase()).not.toMatch(/\bforce\b/);
    });
  });

  it("Linguagem é do professor, não clínica — sem jargão sem explicação", () => {
    const clinicalJargon = [
      "meltdown atônico",
      "regulação neurobiológica",
      "hiperestimulação sensorial cortical",
      "disfunção executiva primária",
      "comorbidade psiquiátrica",
    ];

    getAllGuides().forEach((guide) => {
      const allText = [
        ...guide.doList,
        ...guide.dontList,
        ...guide.crisisProtocol,
        ...guide.communicationTips,
        ...guide.seatingRecommendations,
      ]
        .join(" ")
        .toLowerCase();

      clinicalJargon.forEach((term) => {
        expect(allText).not.toContain(
          term,
          `Guia "${guide.name}" usa jargão clínico: "${term}"`
        );
      });
    });
  });
});

// ─── GRUPO 3: Edge Cases das Functions ──────────────────────────────────────

describe("GRUPO 3 — Edge Cases das Functions", () => {
  it("getGuide com tipo válido retorna guia correto", () => {
    const guide = getGuide("TEA");
    expect(guide).not.toBeNull();
    expect(guide.id).toBe("TEA");
  });

  it("getGuide com tipo OUTRO retorna guia genérico", () => {
    const guide = getGuide("OUTRO");
    expect(guide).not.toBeNull();
    expect(guide.id).toBe("OUTRO");
  });

  it("getGuide com tipo inválido retorna null sem crash", () => {
    expect(() => getGuide("INVALIDO")).not.toThrow();
    const guide = getGuide("INVALIDO");
    expect(guide).toBeNull();
  });

  it("getGuide com null retorna null sem crash", () => {
    expect(() => getGuide(null)).not.toThrow();
    const guide = getGuide(null);
    expect(guide).toBeNull();
  });

  it("getAllGuides retorna todas as condições (8)", () => {
    const guides = getAllGuides();
    expect(guides.length).toBe(8); // 6 principais + OUTRO + NAO_INFORMADO

    const ids = guides.map((g) => g.id);
    expect(ids).toContain("TEA");
    expect(ids).toContain("TDAH");
    expect(ids).toContain("TOD");
    expect(ids).toContain("DISLEXIA");
    expect(ids).toContain("DISCALCULIA");
    expect(ids).toContain("ALTAS_HABILIDADES");
    expect(ids).toContain("OUTRO");
    expect(ids).toContain("NAO_INFORMADO");
  });
});

// ─── GRUPO 4: getSeatingRecommendationsForClass ─────────────────────────────

describe("GRUPO 4 — getSeatingRecommendationsForClass", () => {
  it("agrega recomendações de múltiplos alunos sem duplicatas", () => {
    const students = [
      {
        id: "s1",
        name: "João",
        hasAccessibilityNeeds: true,
        diagnosisType: "TEA",
      },
      {
        id: "s2",
        name: "Maria",
        hasAccessibilityNeeds: true,
        diagnosisType: "TDAH",
      },
    ];

    const recs = getSeatingRecommendationsForClass(students);
    const unique = new Set(recs);

    expect(unique.size).toBe(recs.length); // sem duplicatas
    expect(recs.length).toBeGreaterThanOrEqual(3); // pelo menos 3 recs
  });

  it("turma sem alunos com necessidades retorna mensagem padrão", () => {
    const students = [
      { id: "s1", name: "João", hasAccessibilityNeeds: false },
      { id: "s2", name: "Maria", hasAccessibilityNeeds: false },
    ];

    const recs = getSeatingRecommendationsForClass(students);

    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]).toContain("Nenhum aluno com necessidades");
  });

  it("aluno sem diagnóstico registrado gera aviso específico", () => {
    const students = [
      {
        id: "s1",
        name: "Pedro",
        hasAccessibilityNeeds: true,
        diagnosisType: null,
      },
    ];

    const recs = getSeatingRecommendationsForClass(students);

    expect(recs.some((r) => r.includes("Pedro"))).toBe(true);
    expect(
      recs.some((r) => r.includes("sem diagnóstico informado"))
    ).toBe(true);
  });

  it("turma vazia retorna mensagem padrão", () => {
    const recs = getSeatingRecommendationsForClass([]);

    expect(recs.length).toBe(2);
    expect(recs[0]).toContain("Nenhum aluno");
  });
});

// ─── GRUPO 5: Cores válidas ─────────────────────────────────────────────────

describe("GRUPO 5 — Cores dos Badges", () => {
  const validColors = [
    "indigo",
    "amber",
    "orange",
    "teal",
    "rose",
    "purple",
    "gray",
  ];

  it.each(requiredConditions)("Guia %s tem cor válida", (type) => {
    const guide = getGuide(type);
    expect(validColors).toContain(guide.color);
  });

  it("cores são distintas entre condições principais", () => {
    const colors = requiredConditions.map((type) => getGuide(type).color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});
