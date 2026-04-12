"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClassSchema } from "@/lib/validation/schemas";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";

/**
 * Schema Zod para validação client-side no formulário
 */
const formSchema = createClassSchema;

/**
 * Formulário de criação/edição de turma dentro de um Sheet (painel lateral)
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {import('@/types').Class | null} [props.initialData]
 * @param {function} props.onSubmit - recebe dados validados, retorna Promise
 * @param {string} props.teacherId
 */
export function ClassForm({ open, onOpenChange, initialData, onSubmit, teacherId }) {
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  /** @type {import('react-hook-form').UseFormReturn} */
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      subject: initialData?.subject || "",
      year: initialData?.year || new Date().getFullYear().toString(),
      period: initialData?.period || "",
    },
  });

  /**
   * Submete o formulário
   * @param {Object} data
   */
  async function handleSubmit(data) {
    setLoading(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error("[ClassForm] Submit error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>
            {isEdit ? "Editar Turma" : "Nova Turma"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize os dados da turma"
              : "Preencha os dados para criar uma nova turma. Você pode adicionar alunos depois."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 mt-4">
          {/* Nome da turma */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Turma <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: 5º Ano A, Turma 3B..."
              {...form.register("name")}
              className={form.formState.errors.name ? "border-red-500" : ""}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Disciplina */}
          <div className="space-y-2">
            <Label htmlFor="subject">Disciplina</Label>
            <Input
              id="subject"
              placeholder="Ex: Matemática, Português..."
              {...form.register("subject")}
            />
            {form.formState.errors.subject && (
              <p className="text-xs text-red-500">
                {form.formState.errors.subject.message}
              </p>
            )}
          </div>

          {/* Ano e Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                placeholder="2026"
                {...form.register("year")}
              />
              {form.formState.errors.year && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.year.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <select
                id="period"
                {...form.register("period")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="pt-4 gap-2 flex-row">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-mapi-primary hover:bg-mapi-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  {isEdit ? "Atualizar" : "Criar Turma"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancelar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
