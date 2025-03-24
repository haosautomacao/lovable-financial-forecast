
import React, { useEffect, useRef } from 'react';
import { CalculationResults } from '@/utils/calculations';
import { exportToExcel } from '@/utils/exportUtils';
import { toast } from "sonner";

interface ResultsDisplayProps {
  results: CalculationResults | null;
  projectName: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, projectName }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current && results) {
      resultsRef.current.classList.add('animate-slide-up');
    }
  }, [results]);
  
  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };
  
  if (!results) {
    return (
      <div className="glass-card p-6 rounded-lg animate-pulse-subtle">
        <p className="text-muted-foreground text-center">Insira os dados do projeto e calcule para ver os resultados</p>
      </div>
    );
  }

  const handleExport = () => {
    try {
      exportToExcel(results, projectName || 'Projeto GD');
      toast.success("Relatório exportado com sucesso");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Erro ao exportar o relatório");
    }
  };
  
  // Determine if the project is viable
  const isViable = results.npv > 0 && results.irr > 0;
  
  // Calculate viability metrics
  const viabilityScore = Math.min(100, Math.max(0, 
    (results.npv > 0 ? 30 : 0) + 
    (results.irr > 15 ? 40 : results.irr > 10 ? 30 : results.irr > 5 ? 20 : 0) +
    (results.paybackYear < 5 ? 30 : results.paybackYear < 8 ? 20 : results.paybackYear < 12 ? 10 : 0)
  ));
  
  const getViabilityColor = () => {
    if (viabilityScore >= 70) return 'text-green-600';
    if (viabilityScore >= 40) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getViabilityText = () => {
    if (viabilityScore >= 70) return 'Excelente';
    if (viabilityScore >= 50) return 'Bom';
    if (viabilityScore >= 30) return 'Razoável';
    return 'Arriscado';
  };
  
  return (
    <div ref={resultsRef} className="space-y-6">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Resultados da Análise</h3>
          <button 
            onClick={handleExport}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Exportar para Excel
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Investimento Inicial</h4>
              <p className="text-2xl font-bold">{formatCurrency(results.initialInvestment)}</p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">VPL (Valor Presente Líquido)</h4>
              <p className={`text-2xl font-bold ${results.npv > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(results.npv)}
              </p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">TIR (Taxa Interna de Retorno)</h4>
              <p className={`text-2xl font-bold ${results.irr > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatPercent(results.irr)}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Payback</h4>
              <p className="text-2xl font-bold">
                {results.paybackYear < results.yearlyResults.length 
                  ? `${results.paybackYear} anos` 
                  : 'Além do período analisado'}
              </p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">ROI (Retorno sobre Investimento)</h4>
              <p className={`text-2xl font-bold ${results.roi > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatPercent(results.roi)}
              </p>
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Viabilidade do Projeto</h4>
              <p className={`text-2xl font-bold ${getViabilityColor()}`}>
                {getViabilityText()}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    viabilityScore >= 70 ? 'bg-green-600' : 
                    viabilityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${viabilityScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card overflow-hidden rounded-lg">
        <div className="p-4 bg-secondary/30">
          <h3 className="font-medium">Resumo do Fluxo de Caixa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium">Ano</th>
                <th className="px-4 py-3 text-right font-medium">Geração (MWh)</th>
                <th className="px-4 py-3 text-right font-medium">Receita</th>
                <th className="px-4 py-3 text-right font-medium">Custos</th>
                <th className="px-4 py-3 text-right font-medium">Fluxo Livre</th>
                <th className="px-4 py-3 text-right font-medium">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {results.yearlyResults.slice(0, 10).map((year) => {
                const totalCosts = year.omCost + year.insuranceCost + year.admCost + 
                                 year.rentCost + year.icmsTax + year.pisCofinsTax + year.inverterCost;
                return (
                  <tr key={year.year} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">Ano {year.year}</td>
                    <td className="px-4 py-3 text-right">{year.generation.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(year.revenue)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(totalCosts)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(year.freeCashFlow)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(year.accumulatedCashFlow)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {results.yearlyResults.length > 10 && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            Mostrando os primeiros 10 anos. Exporte para Excel para ver todos os dados.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
