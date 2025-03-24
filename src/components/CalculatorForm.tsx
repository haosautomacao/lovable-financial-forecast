
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  SystemData, 
  CostsData, 
  TariffsData, 
  FinancialParams,
  calculateFinancialMetrics,
  CalculationResults
} from '@/utils/calculations';
import { distributors, states, getDistributorsByState } from '@/utils/distributors';
import { toast } from "sonner";

interface CalculatorFormProps {
  onCalculate: (results: CalculationResults) => void;
  onProjectNameChange: (name: string) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, onProjectNameChange }) => {
  // Project name
  const [projectName, setProjectName] = useState<string>('Novo Projeto GD');
  
  // System data
  const [systemData, setSystemData] = useState<SystemData>({
    powerDC: 100,
    annualGeneration: 150,
    contractedDemand: 80,
    loadDemand: 100,
    distributor: ''
  });

  // State for distributor selection
  const [selectedState, setSelectedState] = useState<string>('');
  const [stateDistributors, setStateDistributors] = useState<any[]>([]);
  
  // Update available distributors when state changes
  useEffect(() => {
    if (selectedState) {
      setStateDistributors(getDistributorsByState(selectedState));
    } else {
      setStateDistributors([]);
    }
  }, [selectedState]);
  
  // Costs data
  const [costsData, setCostsData] = useState<CostsData>({
    capexPerWp: 4.5,
    capexTotal: null,
    insurancePercent: 0.5,
    omPercent: 1.0,
    admPercent: 3.0,
    rent: 1000,
    inverterReplacementPercent: 15,
    inverterReplacementYear: 10
  });
  
  // Tariffs data
  const [tariffsData, setTariffsData] = useState<TariffsData>({
    energyTariff: 350,
    distributionTariff: 250,
    generationDistributionTariff: 10,
    consumptionDistributionTariff: 15,
    icmsPercent: 18,
    pisConfinsPercent: 9.25
  });
  
  // Financial parameters
  const [financialParams, setFinancialParams] = useState<FinancialParams>({
    discountRate: 10,
    adjustmentType: 'IPCA',
    adjustmentRate: 4.5,
    annualDegradation: 0.8,
    depreciationYears: 10,
    projectDuration: 25,
    defaultRate: 0
  });
  
  // State for input mode (per Wp or total CAPEX)
  const [capexInputMode, setCapexInputMode] = useState<'perWp' | 'total'>('perWp');
  
  // Handle calculating results
  const handleCalculate = () => {
    try {
      // Validation
      if (systemData.powerDC <= 0) {
        toast.error("Potência CC deve ser maior que zero");
        return;
      }
      
      if (systemData.annualGeneration <= 0) {
        toast.error("Geração anual deve ser maior que zero");
        return;
      }
      
      if (!systemData.distributor) {
        toast.error("Selecione uma distribuidora");
        return;
      }
      
      if (capexInputMode === 'perWp' && (!costsData.capexPerWp || costsData.capexPerWp <= 0)) {
        toast.error("CAPEX por Wp deve ser maior que zero");
        return;
      }
      
      if (capexInputMode === 'total' && (!costsData.capexTotal || costsData.capexTotal <= 0)) {
        toast.error("CAPEX total deve ser maior que zero");
        return;
      }
      
      if (financialParams.annualDegradation < 0 || financialParams.annualDegradation > 100) {
        toast.error("Taxa de degradação deve estar entre 0 e 100%");
        return;
      }
      
      // Calculate results
      const updatedCostsData = {
        ...costsData,
        // If using capexPerWp, set capexTotal to null, and vice versa
        capexPerWp: capexInputMode === 'perWp' ? costsData.capexPerWp : null,
        capexTotal: capexInputMode === 'total' ? costsData.capexTotal : null
      };
      
      const results = calculateFinancialMetrics(
        systemData,
        updatedCostsData,
        tariffsData,
        financialParams
      );
      
      // Call the onCalculate callback with the results
      onCalculate(results);
      
      // Show success message
      toast.success("Cálculos realizados com sucesso!");
    } catch (error) {
      console.error("Error calculating metrics:", error);
      toast.error("Erro ao calcular métricas financeiras");
    }
  };
  
  // Handle project name change
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProjectName(name);
    onProjectNameChange(name);
  };
  
  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="mb-6">
        <Label htmlFor="projectName">Nome do Projeto</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={handleProjectNameChange}
          className="mt-1"
        />
      </div>
      
      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="system">Dados do Sistema</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="tariffs">Tarifas e Tributos</TabsTrigger>
          <TabsTrigger value="financial">Parâmetros Financeiros</TabsTrigger>
        </TabsList>
        
        {/* System Data Tab */}
        <TabsContent value="system" className="space-y-4 animate-slide-up">
          <div>
            <Label htmlFor="powerDC">Potência CC (kWp)</Label>
            <Input
              id="powerDC"
              type="number"
              step="0.01"
              value={systemData.powerDC}
              onChange={e => setSystemData({...systemData, powerDC: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="annualGeneration">Geração Anual (MWh) - P90</Label>
            <Input
              id="annualGeneration"
              type="number"
              step="0.01"
              value={systemData.annualGeneration}
              onChange={e => setSystemData({...systemData, annualGeneration: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="contractedDemand">Demanda Contratada - Geração (kW)</Label>
            <Input
              id="contractedDemand"
              type="number"
              step="0.01"
              value={systemData.contractedDemand}
              onChange={e => setSystemData({...systemData, contractedDemand: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="loadDemand">Demanda Contratada - Carga (kW)</Label>
            <Input
              id="loadDemand"
              type="number"
              step="0.01"
              value={systemData.loadDemand}
              onChange={e => setSystemData({...systemData, loadDemand: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Select 
                value={selectedState}
                onValueChange={setSelectedState}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="distributor">Distribuidora</Label>
              <Select 
                value={systemData.distributor}
                onValueChange={(value) => setSystemData({...systemData, distributor: value})}
                disabled={!selectedState}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={selectedState ? "Selecione a distribuidora" : "Selecione o estado primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {stateDistributors.map(distributor => (
                    <SelectItem key={distributor.id} value={distributor.id}>
                      {distributor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedState && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione um estado primeiro para ver as distribuidoras disponíveis
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4 animate-slide-up">
          <div className="mb-4">
            <Label>Modo de entrada CAPEX</Label>
            <div className="flex mt-1 space-x-2">
              <button 
                onClick={() => setCapexInputMode('perWp')}
                className={`px-4 py-2 rounded-md flex-1 transition-colors ${
                  capexInputMode === 'perWp' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                Por Wp
              </button>
              <button 
                onClick={() => setCapexInputMode('total')}
                className={`px-4 py-2 rounded-md flex-1 transition-colors ${
                  capexInputMode === 'total' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                Total
              </button>
            </div>
          </div>
          
          {capexInputMode === 'perWp' ? (
            <div>
              <Label htmlFor="capexPerWp">CAPEX (R$/Wp)</Label>
              <Input
                id="capexPerWp"
                type="number"
                step="0.01"
                value={costsData.capexPerWp || ''}
                onChange={e => setCostsData({...costsData, capexPerWp: parseFloat(e.target.value) || 0})}
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="capexTotal">CAPEX Total (R$)</Label>
              <Input
                id="capexTotal"
                type="number"
                step="1000"
                value={costsData.capexTotal || ''}
                onChange={e => setCostsData({...costsData, capexTotal: parseFloat(e.target.value) || 0})}
                className="mt-1"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="insurancePercent">Seguros (%)</Label>
            <Input
              id="insurancePercent"
              type="number"
              step="0.01"
              value={costsData.insurancePercent}
              onChange={e => setCostsData({...costsData, insurancePercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="omPercent">O&M (%)</Label>
            <Input
              id="omPercent"
              type="number"
              step="0.01"
              value={costsData.omPercent}
              onChange={e => setCostsData({...costsData, omPercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="admPercent">Administração (%)</Label>
            <Input
              id="admPercent"
              type="number"
              step="0.01"
              value={costsData.admPercent}
              onChange={e => setCostsData({...costsData, admPercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="rent">Aluguel (R$/mês) - Ano 1</Label>
            <Input
              id="rent"
              type="number"
              step="100"
              value={costsData.rent}
              onChange={e => setCostsData({...costsData, rent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="inverterReplacementPercent">Troca de Inversores (%)</Label>
            <Input
              id="inverterReplacementPercent"
              type="number"
              step="0.01"
              value={costsData.inverterReplacementPercent}
              onChange={e => setCostsData({...costsData, inverterReplacementPercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="inverterReplacementYear">Ano da Troca de Inversores</Label>
            <Input
              id="inverterReplacementYear"
              type="number"
              min="1"
              max="25"
              value={costsData.inverterReplacementYear}
              onChange={e => setCostsData({...costsData, inverterReplacementYear: parseInt(e.target.value) || 10})}
              className="mt-1"
            />
          </div>
        </TabsContent>
        
        {/* Tariffs Tab */}
        <TabsContent value="tariffs" className="space-y-4 animate-slide-up">
          <div>
            <Label htmlFor="energyTariff">TE (R$/MWh)</Label>
            <Input
              id="energyTariff"
              type="number"
              step="0.01"
              value={tariffsData.energyTariff}
              onChange={e => setTariffsData({...tariffsData, energyTariff: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="distributionTariff">TUSD (R$/MWh)</Label>
            <Input
              id="distributionTariff"
              type="number"
              step="0.01"
              value={tariffsData.distributionTariff}
              onChange={e => setTariffsData({...tariffsData, distributionTariff: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="generationDistributionTariff">TUSDg (R$/kW)</Label>
            <Input
              id="generationDistributionTariff"
              type="number"
              step="0.01"
              value={tariffsData.generationDistributionTariff}
              onChange={e => setTariffsData({...tariffsData, generationDistributionTariff: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="consumptionDistributionTariff">TUSDc (R$/kW)</Label>
            <Input
              id="consumptionDistributionTariff"
              type="number"
              step="0.01"
              value={tariffsData.consumptionDistributionTariff}
              onChange={e => setTariffsData({...tariffsData, consumptionDistributionTariff: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="icmsPercent">ICMS (%)</Label>
            <Input
              id="icmsPercent"
              type="number"
              step="0.01"
              value={tariffsData.icmsPercent}
              onChange={e => setTariffsData({...tariffsData, icmsPercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="pisConfinsPercent">PIS/COFINS (%)</Label>
            <Input
              id="pisConfinsPercent"
              type="number"
              step="0.01"
              value={tariffsData.pisConfinsPercent}
              onChange={e => setTariffsData({...tariffsData, pisConfinsPercent: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
        </TabsContent>
        
        {/* Financial Parameters Tab */}
        <TabsContent value="financial" className="space-y-4 animate-slide-up">
          <div>
            <Label htmlFor="discountRate">Taxa de Desconto (%)</Label>
            <Input
              id="discountRate"
              type="number"
              step="0.01"
              value={financialParams.discountRate}
              onChange={e => setFinancialParams({...financialParams, discountRate: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Taxa usada para descontar fluxos de caixa futuros e para calcular o desconto para o cliente
            </p>
          </div>
          
          <div>
            <Label htmlFor="adjustmentType">Tipo de Reajuste</Label>
            <Select 
              value={financialParams.adjustmentType}
              onValueChange={(value: 'IPCA' | 'Energy') => 
                setFinancialParams({...financialParams, adjustmentType: value})
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo de reajuste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IPCA">IPCA</SelectItem>
                <SelectItem value="Energy">Energético</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="adjustmentRate">Taxa de Reajuste (%)</Label>
            <Input
              id="adjustmentRate"
              type="number"
              step="0.01"
              value={financialParams.adjustmentRate}
              onChange={e => setFinancialParams({...financialParams, adjustmentRate: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="annualDegradation">Degradação Anual (%)</Label>
            <Input
              id="annualDegradation"
              type="number"
              step="0.01"
              value={financialParams.annualDegradation}
              onChange={e => setFinancialParams({...financialParams, annualDegradation: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="depreciationYears">Anos de Depreciação</Label>
            <Input
              id="depreciationYears"
              type="number"
              min="1"
              max="25"
              value={financialParams.depreciationYears}
              onChange={e => setFinancialParams({...financialParams, depreciationYears: parseInt(e.target.value) || 10})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="projectDuration">Duração do Projeto (anos)</Label>
            <Input
              id="projectDuration"
              type="number"
              min="1"
              max="30"
              value={financialParams.projectDuration}
              onChange={e => setFinancialParams({...financialParams, projectDuration: parseInt(e.target.value) || 25})}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="defaultRate">Taxa de Inadimplência (%)</Label>
            <Input
              id="defaultRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={financialParams.defaultRate}
              onChange={e => setFinancialParams({...financialParams, defaultRate: parseFloat(e.target.value) || 0})}
              className="mt-1"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <button 
          onClick={handleCalculate}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Calcular Retorno Financeiro
        </button>
      </div>
    </div>
  );
};

export default CalculatorForm;
