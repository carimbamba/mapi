#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# MAPI — Script de Deploy para Produção
# ═══════════════════════════════════════════════════════════════════════════
#
# Uso:
#   bash scripts/deploy.sh
#
# Pré-requisitos:
#   - Node.js 20+
#   - npm 10+
#   - Variáveis de ambiente configuradas (.env.production)
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  MAPI — Deploy para Produção${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# ─── Passo 1: Verificar variáveis de ambiente ──────────────────────────
echo -e "${YELLOW}[1/5] Verificando variáveis de ambiente...${NC}"

REQUIRED_VARS=(
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
    "DIRECT_URL"
    "ENCRYPTION_KEY"
)

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING+=("$var")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "${RED}ERRO: Variáveis de ambiente obrigatórias ausentes:${NC}"
    for var in "${MISSING[@]}"; do
        echo -e "  ${RED}✗${NC} $var"
    done
    echo ""
    echo -e "${YELLOW}Configure as variáveis no .env.production ou no painel da Vercel.${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5] ✓ Todas as variáveis de ambiente estão configuradas${NC}"

# ─── Passo 2: Instalar dependências ────────────────────────────────────
echo -e "${YELLOW}[2/5] Instalando dependências...${NC}"

npm ci --production=false

echo -e "${GREEN}[2/5] ✓ Dependências instaladas${NC}"

# ─── Passo 3: Executar migrations ──────────────────────────────────────
echo -e "${YELLOW}[3/5] Executando migrations do banco de dados...${NC}"

npx prisma migrate deploy

echo -e "${GREEN}[3/5] ✓ Migrations executadas com sucesso${NC}"

# ─── Passo 4: Gerar Prisma Client ──────────────────────────────────────
echo -e "${YELLOW}[4/5] Gerando Prisma Client...${NC}"

npx prisma generate

echo -e "${GREEN}[4/5] ✓ Prisma Client gerado${NC}"

# ─── Passo 5: Build da aplicação ───────────────────────────────────────
echo -e "${YELLOW}[5/5] Construindo a aplicação...${NC}"

npm run build

echo -e "${GREEN}[5/5] ✓ Build concluído com sucesso${NC}"

# ─── Resultado ─────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Deploy pronto para produção!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "Para deploy na Vercel:"
echo -e "  ${YELLOW}vercel --prod${NC}"
echo ""
echo -e "Ou conecte o repositório no painel da Vercel para deploy automático."
echo ""
