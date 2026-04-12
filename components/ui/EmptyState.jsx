import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * EmptyState — Componente reutilizável para estados vazios
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon — Ícone (ex: <Users className="w-12 h-12" />)
 * @param {string} props.title — Título do estado vazio
 * @param {string} props.description — Descrição explicativa
 * @param {React.ReactNode} [props.action] — Botão de ação (CTA)
 * @param {string} [props.className] — Classes adicionais
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <Card className={className}>
      <CardContent className="text-center py-16">
        <div className="text-muted-foreground/40 mb-4 flex justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
}

/**
 * EmptyState inline — Versão compacta para dentro de listas/tabelas
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} [props.description]
 */
export function EmptyStateInline({ icon, title, description }) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground/40 mb-3 flex justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
