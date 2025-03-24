
import React, { useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YearResult } from '@/utils/calculations';

interface ChartsProps {
  yearlyResults: YearResult[];
  initialInvestment: number;
}

const Charts: React.FC<ChartsProps> = ({ yearlyResults, initialInvestment }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.classList.add('animate-fade-in');
    }
  }, [yearlyResults]);

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  // Format energy values
  const formatEnergy = (value: number) => `${value.toFixed(2)} MWh`;
  
  if (!yearlyResults.length) {
    return (
      <div className="h-80 flex items-center justify-center bg-secondary/50 rounded-lg animate-pulse-subtle">
        <p className="text-muted-foreground">Insira os dados do projeto para visualizar os gráficos</p>
      </div>
    );
  }

  // Prepare data for charts
  const cashFlowData = yearlyResults.map(year => ({
    year: `Ano ${year.year}`,
    receita: year.revenue,
    custos: year.omCost + year.insuranceCost + year.admCost + 
            year.rentCost + year.icmsTax + year.pisCofinsTax + year.inverterCost,
    fluxo: year.freeCashFlow
  }));
  
  const accumulatedReturnData = yearlyResults.map(year => ({
    year: `Ano ${year.year}`,
    acumulado: year.accumulatedCashFlow,
    investimento: initialInvestment
  }));
  
  const generationData = yearlyResults.map(year => ({
    year: `Ano ${year.year}`,
    geracao: year.generation
  }));
  
  return (
    <div ref={chartRef} className="space-y-8">
      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Fluxo de Caixa Anual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #eee' }}
            />
            <Legend />
            <Bar dataKey="receita" name="Receita" fill="rgba(34, 197, 94, 0.7)" animationDuration={1500} />
            <Bar dataKey="custos" name="Custos" fill="rgba(239, 68, 68, 0.7)" animationDuration={1500} />
            <Bar dataKey="fluxo" name="Fluxo Livre" fill="rgba(59, 130, 246, 0.85)" animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Retorno Acumulado vs. Investimento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={accumulatedReturnData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #eee' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="acumulado" 
              name="Retorno Acumulado"
              stroke="rgba(59, 130, 246, 0.85)" 
              strokeWidth={3}
              activeDot={{ r: 8 }} 
              animationDuration={2000}
            />
            <Line 
              type="monotone" 
              dataKey="investimento" 
              name="Investimento Inicial"
              stroke="rgba(239, 68, 68, 0.7)" 
              strokeWidth={2}
              strokeDasharray="5 5" 
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Degradação da Geração Anual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => value.toFixed(1)} />
            <Tooltip 
              formatter={(value: number) => [formatEnergy(value), 'Geração']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #eee' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="geracao" 
              name="Geração (MWh)"
              stroke="rgba(234, 179, 8, 0.85)" 
              strokeWidth={3}
              activeDot={{ r: 8 }} 
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
