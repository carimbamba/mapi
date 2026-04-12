/**
 * Política de Privacidade — MAPI
 *
 * Conforme Lei Geral de Proteção de Dados (Lei 13.709/2018)
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — MAPI",
  description:
    "Como o MAPI coleta, usa e protege seus dados pessoais. Conforme a LGPD.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mapi-background">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao início</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-mapi-primary" />
            <span className="font-bold text-lg">MAPI</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: 10 de abril de 2026
        </p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Quem somos</h2>
            <p>
              A MAPI (Mapa Interativo de Sala de Aula) é uma plataforma SaaS
              desenvolvida para professores da educação básica brasileira
              organizarem suas turmas de forma inclusiva.
            </p>
            <p className="mt-2">
              <strong>Contato:</strong> suporte@mapi.app
              <br />
              <strong>DPO (Data Protection Officer):</strong> privacidade@mapi.app
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Dados que coletamos
            </h2>
            <h3 className="font-medium mt-4 mb-2">2.1 Dados de registro</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Escola (opcional)</li>
              <li>ID do usuário Supabase Auth</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">2.2 Dados de uso</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Turmas criadas (nome, disciplina, ano, período)</li>
              <li>Alunos cadastrados (nome, necessidades de acessibilidade)</li>
              <li>Mapas de assentos (posições, layouts)</li>
              <li>Entradas no Diário de Bordo (comportamentos, crises, progressos)</li>
            </ul>

            <h3 className="font-medium mt-4 mb-2">
              2.3 Dados sensíveis (categoria especial — Art. 5º, II, LGPD)
            </h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Diagnósticos de alunos (TEA, TDAH, Dislexia, etc.)</li>
              <li>Observações clínicas registradas pelo professor</li>
              <li>Descrições de crises e comportamentos no Diário de Bordo</li>
            </ul>
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Importante:</strong> Estes dados são criptografados em
              repouso com AES-256-GCM e só são descriptografados quando o
              professor possui consentimento ativo do responsável legal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Finalidade do tratamento
            </h2>
            <p>Tratamos seus dados exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Autenticar e manter sua conta</li>
              <li>Permitir criação e gestão de turmas e alunos</li>
              <li>Gerar mapas de assentos inteligentes</li>
              <li>Fornecer guias de manejo para alunos neurodivergentes</li>
              <li>Manter o Diário de Bordo</li>
              <li>Melhorar nossos algoritmos e funcionalidades</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Base legal (Art. 7º, LGPD)
            </h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>Consentimento:</strong> para dados sensíveis (diagnósticos,
                Diário de Bordo com visibilidade "Família")
              </li>
              <li>
                <strong>Execução de contrato:</strong> para funcionalidades
                essenciais da plataforma
              </li>
              <li>
                <strong>Legítimo interesse:</strong> para melhoria do serviço e
                segurança
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Compartilhamento de dados
            </h2>
            <p>
              <strong>Não vendemos seus dados.</strong> Compartilhamos apenas com:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>
                <strong>Supabase:</strong> hospedagem do banco de dados
                (processador de dados, com cláusulas contratuais padrão)
              </li>
              <li>
                <strong>Vercel:</strong> hospedagem da aplicação (processador de
                dados)
              </li>
            </ul>
            <p className="mt-2">
              Dados do Diário de Bordo com visibilidade "Família" podem ser
              compartilhados com os responsáveis legais do aluno, conforme
              autorizado pelo professor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Retenção de dados</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>Dados de conta:</strong> enquanto a conta estiver ativa
              </li>
              <li>
                <strong>Dados de turmas e alunos:</strong> 2 anos após a última
                atividade na turma
              </li>
              <li>
                <strong>Diário de Bordo:</strong> 5 anos (conforme legislação
                educacional brasileira)
              </li>
              <li>
                <strong>Logs de auditoria:</strong> 6 meses
              </li>
            </ul>
            <p className="mt-2">
              Após os prazos acima, os dados são excluídos permanentemente ou
              anonimizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Seus direitos (Art. 18, LGPD)
            </h2>
            <p>Você pode, a qualquer momento:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Confirmar a existência de tratamento de seus dados</li>
              <li>Acessar seus dados</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>
                Solicitar a anonimização, bloqueio ou eliminação de dados
                desnecessários
              </li>
              <li>
                Solicitar a portabilidade de seus dados a outro fornecedor de
                serviço
              </li>
              <li>Revogar o consentimento para dados sensíveis</li>
              <li>Solicitar a eliminação de seus dados pessoais</li>
            </ul>
            <p className="mt-2">
              <strong>Para exercer seus direitos:</strong> entre em contato em{" "}
              <a href="mailto:privacidade@mapi.app" className="text-mapi-primary underline">
                privacidade@mapi.app
              </a>
              . Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Segurança</h2>
            <p>Adotamos as seguintes medidas de segurança:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
              <li>Criptografia AES-256-GCM para dados sensíveis em repouso</li>
              <li>HTTPS obrigatório em toda a comunicação (TLS 1.3)</li>
              <li>Row Level Security (RLS) no banco de dados</li>
              <li>Multi-tenancy: cada professor acessa apenas seus dados</li>
              <li>Headers de segurança (X-Frame-Options, X-Content-Type-Options)</li>
              <li>Rate limiting em APIs sensíveis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Dados de crianças e adolescentes
            </h2>
            <p>
              O MAPI processa dados de alunos menores de idade. Para dados
              sensíveis de crianças e adolescentes, exigimos consentimento
              específico do responsável legal antes de registrar diagnósticos ou
              compartilhar informações com terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Alterações nesta política
            </h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações
              significativas serão comunicadas por e-mail e por aviso na
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contato</h2>
            <p>
              <strong>E-mail:</strong>{" "}
              <a href="mailto:privacidade@mapi.app" className="text-mapi-primary underline">
                privacidade@mapi.app
              </a>
            </p>
            <p>
              <strong>Suporte:</strong>{" "}
              <a href="mailto:suporte@mapi.app" className="text-mapi-primary underline">
                suporte@mapi.app
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
