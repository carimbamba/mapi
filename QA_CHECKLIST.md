# Checklist de QA — MAPI MVP

> **Versão:** 1.0.0
> **Data:** 2026-04-10
> **Responsável:**
> **Status:** ⬜ Não iniciado | 🔄 Em progresso | ✅ Passou | ❌ Falhou

---

## 1. ONBOARDING (Novo Professor)

| # | Teste | Status | Observações |
|---|---|---|---|
| 1 | Novo professor com < 24h sem turmas vê wizard de boas-vindas | ⬜ | |
| 2 | Wizard Passo 1: campo de nome e escola preenche perfil | ⬜ | |
| 3 | Wizard Passo 2: abre ClassForm inline para criar primeira turma | ⬜ | |
| 4 | Wizard Passo 3: pede para adicionar primeiro aluno | ⬜ | |
| 5 | "Fazer isso depois" em qualquer passo fecha wizard e mostra dashboard | ⬜ | |
| 6 | OnboardingChecklist aparece no dashboard após wizard | ⬜ | |
| 7 | Checklist marca "Criar primeira turma" ao criar turma | ⬜ | |
| 8 | Checklist pode ser descartada com botão X | ⬜ | |
| 9 | Checklist não reaparece após reload se descartada | ⬜ | |
| 10 | TooltipGuide aponta para elementos com data-onboarding | ⬜ | |

---

## 2. IMPORT CSV

| # | Teste | Status | Observações |
|---|---|---|---|
| 11 | CSV válido com 5 alunos → importa todos sem erro | ⬜ | |
| 12 | CSV com header row → ignora header corretamente | ⬜ | |
| 13 | CSV com separador `;` → detecta e parseia corretamente | ⬜ | |
| 14 | CSV com separador `,` → detecta e parseia corretamente | ⬜ | |
| 15 | CSV inválido (linhas vazias) → reporta erros por linha | ⬜ | |
| 16 | CSV com caracteres especiais (ã, é, ç) → preserva encoding | ⬜ | |
| 17 | CSV com coluna "diagnostico" → mapeia para tipo correto | ⬜ | |
| 18 | Preview mostra primeiras 5 linhas antes de importar | ⬜ | |
| 19 | Colar texto (não arquivo) → funciona como alternativa | ⬜ | |

---

## 3. MAPA DE SALA

| # | Teste | Status | Observações |
|---|---|---|---|
| 20 | Canvas renderiza com grid de mesas | ⬜ | |
| 21 | Aluno TEA → badge colorido (índigo) visível no card | ⬜ | |
| 22 | Aluno TDAH → badge colorido (âmbar) visível no card | ⬜ | |
| 23 | Clicar em StudentCard → abre StudentProfile no Sheet | ⬜ | |
| 24 | StudentProfile mostra diagnóstico SÓ com parentConsent=true | ⬜ | |
| 25 | Sem consentimento → mostra "Dados pendentes de consentimento" | ⬜ | |
| 26 | Drag & drop de aluno para mesa vazia → funciona | ⬜ | |
| 27 | Drag & drop de aluno para mesa ocupada → troca alunos | ⬜ | |
| 28 | "Gerar Automaticamente" → populates todas as mesas | ⬜ | |
| 29 | Mudar layout (rows → groups) → preserva alunos posicionados | ⬜ | |
| 30 | Exportar mapa como PNG → download com nome correto | ⬜ | |
| 31 | Zoom in (150%) → canvas escala sem cortar | ⬜ | |
| 32 | Zoom out (75%) → canvas escala sem distorcer | ⬜ | |

---

## 4. DIÁRIO DE BORDO

| # | Teste | Status | Observações |
|---|---|---|---|
| 33 | Criar entrada com descrição válida → aparece na timeline | ⬜ | |
| 34 | Descrição com < 10 chars → botão desabilitado ou erro | ⬜ | |
| 35 | Categoria "Crise" → banner vermelho aparece no formulário | ⬜ | |
| 36 | Visibilidade "Família" → aviso amarelo antes do submit | ⬜ | |
| 37 | Editar entrada existente → salva alterações | ⬜ | |
| 38 | Excluir entrada → pede confirmação, remove da lista | ⬜ | |
| 39 | Filtro por categoria "Crise" → mostra apenas crises | ⬜ | |
| 40 | Filtro por período "Últimos 7 dias" → filtra corretamente | ⬜ | |

