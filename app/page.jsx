import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRight,
  Map,
  WandSparkles,
  Brain,
  ScrollText,
  BookOpen,
  Share2,
  Check,
  X,
  GraduationCap,
  Shield,
  Smartphone,
  Users,
  Clock,
  Star,
} from "lucide-react";

// ─── Hero Section ───────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mapi-background via-white to-mapi-background/50">
      <div className="container mx-auto px-4 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-sm bg-mapi-primary/10 text-mapi-primary border-mapi-primary/20"
          >
            <GraduationCap className="w-4 h-4 mr-1.5" />
            EdTech para Inclusão
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Organize sua sala.
            <br />
            <span className="text-mapi-primary">Inclua de verdade.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            O mapa interativo de sala de aula que entende as necessidades dos
            seus alunos. Posicione cada aluno no lugar certo, com base em
            evidências.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 bg-mapi-primary hover:bg-mapi-primary/90"
              >
                Começar grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8"
              >
                Ver como funciona
              </Button>
            </a>
          </div>

          {/* Mockup */}
          <div className="mt-12 w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground ml-2">
                  mapi.app/dashboard
                </span>
              </div>
              <div className="p-6 bg-mapi-background">
                {/* Simplified mockup grid */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-mapi-primary/20 rounded" />
                </div>
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {Array.from({ length: 18 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded border ${i === 4
                        ? "bg-indigo-100 border-indigo-300"
                        : i === 7
                          ? "bg-amber-100 border-amber-300"
                          : i === 11
                            ? "bg-green-100 border-green-300"
                            : "bg-white border-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="text-xs">
                    TEA
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    TDAH
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Dislexia
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof ───────────────────────────────────────────────────────────

function SocialProof() {
  return (
    <section className="py-12 bg-white border-y">
      <div className="container mx-auto px-4">
        {/* Stat */}
        <div className="text-center mb-8">
          <p className="text-3xl sm:text-4xl font-bold text-foreground">
            2,5 milhões
          </p>
          <p className="text-muted-foreground mt-1">
            de alunos da Educação Especial em classes comuns no Brasil
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Fonte: MEC/Inep, Censo Escolar 2025
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Gratuito para começar
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              LGPD Compliant
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Funciona no celular
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Como Funciona ──────────────────────────────────────────────────────────

function ComoFunciona() {
  const steps = [
    {
      number: "1",
      title: "Crie sua turma",
      description:
        "Adicione alunos manualmente ou importe de um CSV em segundos.",
      icon: Users,
    },
    {
      number: "2",
      title: "Monte o mapa",
      description:
        "Arraste alunos entre as mesas ou gere automaticamente com o algoritmo inteligente.",
      icon: Map,
    },
    {
      number: "3",
      title: "Acesse perfis de acessibilidade",
      description:
        "Veja recomendações de posicionamento e guias de manejo para cada aluno.",
      icon: Brain,
    },
  ];

  return (
    <section
      id="como-funciona"
      className="py-20 bg-mapi-background scroll-mt-16"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs">
            Simples e rápido
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Como funciona
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Três passos para organizar sua sala de forma inclusiva
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-mapi-primary/20" />
                )}

                <div className="w-16 h-16 bg-mapi-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <Icon className="w-6 h-6 text-mapi-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Funcionalidades ────────────────────────────────────────────────────────

function Funcionalidades() {
  const features = [
    {
      icon: Map,
      title: "Mapa drag & drop",
      description:
        "Posicione cada aluno arrastando entre as mesas. Funciona com mouse e teclado.",
    },
    {
      icon: WandSparkles,
      title: "Geração automática inteligente",
      description:
        "O algoritmo posiciona alunos considerando necessidades especiais e regras de comportamento.",
    },
    {
      icon: Brain,
      title: "Perfis de neurodivergência",
      description:
        "TEA, TDAH, TOD, Dislexia, Discalculia, Altas Habilidades — com guias práticos para cada condição.",
    },
    {
      icon: ScrollText,
      title: "Diário de Bordo",
      description:
        "Registre comportamentos, crises e progressos. Filtre por categoria e período.",
    },
    {
      icon: BookOpen,
      title: "Guias de manejo práticos",
      description:
        "O que fazer, o que evitar, protocolo de crise — tudo na linguagem do professor.",
    },
    {
      icon: Share2,
      title: "Exportação e compartilhamento",
      description:
        "Exporte mapas em PNG, compartilhe com substitutos e coordenação.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs">
            Recursos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Tudo que você precisa para uma sala inclusiva
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="border border-gray-200 hover:shadow-md hover:border-mapi-primary/30 transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-mapi-primary/10 rounded-lg flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-mapi-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Diferenciais ───────────────────────────────────────────────────────────

function Diferenciais() {
  return (
    <section className="py-20 bg-mapi-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Por que MAPI é diferente
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A única ferramenta brasileira focada em inclusão e neurodivergência
          </p>
        </div>

        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Recurso
                </th>
                <th className="text-center py-3 px-4 font-medium text-mapi-primary">
                  MAPI
                </th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                  Outros
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Mapa interativo drag & drop", true, true],
                ["Geração automática inteligente", true, false],
                ["Perfis de neurodivergência", true, false],
                ["Guias de manejo práticos", true, false],
                ["Diário de Bordo", true, false],
                ["Em Português Brasileiro", true, false],
                ["Conforme LGPD", true, null],
                ["Lei de Inclusão brasileira", true, false],
                ["Gratuito para começar", true, false],
              ].map(([feature, mapi, outros], i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 px-4 text-foreground">{feature}</td>
                  <td className="py-3 px-4 text-center">
                    {mapi === true ? (
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {outros === true ? (
                      <Check className="w-4 h-4 text-green-600 mx-auto" />
                    ) : outros === false ? (
                      <X className="w-4 h-4 text-red-400 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Planos ─────────────────────────────────────────────────────────────────

function Planos() {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "para sempre",
      description: "Perfeito para começar",
      cta: "Começar grátis",
      ctaVariant: "outline",
      features: [
        "2 turmas",
        "Até 40 alunos por turma",
        "3 layouts de sala",
        "Mapa drag & drop",
        "Perfis de acessibilidade básicos",
      ],
      notIncluded: [
        "Geração automática por IA",
        "Diário de Bordo",
        "Exportação PDF",
      ],
    },
    {
      name: "Premium",
      price: "R$ 19,90",
      period: "/mês",
      description: "Para professores dedicados",
      cta: "Assinar Premium",
      ctaVariant: "default",
      highlight: true,
      features: [
        "Turmas ilimitadas",
        "Alunos ilimitados",
        "Layouts customizados",
        "Geração automática por IA",
        "Perfis completos + guias de manejo",
        "Diário de Bordo",
        "Exportação PDF",
        "Compartilhar com substituto",
      ],
    },
    {
      name: "Escola",
      price: "R$ 149",
      period: "/mês",
      description: "Para toda a equipe",
      cta: "Falar com vendas",
      ctaVariant: "outline",
      features: [
        "Tudo do Premium",
        "Todos os professores incluídos",
        "Templates da escola",
        "Relatórios para coordenação",
        "Acesso da coordenação ao Diário",
        "Suporte dedicado",
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs">
            Planos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Escolha o plano ideal
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Comece grátis e cresça conforme sua necessidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative ${plan.highlight
                ? "border-mapi-primary shadow-lg scale-[1.02]"
                : "border-gray-200"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-mapi-primary text-white text-xs">
                    Mais popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {plan.period}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded &&
                    plan.notIncluded.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground/60"
                      >
                        <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
                <Link href="/login" className="block">
                  <Button
                    className="w-full"
                    variant={plan.ctaVariant}
                    size={plan.highlight ? "default" : "sm"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ──────────────────────────────────────────────────────────────

function CTAFinal() {
  return (
    <section className="py-20 bg-gradient-to-b from-mapi-background to-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-mapi-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-mapi-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Crie seu primeiro mapa em 3 minutos.
            <br />
            <span className="text-mapi-primary">Grátis.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Sem cartão de crédito. Sem compromisso. Comece agora e veja a
            diferença.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 bg-mapi-primary hover:bg-mapi-primary/90"
              >
                Começar grátis agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mapi-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">MAPI</span>
          </div>
          <p className="text-sm text-center">
            MAPI — Mapa Interativo de Sala de Aula © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <a href="mailto:suporte@mapi.app" className="hover:text-white transition-colors">
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SocialProof />
      <ComoFunciona />
      <Funcionalidades />
      <Diferenciais />
      <Planos />
      <CTAFinal />
      <Footer />
    </div>
  );
}
