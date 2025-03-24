
import React, { useState, useEffect } from 'react';
import CalculatorForm from '@/components/CalculatorForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import Charts from '@/components/Charts';
import { CalculationResults } from '@/utils/calculations';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [projectName, setProjectName] = useState<string>('Novo Projeto GD');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      
      // Animate elements when they enter the viewport
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementPosition < windowHeight - 100) {
          element.classList.add('is-visible');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle calculation results
  const handleCalculationResults = (results: CalculationResults) => {
    setCalculationResults(results);
    
    // Smooth scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  return (
    <div className="min-h-screen">
      {/* Header Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Análise Financeira GD</h1>
          
          <nav className="flex items-center space-x-4">
            <a 
              href="#calculator-section" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Calculadora
            </a>
            <a 
              href="#results-section" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Resultados
            </a>
            <a 
              href="#charts-section" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Gráficos
            </a>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center animate-slide-down">
          <h1 className="text-4xl font-bold mb-4">Calculadora de Retorno Financeiro</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simule o retorno financeiro de investimentos em geração distribuída 
            com cálculos precisos de TIR, VPL e payback.
          </p>
        </div>
      </section>
      
      {/* Calculator Section */}
      <section id="calculator-section" className="py-12 px-4 animate-on-scroll">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold mb-6">Dados do Projeto</h2>
          <CalculatorForm 
            onCalculate={handleCalculationResults}
            onProjectNameChange={setProjectName}
          />
        </div>
      </section>
      
      {calculationResults && (
        <>
          {/* Results Section */}
          <section id="results-section" className="py-12 px-4 bg-secondary/30 animate-on-scroll">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold mb-6">Análise de Resultados</h2>
              <ResultsDisplay 
                results={calculationResults}
                projectName={projectName}
              />
            </div>
          </section>
          
          {/* Charts Section */}
          <section id="charts-section" className="py-12 px-4 animate-on-scroll">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold mb-6">Visualização Gráfica</h2>
              <Charts 
                yearlyResults={calculationResults.yearlyResults}
                initialInvestment={calculationResults.initialInvestment}
              />
            </div>
          </section>
        </>
      )}
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-secondary/50 mt-12">
        <div className="container mx-auto max-w-4xl">
          <Separator className="mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Calculadora de Análise Financeira para Geração Distribuída
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              &copy; {new Date().getFullYear()} - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
