"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getGuide } from "@/lib/accessibility/condition-guides";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle2, XCircle, Phone, ArrowUpCircle, MapPin } from "lucide-react";

/**
 * Guia de manejo completo para uma condição
 *
 * Layout acordeão com seções práticas.
 * Disclaimer proeminente em card amarelo.
 *
 * @param {Object} props
 * @param {string} props.conditionType
 */
export function ManagementGuide({ conditionType }) {
  const [openItems, setOpenItems] = useState(["posicionamento"]);
  const guide = getGuide(conditionType);

  if (!guide) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground text-sm">
          Guia de manejo não disponível para esta condição.
        </CardContent>
      </Card>
    );
  }

  /**
   * Imprimir guia
   */
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{guide.name}</CardTitle>
          <CardDescription>{guide.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="no-print">
              <MapPin className="w-4 h-4 mr-1.5" />
              Imprimir Guia
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer — visível SEM precisar rolar */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-900">Aviso Importante</p>
            <p className="text-xs text-amber-700 mt-0.5">{guide.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Acordeão de seções */}
      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="space-y-2"
      >
        {/* Posicionamento */}
        <AccordionItem value="posicionamento" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-mapi-primary" />
              Posicionamento Ideal em Sala
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {guide.seatingRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-mapi-primary mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* O que fazer */}
        <AccordionItem value="do" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              O Que Fazer em Sala
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {guide.doList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* O que evitar */}
        <AccordionItem value="dont" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              O Que Evitar (Erros Comuns)
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {guide.dontList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Protocolo de crise */}
        <AccordionItem value="crisis" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-mapi-warning" />
              Protocolo de Crise
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {guide.crisisProtocol.map((step, i) => (
                <div
                  key={i}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <p className="text-sm text-red-900">{step}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Comunicação com família */}
        <AccordionItem value="communication" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-mapi-primary" />
              Comunicação com a Família
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {guide.communicationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-mapi-primary mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