---

## 5. LIMITES DE PLANO

| # | Teste | Status | Observações |
|---|---|---|---|
| 41 | Professor FREE com 2 turmas → botão "Nova Turma" mostra erro | ⬜ | |
| 42 | Professor FREE tenta gerar mapa → vê "disponível no Premium" | ⬜ | |
| 43 | UpgradePrompt aparece inline no lugar do botão bloqueado | ⬜ | |
| 44 | "Ver planos" no UpgradePrompt → navega para página de planos | ⬜ | |
| 45 | Professor PREMIUM pode criar turmas ilimitadas | ⬜ | |

---

## 6. MOBILE / RESPONSIVIDADE

| # | Teste | Status | Observações |
|---|---|---|---|
| 46 | 320px: CTA "Começar grátis" visível sem scroll horizontal | ⬜ | |
| 47 | 375px: Sidebar abre como drawer/bottom sheet | ⬜ | |
| 48 | 768px: Grid de turmas em 2 colunas | ⬜ | |
| 49 | Canvas do mapa → scroll horizontal suave no mobile | ⬜ | |
| 50 | Touch drag de aluno para mesa → funciona no celular | ⬜ | |
| 51 | OnboardingChecklist responsivo em mobile | ⬜ | |

---

## 7. ACESSIBILIDADE

| # | Teste | Status | Observações |
|---|---|---|---|
| 52 | Skip link "Pular para o conteúdo" aparece com Tab | ⬜ | |
| 53 | Todos os botões icônicos têm aria-label | ⬜ | |
| 54 | Navegação por Tab entre mesas do canvas funciona | ⬜ | |
| 55 | Enter em mesa focada → abre perfil do aluno | ⬜ | |
| 56 | Contraste 4.5:1 em todos os textos de badges | ⬜ | |
| 57 | Focus visible (ring 2px azul) em todos os interativos | ⬜ | |

---

## 8. PERFORMANCE

| # | Teste | Status | Observações |
|---|---|---|---|
| 58 | Landing page LCP < 2500ms | ⬜ | |
| 59 | Dashboard carregamento inicial < 2s | ⬜ | |
| 60 | Canvas com 40 alunos → renderiza sem lag perceptível | ⬜ | |
| 61 | Skeleton loading aparece antes do conteúdo | ⬜ | |

---

## 9. SEGURO / LGPD

| # | Teste | Status | Observações |
|---|---|---|---|
| 62 | diagnosis_notes não aparece no Network tab sem consentimento | ⬜ | |
| 63 | HTTPS obrigatório em produção | ⬜ | |
| 64 | Headers de segurança presentes (X-Frame, X-Content-Type) | ⬜ | |
| 65 | Política de privacidade acessível no footer | ⬜ | |

---

## Resumo Final

| Categoria | Total | ✅ | ❌ | ⬜ |
|---|---|---|---|---|
| Onboarding | 10 | | | |
| Import CSV | 9 | | | |
| Mapa de Sala | 13 | | | |
| Diário de Bordo | 8 | | | |
| Limites de Plano | 5 | | | |
| Mobile / Responsividade | 6 | | | |
| Acessibilidade | 6 | | | |
| Performance | 4 | | | |
| Segurança / LGPD | 4 | | | |
| **TOTAL** | **65** | **0** | **0** | **65** |

---

### Critérios de Aprovação

- **≥ 90%** dos testes devem passar (59/65)
- **0 falhas** em categorias de Segurança/LGPD
- **0 falhas** em categorias de Acessibilidade
- Lighthouse Performance ≥ 85
- Lighthouse Accessibility ≥ 90
- Lighthouse SEO ≥ 90

---

### Notas de Execução

- **Data de início:**
- **Data de conclusão:**
- **Ambiente de teste:**
- **Bugs críticos encontrados:**
- **Bugs não-críticos encontrados:**

---

*Documento criado em: 2026-04-10*
*Última revisão: 2026-04-10*
