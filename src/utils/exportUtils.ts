
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CalculationResults, YearResult } from './calculations';

// Function to export results to Excel
export const exportToExcel = (data: CalculationResults, projectName: string = 'Projeto GD') => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Format yearly results for the cash flow sheet
  const cashFlowData = data.yearlyResults.map(year => ({
    'Ano': year.year,
    'Geração (MWh)': year.generation.toFixed(2),
    'Receita (R$)': year.revenue.toFixed(2),
    'Custo O&M (R$)': year.omCost.toFixed(2),
    'Seguro (R$)': year.insuranceCost.toFixed(2),
    'Administrativo (R$)': year.admCost.toFixed(2),
    'Aluguel (R$)': year.rentCost.toFixed(2),
    'Inversores (R$)': year.inverterCost.toFixed(2),
    'ICMS (R$)': year.icmsTax.toFixed(2),
    'PIS/COFINS (R$)': year.pisCofinsTax.toFixed(2),
    'Depreciação (R$)': year.depreciation.toFixed(2),
    'Benefício Fiscal (R$)': year.taxBenefit.toFixed(2),
    'Fluxo de Caixa Livre (R$)': year.freeCashFlow.toFixed(2),
    'Fluxo Descontado (R$)': year.discountedCashFlow.toFixed(2),
    'Fluxo Acumulado (R$)': year.accumulatedCashFlow.toFixed(2),
  }));
  
  // Create the cash flow worksheet
  const cashFlowWs = XLSX.utils.json_to_sheet(cashFlowData);
  XLSX.utils.book_append_sheet(wb, cashFlowWs, 'Fluxo de Caixa');
  
  // Create summary worksheet
  const summaryData = [
    { 'Indicador': 'Investimento Inicial (R$)', 'Valor': data.initialInvestment.toFixed(2) },
    { 'Indicador': 'VPL - Valor Presente Líquido (R$)', 'Valor': data.npv.toFixed(2) },
    { 'Indicador': 'TIR - Taxa Interna de Retorno (%)', 'Valor': data.irr.toFixed(2) + '%' },
    { 'Indicador': 'Payback (anos)', 'Valor': data.paybackYear },
    { 'Indicador': 'ROI (%)', 'Valor': data.roi.toFixed(2) + '%' },
  ];
  
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, `${projectName}_Análise_Financeira.xlsx`);
};

// Function to generate chart data for visualization
export const generateChartData = (yearlyResults: YearResult[]) => {
  // Cash flow chart data (revenue vs costs)
  const cashFlowChartData = yearlyResults.map(year => ({
    year: year.year,
    revenue: year.revenue,
    costs: year.omCost + year.insuranceCost + year.admCost + 
           year.rentCost + year.icmsTax + year.pisCofinsTax + year.inverterCost
  }));
  
  // Accumulated return chart data
  const accumulatedChartData = yearlyResults.map(year => ({
    year: year.year,
    accumulated: year.accumulatedCashFlow
  }));
  
  // Generation chart data
  const generationChartData = yearlyResults.map(year => ({
    year: year.year,
    generation: year.generation
  }));
  
  // Return on investment by year
  const roiChartData = yearlyResults.map(year => ({
    year: year.year,
    roi: year.freeCashFlow / (year.year === 1 ? 1 : 0) // Avoid division by zero for first year
  }));
  
  return {
    cashFlowChartData,
    accumulatedChartData,
    generationChartData,
    roiChartData
  };
};
