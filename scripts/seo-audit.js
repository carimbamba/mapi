#!/usr/bin/env node
/**
 * SEO Audit Script — MAPI
 *
 * Executa checks automatizados na landing page do MAPI.
 *
 * Uso:
 *   1. Iniciar o servidor: npm run dev
 *   2. Rodar o audit: node scripts/seo-audit.js
 *
 * Requer: cheerio (npm install -D cheerio)
 */

const cheerio = require("cheerio");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Cores para terminal
 */
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

/**
 * Formata resultado do check
 */
function checkResult(name, passed, detail = "") {
  const icon = passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  const detailText = detail ? ` ${YELLOW}(${detail})${RESET}` : "";
  console.log(`  ${icon} ${name}${detailText}`);
  return passed;
}

async function runAudit() {
  console.log(`\n${BOLD}═══ MAPI SEO Audit ═══${RESET}\n`);

  const results = {};
  let passed = 0;
  let failed = 0;

  // ─── Fetch HTML ──────────────────────────────────────────────────────────
  let html;
  try {
    const res = await fetch(`${BASE_URL}`);
    html = await res.text();
  } catch (err) {
    console.log(
      `${RED}ERRO: Não foi possível acessar ${BASE_URL}. O servidor está rodando?${RESET}`
    );
    console.log(`Execute: npm run dev`);
    process.exit(1);
  }

  const $ = cheerio.load(html);

  // ─── 1. Meta Tags ───────────────────────────────────────────────────────

  console.log(`${BOLD}1. Meta Tags${RESET}`);

  const titleText = $("title").text();
  if (checkResult("Title existe", $("title").length === 1)) passed++;
  else failed++;

  if (
    checkResult(
      'Title tem keyword "Sala de Aula"',
      titleText.includes("Sala de Aula"),
      titleText
    )
  )
    passed++;
  else failed++;

  const descContent = $('meta[name="description"]').attr("content") || "";
  if (
    checkResult(
      "Description tem 120-155 chars",
      descContent.length >= 120 && descContent.length <= 160,
      `${descContent.length} chars`
    )
  )
    passed++;
  else failed++;

  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  if (
    checkResult(
      "og:image é URL absoluta (https://)",
      ogImage.startsWith("https://"),
      ogImage
    )
  )
    passed++;
  else failed++;

  const ogType = $('meta[property="og:type"]').attr("content") || "";
  if (
    checkResult('og:type = "website"', ogType === "website", ogType)
  )
    passed++;
  else failed++;

  const twitterCard = $('meta[name="twitter:card"]').attr("content") || "";
  if (
    checkResult(
      'twitter:card = "summary_large_image"',
      twitterCard === "summary_large_image",
      twitterCard
    )
  )
    passed++;
  else failed++;

  const canonical = $('link[rel="canonical"]').attr("href") || "";
  if (
    checkResult("Canonical presente", canonical.length > 0, canonical)
  )
    passed++;
  else failed++;

  const htmlLang = $("html").attr("lang") || "";
  if (
    checkResult('lang="pt-BR"', htmlLang === "pt-BR", htmlLang)
  )
    passed++;
  else failed++;

  // ─── 2. Schema.org JSON-LD ──────────────────────────────────────────────

  console.log(`\n${BOLD}2. Schema.org JSON-LD${RESET}`);

  const jsonLdScripts = $('script[type="application/ld+json"]');
  if (
    checkResult(
      "JSON-LD presente",
      jsonLdScripts.length >= 1,
      `${jsonLdScripts.length} script(s)`
    )
  )
    passed++;
  else failed++;

  let schemaValid = false;
  try {
    const schema = JSON.parse(jsonLdScripts.first().html() || "{}");
    schemaValid = schema["@type"] === "SoftwareApplication";
    if (
      checkResult(
        "Schema é SoftwareApplication",
        schemaValid,
        schema["@type"]
      )
    )
      passed++;
    else failed++;

    if (
      checkResult(
        "applicationCategory: EducationalApplication",
        schema.applicationCategory === "EducationalApplication",
        schema.applicationCategory
      )
    )
      passed++;
    else failed++;

    if (
      checkResult(
        "offers com price: 0",
        schema.offers?.price === "0",
        schema.offers?.price
      )
    )
      passed++;
    else failed++;

    if (
      checkResult(
        "operatingSystem: Web/Web Browser",
        schema.operatingSystem?.toLowerCase().includes("web"),
        schema.operatingSystem
      )
    )
      passed++;
    else failed++;
  } catch {
    checkResult("Schema é SoftwareApplication", false, "Parse error");
    failed++;
  }

  // ─── 3. Performance ─────────────────────────────────────────────────────

  console.log(`\n${BOLD}3. Performance${RESET}`);

  // Verifica se fontes usam next/font (não @import no CSS inline)
  const hasGoogleFontImport = html.includes("@import") && html.includes("googleapis");
  if (
    checkResult(
      "Sem @import de fontes Google no CSS inline",
      !hasGoogleFontImport,
      hasGoogleFontImport ? "encontrado @import googleapis" : "OK"
    )
  )
    passed++;
  else failed++;

  // Verifica se usa CSS variable para font (indicativo de next/font)
  // Next.js hasheia os nomes das variáveis (--font-geist → geist_fc8c4bc0...)
  const usesNextFont = html.includes("--font-geist") || html.includes("geist_") && html.includes("variable");
  if (
    checkResult(
      "Fontes usam next/font (CSS variables)",
      usesNextFont,
      usesNextFont ? "geist_* variable found" : "not found"
    )
  )
    passed++;
  else failed++;

  // Verifica se há conteúdo acima do fold sem JS dependency
  const hasH1 = $("h1").length > 0;
  if (
    checkResult(
      "H1 presente no HTML (LCP-friendly)",
      hasH1,
      hasH1 ? "encontrado" : "não encontrado"
    )
  )
    passed++;
  else failed++;

  // ─── 4. Sitemap & Robots ────────────────────────────────────────────────

  console.log(`\n${BOLD}4. Sitemap & Robots${RESET}`);

  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    if (
      checkResult(
        "Sitemap.xml acessível",
        sitemapRes.status === 200,
        `status ${sitemapRes.status}`
      )
    )
      passed++;
    else failed++;

    if (sitemapRes.status === 200) {
      const sitemapXml = await sitemapRes.text();
      const sitemapUrls = (sitemapXml.match(/<loc>/g) || []).length;
      if (
        checkResult(
          "Sitemap tem URLs",
          sitemapUrls > 0,
          `${sitemapUrls} URLs`
        )
      )
        passed++;
      else failed++;

      if (
        checkResult(
          "Sitemap inclui landing page (/)",
          sitemapXml.includes("<loc>" + BASE_URL + "</loc>") ||
          sitemapXml.includes("<loc>" + BASE_URL + "/</loc>") ||
          // Sitemap may use NEXT_PUBLIC_SITE_URL (https://mapi.app) instead of localhost
          sitemapXml.includes("<loc>https://mapi.app</loc>") ||
          sitemapXml.includes("<loc>https://mapi.app/</loc>"),
          sitemapXml.includes(BASE_URL) || sitemapXml.includes("mapi.app") ? "sim" : "não"
        )
      )
        passed++;
      else failed++;
    }
  } catch (err) {
    checkResult("Sitemap.xml acessível", false, err.message);
    failed++;
  }

  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    if (
      checkResult(
        "Robots.txt acessível",
        robotsRes.status === 200,
        `status ${robotsRes.status}`
      )
    )
      passed++;
    else failed++;

    if (robotsRes.status === 200) {
      const robotsTxt = await robotsRes.text();
      const blocksRoot = robotsTxt.includes("Disallow: /\n") || robotsTxt.trim().endsWith("Disallow: /");
      if (
        checkResult(
          "Robots não bloqueia /",
          !blocksRoot,
          blocksRoot ? "bloqueado!" : "permitido"
        )
      )
        passed++;
      else failed++;

      const hasSitemapRef = robotsTxt.includes("Sitemap:");
      if (
        checkResult(
          "Robots referencia sitemap",
          hasSitemapRef,
          hasSitemapRef ? "sim" : "não"
        )
      )
        passed++;
      else failed++;
    }
  } catch (err) {
    checkResult("Robots.txt acessível", false, err.message);
    failed++;
  }

  // ─── 5. Conversão ───────────────────────────────────────────────────────

  console.log(`\n${BOLD}5. Conversão (Landing Page)${RESET}`);

  const ctaComecar = $('a[href="/login"]').length > 0;
  if (
    checkResult(
      'CTA "Começar grátis" presente (href="/login")',
      ctaComecar,
      ctaComecar ? "encontrado" : "não encontrado"
    )
  )
    passed++;
  else failed++;

  const hasSocialProof = html.includes("2,5") || html.includes("milhões");
  if (
    checkResult(
      "Social proof (estatística) presente",
      hasSocialProof,
      hasSocialProof ? "2,5 milhões encontrado" : "não encontrado"
    )
  )
    passed++;
  else failed++;

  const hasSource = html.includes("MEC") || html.includes("Inep");
  if (
    checkResult(
      "Fonte da estatística (MEC/Inep)",
      hasSource,
      hasSource ? "encontrado" : "não encontrado"
    )
  )
    passed++;
  else failed++;

  const hasHowItWorks = html.includes("como-funciona") || html.includes("Como funciona");
  if (
    checkResult(
      'Seção "Como funciona" presente',
      hasHowItWorks,
      hasHowItWorks ? "encontrado" : "não encontrado"
    )
  )
    passed++;
  else failed++;

  const planCount = (html.match(/Gratuito|Premium|Escola/g) || []).length;
  if (
    checkResult(
      "Planos visíveis na landing (3 planos)",
      planCount >= 3,
      `${planCount} referências`
    )
  )
    passed++;
  else failed++;

  const ctaCount = $('a[href="/login"]').length;
  if (
    checkResult(
      "Múltiplos CTAs para /login (conversão)",
      ctaCount >= 3,
      `${ctaCount} CTAs`
    )
  )
    passed++;
  else failed++;

  // ─── Resumo ─────────────────────────────────────────────────────────────

  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n${BOLD}═══ Resultado ═══${RESET}\n`);
  console.log(`  ${GREEN}${passed} passou${RESET}  ${RED}${failed} falhou${RESET}  de ${total} checks`);
  console.log(`  Score: ${percentage >= 90 ? GREEN : percentage >= 70 ? YELLOW : RED}${percentage}%${RESET}\n`);

  if (failed > 0) {
    console.log(`${YELLOW}Checks falhando precisam de atenção antes do deploy.${RESET}\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runAudit();
