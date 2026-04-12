#!/usr/bin/env bash
#
# Lighthouse Test — MAPI Landing Page
#
# Executa Lighthouse na landing page do MAPI e verifica métricas mínimas.
#
# Uso:
#   1. Instalar Lighthouse: npm install -g lighthouse
#   2. Iniciar servidor: npm run dev
#   3. Rodar teste: bash scripts/lighthouse-test.sh
#

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
OUTPUT_FILE="./reports/lighthouse-landing.json"

mkdir -p ./reports

echo ""
echo "═══ MAPI Lighthouse Test ═══"
echo ""
echo "URL: $BASE_URL"
echo "Output: $OUTPUT_FILE"
echo ""

# Verifica se lighthouse está instalado
if ! command -v lighthouse &> /dev/null; then
  echo "ERRO: Lighthouse não está instalado."
  echo "Instale com: npm install -g lighthouse"
  exit 1
fi

# Executa Lighthouse
echo "Executando Lighthouse..."
lighthouse "$BASE_URL" \
  --output json \
  --output-path "$OUTPUT_FILE" \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --quiet 2>/dev/null || true

# Verifica se o arquivo foi gerado
if [ ! -f "$OUTPUT_FILE" ]; then
  echo "ERRO: Lighthouse não gerou relatório."
  echo "Verifique se o servidor está rodando em $BASE_URL"
  exit 1
fi

# Extrai métricas
echo ""
echo "═══ Resultado ═══"
echo ""

# Usa node para extrair métricas do JSON
node -e "
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('$OUTPUT_FILE', 'utf8'));

const perf = report.categories.performance.score;
const a11y = report.categories.accessibility.score;
const seo = report.categories.seo.score;
const bp = report.categories['best-practices'].score;

const lcp = report.audits['largest-contentful-paint']?.numericValue || 0;
const cls = report.audits['cumulative-layout-shift']?.numericValue || 0;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function check(name, value, threshold) {
  const pass = value >= threshold;
  const icon = pass ? GREEN + '✓' + RESET : RED + '✗' + RESET;
  const pct = (value * 100).toFixed(0);
  console.log('  ' + icon + ' ' + name + ': ' + pct + '% (mín: ' + (threshold * 100) + '%)');
  return pass;
}

console.log('Performance:');
check('Performance', perf, 0.85);
check('Acessibilidade', a11y, 0.90);
check('SEO', seo, 0.90);
check('Best Practices', bp, 0.85);

console.log('');
console.log('Core Web Vitals:');
const lcpPass = lcp < 2500;
console.log('  ' + (lcpPass ? GREEN + '✓' + RESET : RED + '✗' + RESET) + ' LCP: ' + lcp.toFixed(0) + 'ms (máx: 2500ms)');
const clsPass = cls < 0.1;
console.log('  ' + (clsPass ? GREEN + '✓' + RESET : RED + '✗' + RESET) + ' CLS: ' + cls.toFixed(3) + ' (máx: 0.1)');

console.log('');
const allPassed = perf >= 0.85 && a11y >= 0.90 && seo >= 0.90 && bp >= 0.85 && lcpPass && clsPass;
if (!allPassed) {
  process.exit(1);
}
"
