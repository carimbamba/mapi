"use client";

import { cn } from "@/lib/utils";

/**
 * Seletor visual de layout de sala
 *
 * 3 opções ilustradas: Fileiras, Grupos, Formato U
 * Com configurações de linhas/colunas.
 *
 * @param {Object} props
 * @param {string} props.value — 'rows'|'groups'|'u_shape'
 * @param {function} props.onChange
 * @param {number} [props.rows=5]
 * @param {function} [props.onRowsChange]
 * @param {number} [props.cols=6]
 * @param {function} [props.onColsChange]
 */
export function LayoutSelector({
  value,
  onChange,
  rows = 5,
  onRowsChange,
  cols = 6,
  onColsChange,
}) {
  const layouts = [
    {
      value: "rows",
      label: "Fileiras",
      description: "Ideal para aulas expositivas",
      render: () => (
        <svg viewBox="0 0 80 60" className="w-full h-16">
          {/* Quadro */}
          <rect x="5" y="2" width="70" height="4" rx="1" fill="#4A7C9E" opacity="0.6" />
          {/* Fileiras */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={10 + col * 12}
                y={12 + row * 12}
                width="8"
                height="6"
                rx="1"
                fill={value === "rows" ? "#4A7C9E" : "#CBD5E1"}
                opacity={value === "rows" ? 0.8 : 0.5}
              />
            ))
          )}
        </svg>
      ),
    },
    {
      value: "groups",
      label: "Grupos",
      description: "Trabalhos em equipe",
      render: () => (
        <svg viewBox="0 0 80 60" className="w-full h-16">
          <rect x="5" y="2" width="70" height="4" rx="1" fill="#4A7C9E" opacity="0.6" />
          {/* Grupo 1 */}
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`g1-${row}-${col}`}
                x={8 + col * 10}
                y={12 + row * 10}
                width="7"
                height="5"
                rx="1"
                fill={value === "groups" ? "#4A7C9E" : "#CBD5E1"}
                opacity={value === "groups" ? 0.8 : 0.5}
              />
            ))
          )}
          {/* Grupo 2 */}
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`g2-${row}-${col}`}
                x={36 + col * 10}
                y={12 + row * 10}
                width="7"
                height="5"
                rx="1"
                fill={value === "groups" ? "#4A7C9E" : "#CBD5E1"}
                opacity={value === "groups" ? 0.8 : 0.5}
              />
            ))
          )}
          {/* Grupo 3 */}
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`g3-${row}-${col}`}
                x={16 + col * 10}
                y={38 + row * 10}
                width="7"
                height="5"
                rx="1"
                fill={value === "groups" ? "#4A7C9E" : "#CBD5E1"}
                opacity={value === "groups" ? 0.8 : 0.5}
              />
            ))
          )}
          {/* Grupo 4 */}
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`g4-${row}-${col}`}
                x={44 + col * 10}
                y={38 + row * 10}
                width="7"
                height="5"
                rx="1"
                fill={value === "groups" ? "#4A7C9E" : "#CBD5E1"}
                opacity={value === "groups" ? 0.8 : 0.5}
              />
            ))
          )}
        </svg>
      ),
    },
    {
      value: "u_shape",
      label: "U",
      description: "Debates e discussões",
      render: () => (
        <svg viewBox="0 0 80 60" className="w-full h-16">
          <rect x="5" y="2" width="70" height="4" rx="1" fill="#4A7C9E" opacity="0.6" />
          {/* Topo */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={`t${i}`}
              x={10 + i * 12}
              y="12"
              width="8"
              height="5"
              rx="1"
              fill={value === "u_shape" ? "#4A7C9E" : "#CBD5E1"}
              opacity={value === "u_shape" ? 0.8 : 0.5}
            />
          ))}
          {/* Lateral direita */}
          {[0, 1, 2].map((i) => (
            <rect
              key={`r${i}`}
              x="58"
              y={22 + i * 10}
              width="8"
              height="5"
              rx="1"
              fill={value === "u_shape" ? "#4A7C9E" : "#CBD5E1"}
              opacity={value === "u_shape" ? 0.8 : 0.5}
            />
          ))}
          {/* Fundo */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`b${i}`}
              x={16 + i * 12}
              y="46"
              width="8"
              height="5"
              rx="1"
              fill={value === "u_shape" ? "#4A7C9E" : "#CBD5E1"}
              opacity={value === "u_shape" ? 0.8 : 0.5}
            />
          ))}
          {/* Lateral esquerda */}
          {[0, 1, 2].map((i) => (
            <rect
              key={`l${i}`}
              x="10"
              y={22 + i * 10}
              width="8"
              height="5"
              rx="1"
              fill={value === "u_shape" ? "#4A7C9E" : "#CBD5E1"}
              opacity={value === "u_shape" ? 0.8 : 0.5}
            />
          ))}
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Opções visuais */}
      <div className="grid grid-cols-3 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.value}
            onClick={() => onChange(layout.value)}
            className={cn(
              "flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-150",
              value === layout.value
                ? "border-mapi-primary bg-mapi-primary/5 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            {layout.render()}
            <span
              className={cn(
                "text-sm font-semibold mt-2",
                value === layout.value ? "text-mapi-primary" : "text-foreground"
              )}
            >
              {layout.label}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {layout.description}
            </span>
          </button>
        ))}
      </div>

      {/* Configurações de grid */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Fileiras
          </label>
          <input
            type="number"
            min={2}
            max={10}
            value={rows}
            onChange={(e) => onRowsChange?.(parseInt(e.target.value) || 5)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Colunas
          </label>
          <input
            type="number"
            min={2}
            max={10}
            value={cols}
            onChange={(e) => onColsChange?.(parseInt(e.target.value) || 6)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
