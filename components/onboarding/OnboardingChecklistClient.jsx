"use client";

import { useState, useEffect } from "react";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { completeOnboardingStep } from "@/lib/actions/onboarding-actions";
import { useRouter } from "next/navigation";

/**
 * Client wrapper para a Checklist de Onboarding
 *
 * @param {Object} props
 * @param {string} props.teacherId
 * @param {number[]} props.completedSteps
 * @param {number} props.percentage
 * @param {boolean} props.allCompleted
 */
export function OnboardingChecklistClient({
  teacherId,
  completedSteps = [],
  percentage = 0,
  allCompleted = false,
}) {
  const router = useRouter();
  const [localCompleted, setLocalCompleted] = useState(completedSteps);
  const [localPercentage, setLocalPercentage] = useState(percentage);
  const [localAllCompleted, setLocalAllCompleted] = useState(allCompleted);
  const [dismissed, setDismissed] = useState(allCompleted);

  // Sincroniza se props mudarem
  useEffect(() => {
    setLocalCompleted(completedSteps);
    setLocalPercentage(percentage);
    setLocalAllCompleted(allCompleted);
    setDismissed(allCompleted);
  }, [completedSteps, percentage, allCompleted]);

  /**
   * Completa um passo e navega para a ação correspondente
   * @param {number} stepId
   */
  async function handleCompleteStep(stepId) {
    // Marca como completo no banco
    const result = await completeOnboardingStep(teacherId, stepId);

    if (result.data) {
      setLocalCompleted(result.data.completedSteps);
      setLocalPercentage(result.data.percentage);
      setLocalAllCompleted(result.data.allCompleted);
    }

    // Navega para a ação correspondente
    switch (stepId) {
      case 1:
        router.push("/dashboard/classes/new");
        break;
      case 2:
        router.push("/dashboard/classes");
        break;
      case 3:
        router.push("/dashboard/classes");
        break;
      case 4:
        router.push("/dashboard/classes");
        break;
      case 5:
        router.push("/dashboard/classes");
        break;
    }
  }

  /**
   * Executa ação do checklist
   * @param {string} action
   */
  function handleAction(action) {
    switch (action) {
      case "createClass":
        router.push("/dashboard/classes/new");
        break;
      case "addStudents":
        router.push("/dashboard/classes");
        break;
      case "generateMap":
        router.push("/dashboard/classes");
        break;
      case "markAccessibility":
        router.push("/dashboard/classes");
        break;
      case "viewGuide":
        router.push("/dashboard/classes");
        break;
    }
  }

  /**
   * Dismiss checklist
   */
  function handleDismiss() {
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <OnboardingChecklist
      completedSteps={localCompleted}
      percentage={localPercentage}
      allCompleted={localAllCompleted}
      onCompleteStep={handleCompleteStep}
      onDismiss={handleDismiss}
      onAction={handleAction}
    />
  );
}
