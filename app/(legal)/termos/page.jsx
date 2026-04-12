/**
 * Termos de Uso — MAPI
 */

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — MAPI",
  description: "Termos de uso da plataforma MAPI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-mapi-background">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao início</span>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-mapi-primary" />
            <span className="font-bold text-lg">MAPI</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: 10 de abril de 2026
        </p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Aceitação</h2>
            <p>
              Ao acessar ou utilizar a plataforma MAPI, você concorda com estes
              Termos de Uso. Se não concordar, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Descrição do serviço</h2>
            <p>
              A MAPI é uma plataforma SaaS de gestão visual de salas de aula
              com foco em inclusão e neurodivergência, permitindo que professores:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Criem e gerenciem turmas</li>
              <li>Cadastrem alunos e suas necessidades de acessibilidade</li>
              <li>Gerem mapas de assentos interativos</li>
              <li>Acessem guias de manejo para condições de neurodivergência</li>
              <li>Mantenham um Diário de Bordo de comportamentos e progressos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Planos e pagamentos</h2>
            <h3 className="font-medium mt-4 mb-2">3.1 Plano Gratuito</h3>
            <p className="text-muted-foreground">
              Inclui até 2 turmas, até 40 alunos por turma e funcionalidades
              básicas. Não requer cartão de crédito.
            </p>

            <h3 className="font-medium mt-4 mb-2">3.2 Plano Premium</h3>
            <p className="text-muted-foreground">
              R$ 19,90/mês. Turmas e alunos ilimitados, geração automática por IA,
              Diário de Bordo, exportação PDF e guias de manejo completos.
            </p>

            <h3 className="font-medium mt-4 mb-2">3.3 Plano Escola</h3>
            <p className="text-muted-foreground">
              R$ 149/mês. Inclui todos os recursos do Premium para todos os
              professores da escola, acesso da coordenação e suporte dedicado.
            </p>

            <h3 className="font-medium mt-4 mb-2">3.4 Cancelamento</h3>
            <p className="text-muted-foreground">
              Você pode cancelar a qualquer momento. O acesso premium permanece
              até o final do período pago. Não há reembolso parcial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Responsabilidades do usuário
            </h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Manter a confidencialidade da sua conta e senha</li>
              <li>
                Obter consentimento do responsável legal antes de registrar dados
                sensíveis de alunos menores
              </li>
              <li>
                Utilizar a plataforma de acordo com a legislação brasileira,
                incluindo a LGPD e o ECA
              </li>
              <li>
                Não utilizar a plataforma para fins ilícitos ou não autorizados
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Propriedade intelectual
            </h2>
            <p className="text-muted-foreground">
              A plataforma MAPI, incluindo código, design, algoritmos e conteúdo,
              é propriedade da equipe MAPI. O conteúdo criado pelo professor
              (turmas, alunos, mapas, diários) é de propriedade do professor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Limitação de responsabilidade
            </h2>
            <p className="text-muted-foreground">
              Os guias de manejo fornecidos pela MAPI são ferramentas de apoio
              docente e NÃO substituem avaliação profissional especializada. A MAPI
              não se responsabiliza por decisões pedagógicas tomadas com base nas
              recomendações da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Exclusão de conta
            </h2>
            <p className="text-muted-foreground">
              Você pode solicitar a exclusão da sua conta a qualquer momento
              enviando um e-mail para{" "}
              <a href="mailto:suporte@mapi.app" className="text-mapi-primary underline">
                suporte@mapi.app
              </a>
              . Após a exclusão, todos os seus dados serão removidos permanentemente
              em até 30 dias, exceto informações que precisamos manter por
              obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contato</h2>
            <p>
              <strong>Suporte:</strong>{" "}
              <a href="mailto:suporte@mapi.app" className="text-mapi-primary underline">
                suporte@mapi.app
              </a>
            </p>
            <p>
              <strong>Privacidade:</strong>{" "}
              <a href="mailto:privacidade@mapi.app" className="text-mapi-primary underline">
                privacidade@mapi.app
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Link href="/" className="text-mapi-primary hover:underline">
            ← Voltar para a página inicial
          </Link>
        </div>
      </main>
    </div>
  );
}
