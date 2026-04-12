/**
 * Definições dos Passos de Onboarding — MAPI
 *
 * Usado por OnboardingChecklist e TooltipGuide.
 * Separado de onboarding-actions.js pois "use server" não permite exportar objetos.
 */

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Criar primeira turma",
    description: "Dê nome à sua turma",
    action: "createClass",
  },
  {
    id: 2,
    title: "Adicionar alunos",
    description: "Cadastre manualmente ou importe CSV",
    action: "addStudents",
  },
  {
    id: 3,
    title: "Gerar seu primeiro mapa",
    description: "Use o algoritmo inteligente",
    action: "generateMap",
  },
  {
    id: 4,
    title: "Marcar aluno com necessidade especial",
    description: "Registre TEA, TDAH ou outra condição",
    action: "markAccessibility",
  },
  {
    id: 5,
    title: "Ver guia de manejo",
    description: "Descubra dicas práticas para sua sala",
    action: "viewGuide",
  },
];
