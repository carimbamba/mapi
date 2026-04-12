import { cn } from "@/lib/utils";

/**
 * Header padrão de página com título e descrição
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.className]
 */
export function PageHeader({ title, description, children, className }) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
