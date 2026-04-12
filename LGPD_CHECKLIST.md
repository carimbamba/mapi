# Checklist de Segurança LGPD — MAPI

> **Lei Geral de Proteção de Dados (Lei 13.709/2018)**
> Verificação pré-lançamento para conformidade com LGPD

---

## 🔴 CRÍTICO (Bloqueantes para lançamento)

### [ ] 1. Política de Privacidade presente e acessível
- [ ] Página `/privacidade` ou `/politica-de-privacidade` publicada
- [ ] Link visível no footer de todas as páginas
- [ ] Linguagem clara e acessível (não jurídica)
- [ ] Explica quais dados são coletados e por quê
- [ ] Explica como os dados são protegidos
- [ ] Explica direitos do usuário (acesso, retificação, exclusão)
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 2. Mecanismo de consentimento ativo para dados clínicos
- [ ] Toggle `parentConsent` obrigatório antes de registrar diagnóstico
- [ ] Texto de consentimento claro: "Confirmo que tenho autorização do responsável legal..."
- [ ] Timestamp do consentimento registrado no banco
- [ ] Possibilidade de revogar consentimento a qualquer momento
- [ ] Consentimento não é pré-marcado (opt-in, não opt-out)
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 3. Funcionalidade de exclusão de dados do usuário (Direito ao Esquecimento — Art. 18)
- [ ] Endpoint `/api/account/delete` para solicitar exclusão
- [ ] Exclusão em cascata: teacher → classes → students → logs → maps
- [ ] Dados excluídos são realmente removidos (soft delete com expiração ou hard delete)
- [ ] Confirmação por e-mail antes da exclusão definitiva
- [ ] Logs de auditoria da exclusão mantidos por período legal
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 4. Criptografia em trânsito (HTTPS obrigatório)
- [ ] Vercel com SSL/TLS habilitado (automático)
- [ ] HTTP redirecionado para HTTPS (automático no Vercel)
- [ ] `X-Frame-Options: DENY` configurado (`vercel.json`)
- [ ] `X-Content-Type-Options: nosniff` configurado (`vercel.json`)
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 5. Criptografia em repouso dos campos sensíveis
- [ ] `students.diagnosis_notes` criptografado com AES-256-GCM ✅ Implementado
- [ ] `accessibility_logs.description` criptografado com AES-256-GCM ✅ Implementado
- [ ] Chave `ENCRYPTION_KEY` armazenada em variável de ambiente segura
- [ ] Chave NÃO commitada no repositório ✅
- [ ] Backup da chave feito em gerenciador de senhas
- [ ] Teste de criptografia/descriptografia passa ✅
- **Responsável:**
- **Status:**
- **Observações:**

---

## 🟡 IMPORTANTE (Recomendado antes do lançamento)

### [ ] 6. Registro de log de acesso a dados sensíveis
- [ ] Logs de quem acessou `diagnosis_notes` (teacherId + timestamp)
- [ ] Logs de quem acessou `accessibility_logs` (teacherId + timestamp)
- [ ] Tabela `access_audit_logs` criada
- [ ] Logs imutáveis (append-only)
- [ ] Retenção de logs de auditoria: mínimo 6 meses
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 7. Prazo de retenção de dados definido na política
- [ ] Política de privacidade especifica por quanto tempo os dados são mantidos
- [ ] Dados de alunos excluídos após X anos sem atividade (ex: 2 anos)
- [ ] Logs do Diário de Bordo retidos por X anos (ex: 5 anos, conforme legislação educacional)
- [ ] Processo automatizado de expurgo de dados antigos
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 8. DPO (Data Protection Officer) identificado
- [ ] Nome e contato do responsável pela proteção de dados
- [ ] E-mail: `privacidade@mapi.app` ou similar
- [ ] Canal de comunicação com titulares de dados
- [ ] Processo de resposta a solicitações LGPD (Art. 18)
- [ ] Prazo de resposta: até 15 dias úteis (conforme ANPD)
- **Responsável:**
- **Status:**
- **Observações:**

---

## 🟢 BOAS PRÁTICAS (Recomendado para conformidade robusta)

### [ ] 9. Mapeamento de dados pessoais (Record of Processing Activities)
- [ ] Documento com todos os dados pessoais coletados
- [ ] Finalidade de cada coleta
- [ ] Base legal para cada tratamento (consentimento, legítimo interesse, obrigação legal)
- [ ] Compartilhamento com terceiros (Supabase, Vercel, etc.)
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 10. Avaliação de Impacto à Proteção de Dados (AIPD/DPIA)
- [ ] Avaliação realizada para dados sensíveis de menores
- [ ] Riscos identificados e mitigados
- [ ] Medida de segurança extras para dados de crianças/adolescentes
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 11. Transparência com os titulares
- [ ] Notificação aos pais/responsáveis sobre coleta de dados
- [ ] Explicação clara de como os dados são usados
- [ ] Canal para exercício de direitos (acesso, correção, exclusão, portabilidade)
- **Responsável:**
- **Status:**
- **Observações:**

### [ ] 12. Segurança de terceiros
- [ ] Supabase: conformidade LGPD verificada
- [ ] Vercel: conformidade LGPD verificada
- [ ] Cláusulas contratuais padrão para transferência internacional (se aplicável)
- **Responsável:**
- **Status:**
- **Observações:**

---

## Resumo de Implementação Atual

| Item | Status | Detalhes |
|---|---|---|
| Criptografia em repouso | ✅ Implementado | AES-256-GCM em `diagnosis_notes` e `description` |
| Criptografia em trânsito | ✅ Implementado | HTTPS via Vercel |
| Consentimento ativo | ✅ Implementado | Toggle `parentConsent` com texto claro |
| RLS no banco | ✅ Implementado | Policies em todas as tabelas |
| Headers de segurança | ✅ Implementado | `vercel.json` com X-Frame, X-Content-Type, etc. |
| Política de privacidade | ❌ Pendente | Criar página `/privacidade` |
| Exclusão de dados | ❌ Pendente | Criar endpoint de exclusão |
| Log de auditoria | ❌ Pendente | Criar tabela `access_audit_logs` |
| DPO identificado | ❌ Pendente | Definir responsável |
| Retenção de dados | ❌ Pendente | Definir prazos na política |

---

## Ações Imediatas para Lançamento

1. **Criar página de Política de Privacidade** (`/privacidade`)
2. **Criar endpoint de exclusão de conta** (`/api/account/delete`)
3. **Identificar DPO** e publicar contato
4. **Documentar prazos de retenção** na política
5. **Criar tabela de auditoria** para logs de acesso a dados sensíveis

---

*Documento criado em: 2026-04-10*
*Última revisão: 2026-04-10*
*Revisor:*
*Próxima revisão:*
