/**
 * Financial calculations for distributed generation investment analysis
 */

// Types for calculation inputs
export interface SystemData {
  powerDC: number;               // kWp
  annualGeneration: number;      // MWh
  contractedDemand: number;      // kW (generation)
  loadDemand: number;            // kW (load)
  distributor: string;           // Power utility company
}

export interface CostsData {
  capexPerWp: number | null;     // R$/Wp
  capexTotal: number | null;     // R$
  insurancePercent: number;      // %
  omPercent: number;             // % O&M
  admPercent: number;            // % Administration
  rent: number;                  // R$/month (Year 1)
  inverterReplacementPercent: number; // %
  inverterReplacementYear: number;    // Year
}

export interface TariffsData {
  energyTariff: number;          // TE (R$/MWh)
  distributionTariff: number;    // TUSD (R$/MWh)
  generationDistributionTariff: number; // TUSDg (R$/kW)
  consumptionDistributionTariff: number; // TUSDc (R$/kW)
  icmsPercent: number;           // %
  pisConfinsPercent: number;     // %
}

export interface FinancialParams {
  discountRate: number;          // %
  adjustmentType: 'IPCA' | 'Energy'; // Reajuste
  adjustmentRate: number;        // %
  annualDegradation: number;     // %
  depreciationYears: number;     // Years
  projectDuration: number;       // Years
  defaultRate: number;           // %
}

export interface YearResult {
  year: number;
  generation: number;            // MWh
  revenue: number;               // R$
  omCost: number;                // R$
  insuranceCost: number;         // R$
  admCost: number;               // R$
  rentCost: number;              // R$
  inverterCost: number;          // R$
  icmsTax: number;               // R$
  pisCofinsTax: number;          // R$
  depreciation: number;          // R$
  taxBenefit: number;            // R$
  freeCashFlow: number;          // R$
  discountedCashFlow: number;    // R$
  accumulatedCashFlow: number;   // R$
}

export interface CalculationResults {
  yearlyResults: YearResult[];
  npv: number;                   // VPL (R$)
  irr: number;                   // TIR (%)
  paybackYear: number;           // Years
  roi: number;                   // %
  initialInvestment: number;     // R$
}

// Helper function to calculate IRR
function calculateIRR(cashFlows: number[]): number {
  // Simple implementation using iterative approach
  let guess = 0.1; // Initial guess at 10%
  const maxIterations = 1000;
  const tolerance = 0.00001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = cashFlows[0]; // Initial investment (negative)
    let npvDerivative = 0;
    
    for (let t = 1; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + guess, t);
      npv += cashFlows[t] / discountFactor;
      npvDerivative -= t * cashFlows[t] / Math.pow(discountFactor, 2);
    }
    
    // Use Newton-Raphson method to improve guess
    const newGuess = guess - npv / npvDerivative;
    
    // Check for convergence
    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100; // Convert to percentage
    }
    
    guess = newGuess;
  }
  
  // If no convergence after max iterations
  return guess * 100;
}

