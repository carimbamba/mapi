"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StudentForm } from "@/components/forms/StudentForm";
import { ImportCSVForm } from "@/components/forms/ImportCSVForm";
import { ConditionBadge } from "@/components/accessibility/ConditionBadge";
import { getStudents, createStudent, deleteStudent } from "@/lib/actions/student-actions";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Users,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Página de Gestão de Alunos
 *
 * - Tabela com busca, filtro e ações
 * - Formulário em Sheet lateral
 * - Importação CSV em Dialog com 3 passos
 * - Optimistic updates
 */
export default function StudentsPage({ params }) {
  const classId = params.classId;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [needsFilter, setNeedsFilter] = useState("all");
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [csvFormOpen, setCsvFormOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  async function fetchStudents() {
    // TODO: obter teacherId do contexto
    const fakeTeacherId = "temp";
    setTeacherId(fakeTeacherId);
    setLoading(true);
    try {
      const result = await getStudents(classId, fakeTeacherId);
      if (result.data) {
        setStudents(result.data);
      }
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Alunos filtrados
   */
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesNeeds =
      needsFilter === "all" ||
      (needsFilter === "needs" && s.hasAccessibilityNeeds) ||
      (needsFilter === "none" && !s.hasAccessibilityNeeds);
    return matchesSearch && matchesNeeds;
  });

  /**
   * Salvar aluno (criar ou editar) com optimistic update
   */
  async function handleSaveStudent(data) {
    const prevStudents = [...students];

    if (editingStudent) {
      // Optimistic update
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...data } : s))
      );
    } else {
      // Optimistic create
      const tempId = `temp-${Date.now()}`;
      setStudents((prev) => [
        ...prev,
        { ...data, id: tempId, classId, createdAt: new Date().toISOString() },
      ]);
    }

    try {
      if (editingStudent) {
        // TODO: chamar updateStudent
      } else {
        // TODO: chamar createStudent com teacherId
      }
      setStudentFormOpen(false);
      setEditingStudent(null);
    } catch (err) {
      setStudents(prevStudents); // Rollback
      console.error("Erro ao salvar aluno:", err);
    }
  }

  /**
   * Deletar aluno com optimistic update
   */
  async function handleDelete(studentId) {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

    const prevStudents = [...students];
    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    try {
      // TODO: chamar deleteStudent
    } catch (err) {
      setStudents(prevStudents); // Rollback
      console.error("Erro ao excluir aluno:", err);
    }
  }

  /**
   * Importação CSV com optimistic update
   */
  async function handleImport(csvData) {
    const prevStudents = [...students];
    // TODO: chamar importStudentsFromCSV
    fetchStudents();
  }

  // Contagens
  const needsCount = students.filter((s) => s.hasAccessibilityNeeds).length;

  return (
    <div className="min-h-screen bg-mapi-background">
      <TopBar
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCsvFormOpen(true)}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Importar CSV</span>
            </Button>
            <Button
              size="sm"
              className="bg-mapi-primary hover:bg-mapi-primary/90"
              onClick={() => {
                setEditingStudent(null);
                setStudentFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Adicionar Aluno</span>
            </Button>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Alunos
          </h1>
          <p className="text-muted-foreground mt-1">
            {students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado
            {students.length !== 1 ? "s" : ""}
            {needsCount > 0 && (
              <span className="text-mapi-warning ml-2">
                • {needsCount} com necessidades específicas
              </span>
            )}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtro */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={needsFilter} onValueChange={setNeedsFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alunos</SelectItem>
                <SelectItem value="needs">Com necessidades</SelectItem>
                <SelectItem value="none">Sem necessidades</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            Carregando alunos...
          </div>
        ) : filteredStudents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border">
            <div className="w-16 h-16 bg-mapi-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-mapi-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {students.length === 0
                ? "Nenhum aluno cadastrado"
                : "Nenhum aluno encontrado"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              {students.length === 0
                ? "Adicione alunos manualmente ou importe de um arquivo CSV para começar."
                : "Tente ajustar os filtros de busca."}
            </p>
            {students.length === 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Aluno
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCsvFormOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Importar CSV
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Nome
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Necessidades
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Diagnóstico
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                      Assento Prioritário
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {student.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.hasAccessibilityNeeds ? (
                          <ConditionBadge
                            diagnosisType={student.diagnosisType}
                            size="sm"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.diagnosisType ? (
                          <ConditionBadge
                            diagnosisType={student.diagnosisType}
                            showLabel={false}
                            size="md"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.prioritySeating ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                          >
                            Sim
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingStudent(student);
                              setStudentFormOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem disabled>
                                Observações:{" "}
                                {student.diagnosisNotes || "Nenhuma"}
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                Consentimento LGPD:{" "}
                                {student.parentConsent ? "Sim" : "Não"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(student.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {student.hasAccessibilityNeeds && (
                        <ConditionBadge
                          diagnosisType={student.diagnosisType}
                          size="sm"
                        />
                      )}
                      {student.prioritySeating && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                        >
                          Assento prioritário
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingStudent(student);
                        setStudentFormOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Formulário de aluno */}
      <StudentForm
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        initialData={editingStudent}
        classId={classId}
        allStudents={students.filter((s) => s.id !== editingStudent?.id)}
        onSubmit={handleSaveStudent}
      />

      {/* Importação CSV */}
      <ImportCSVForm
        open={csvFormOpen}
        onOpenChange={setCsvFormOpen}
        classId={classId}
        onImport={handleImport}
      />
    </div>
  );
}
