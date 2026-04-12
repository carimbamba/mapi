"use client";

import { useState } from "react";
import { createClass } from "@/lib/actions/class-actions";
import { Button } from "@/components/ui/button";
import { ClassForm } from "@/components/forms/ClassForm";
import { Plus } from "lucide-react";

/**
 * Botão + formulário de criação de turma (client-side)
 * @param {Object} props
 * @param {string} props.teacherId
 */
export function ClientClassFormTrigger({ teacherId }) {
  const [open, setOpen] = useState(false);

  /**
   * @param {Object} data
   */
  async function handleSubmit(data) {
    const result = await createClass(data, teacherId);
    if (result.error) {
      alert(result.error);
      return;
    }
    // Recarrega a página para mostrar a nova turma
    window.location.reload();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-mapi-primary hover:bg-mapi-primary/90 shrink-0"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        <span className="hidden sm:inline">Nova Turma</span>
      </Button>

      <ClassForm
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        teacherId={teacherId}
      />
    </>
  );
}