// Main calculation function
export function calculateFinancialMetrics(
  systemData: SystemData,
  costsData: CostsData,
  tariffsData: TariffsData,
  financialParams: FinancialParams
): CalculationResults {
  const yearlyResults: YearResult[] = [];
  const cashFlows: number[] = [];
  let accumulatedCashFlow = 0;
  let paybackYear = financialParams.projectDuration;
  let paybackFound = false;
  
  // Calculate initial investment
  const initialInvestment = costsData.capexTotal || 
    (costsData.capexPerWp ? costsData.capexPerWp * systemData.powerDC * 1000 : 0);
  
  // Add initial investment as first cash flow (negative)
  cashFlows.push(-initialInvestment);
  
  // Calculate yearly depreciation
  const yearlyDepreciation = initialInvestment / financialParams.depreciationYears;
  
  // Calculate results for each year
  for (let year = 1; year <= financialParams.projectDuration; year++) {
    // Apply annual degradation to generation
    const generation = systemData.annualGeneration * Math.pow(1 - financialParams.annualDegradation / 100, year - 1);
    
    // Calculate annual adjustment factor based on selected type
    const adjustmentFactor = Math.pow(1 + financialParams.adjustmentRate / 100, year - 1);
    
    // Calculate revenue
    const energyRevenue = generation * (tariffsData.energyTariff + tariffsData.distributionTariff) * adjustmentFactor;
    const demandRevenue = (systemData.contractedDemand + systemData.loadDemand) * 
      (tariffsData.generationDistributionTariff + tariffsData.consumptionDistributionTariff) * 12 * adjustmentFactor;
    
    const grossRevenue = (energyRevenue + demandRevenue) * 
      (1 - financialParams.discountRate / 100) * 
      (1 - financialParams.defaultRate / 100);
    
    // Calculate costs
    const omCost = initialInvestment * (costsData.omPercent / 100) * adjustmentFactor;
    const insuranceCost = initialInvestment * (costsData.insurancePercent / 100) * adjustmentFactor;
    const admCost = grossRevenue * (costsData.admPercent / 100);
    const rentCost = costsData.rent * 12 * adjustmentFactor; // Annual rent
    
    // Inverter replacement cost (only in specified year)
    const inverterCost = year === costsData.inverterReplacementYear ? 
      initialInvestment * (costsData.inverterReplacementPercent / 100) : 0;
    
    // Calculate taxes
    const icmsTax = grossRevenue * (tariffsData.icmsPercent / 100);
    const pisCofinsTax = grossRevenue * (tariffsData.pisConfinsPercent / 100);
    
    // Calculate depreciation and tax benefit
    // Assuming a 34% tax rate (IRPJ + CSLL)
    const depreciation = year <= financialParams.depreciationYears ? yearlyDepreciation : 0;
    const taxBenefit = depreciation * 0.34; // 34% tax saving
    
    // Calculate free cash flow
    const freeCashFlow = grossRevenue - omCost - insuranceCost - admCost - 
      rentCost - icmsTax - pisCofinsTax + taxBenefit - inverterCost;
    
    // Calculate discounted cash flow
    const discountedCashFlow = freeCashFlow / Math.pow(1 + financialParams.discountRate / 100, year);
    
    // Update accumulated cash flow
    accumulatedCashFlow += freeCashFlow;
    
    // Determine payback period
    if (!paybackFound && accumulatedCashFlow >= initialInvestment) {
      paybackYear = year;
      paybackFound = true;
    }
    
    // Store results for this year
    yearlyResults.push({
      year,
      generation,
      revenue: grossRevenue,
      omCost,
      insuranceCost,
      admCost,
      rentCost,
      inverterCost,
      icmsTax,
      pisCofinsTax,
      depreciation,
      taxBenefit,
      freeCashFlow,
      discountedCashFlow,
      accumulatedCashFlow
    });
    
    // Add to cash flows array for IRR calculation
    cashFlows.push(freeCashFlow);
  }
  
  // Calculate NPV
  const npv = cashFlows[0] + yearlyResults.reduce((sum, year) => sum + year.discountedCashFlow, 0);
  
  // Calculate IRR
  const irr = calculateIRR(cashFlows);
  
  // Calculate ROI
  const totalRevenue = yearlyResults.reduce((sum, year) => sum + year.revenue, 0);
  const totalCosts = initialInvestment + 
    yearlyResults.reduce((sum, year) => sum + year.omCost + year.insuranceCost + 
    year.admCost + year.rentCost + year.inverterCost + year.icmsTax + year.pisCofinsTax, 0);
  const roi = ((totalRevenue - totalCosts) / initialInvestment) * 100;
  
  return {
    yearlyResults,
    npv,
    irr,
    paybackYear,
    roi,
    initialInvestment
  };
}
