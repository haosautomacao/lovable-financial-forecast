
// Brazilian power distribution companies (from ANEEL data)
export interface Distributor {
  id: string;
  name: string;
  state: string;
  aneelCode?: string; // ANEEL identification code
}

// List of main power distributors in Brazil (sorted alphabetically by name)
export const distributors: Distributor[] = [
  // Região Sudeste
  { id: "CEMIG", name: "CEMIG Distribuição", state: "MG", aneelCode: "CEMIG-D" },
  { id: "CPFL", name: "CPFL Paulista", state: "SP", aneelCode: "CPFL-PAULISTA" },
  { id: "ENEL-SP", name: "Enel Distribuição São Paulo", state: "SP", aneelCode: "ENEL-SP" },
  { id: "ENEL-RJ", name: "Enel Distribuição Rio", state: "RJ", aneelCode: "ENEL-RJ" },
  { id: "LIGHT", name: "Light Serviços de Eletricidade", state: "RJ", aneelCode: "LIGHT" },
  { id: "EDP-SP", name: "EDP São Paulo", state: "SP", aneelCode: "EDP-SP" },
  { id: "EDP-ES", name: "EDP Espírito Santo", state: "ES", aneelCode: "EDP-ES" },
  { id: "ELEKTRO", name: "Elektro Eletricidade e Serviços", state: "SP", aneelCode: "ELEKTRO" },
  
  // Região Sul
  { id: "COPEL", name: "Copel Distribuição", state: "PR", aneelCode: "COPEL-DIS" },
  { id: "CELESC", name: "Celesc Distribuição", state: "SC", aneelCode: "CELESC-DIS" },
  { id: "RGE", name: "RGE Sul", state: "RS", aneelCode: "RGE-SUL" },
  { id: "CEEE-D", name: "CEEE Distribuição", state: "RS", aneelCode: "CEEE-D" },
  
  // Região Nordeste
  { id: "COELBA", name: "Coelba - Companhia de Eletricidade da Bahia", state: "BA", aneelCode: "COELBA" },
  { id: "CELPE", name: "Celpe - Companhia Energética de Pernambuco", state: "PE", aneelCode: "CELPE" },
  { id: "COSERN", name: "Cosern - Companhia Energética do Rio Grande do Norte", state: "RN", aneelCode: "COSERN" },
  { id: "ENEL-CE", name: "Enel Distribuição Ceará", state: "CE", aneelCode: "ENEL-CE" },
  { id: "ENERGISA-PB", name: "Energisa Paraíba", state: "PB", aneelCode: "EPB" },
  { id: "ENERGISA-SE", name: "Energisa Sergipe", state: "SE", aneelCode: "ESE" },
  { id: "EQUATORIAL-MA", name: "Equatorial Maranhão", state: "MA", aneelCode: "CEMAR" },
  { id: "EQUATORIAL-PI", name: "Equatorial Piauí", state: "PI", aneelCode: "CEPISA" },
  { id: "EQUATORIAL-AL", name: "Equatorial Alagoas", state: "AL", aneelCode: "CEAL" },
  
  // Região Norte
  { id: "EQUATORIAL-PA", name: "Equatorial Pará", state: "PA", aneelCode: "CELPA" },
  { id: "AMAZONAS", name: "Amazonas Energia", state: "AM", aneelCode: "AME" },
  { id: "RORAIMA", name: "Roraima Energia", state: "RR", aneelCode: "RORAIMA" },
  { id: "ENERGISA-TO", name: "Energisa Tocantins", state: "TO", aneelCode: "ETO" },
  { id: "ENERGISA-RO", name: "Energisa Rondônia", state: "RO", aneelCode: "CERON" },
  { id: "ENERGISA-AC", name: "Energisa Acre", state: "AC", aneelCode: "ELETROACRE" },
  
  // Região Centro-Oeste
  { id: "ENERGISA-MT", name: "Energisa Mato Grosso", state: "MT", aneelCode: "EMT" },
  { id: "ENERGISA-MS", name: "Energisa Mato Grosso do Sul", state: "MS", aneelCode: "EMS" },
  { id: "ENEL-GO", name: "Enel Distribuição Goiás", state: "GO", aneelCode: "ENEL-GO" },
  { id: "CEB", name: "CEB Distribuição", state: "DF", aneelCode: "CEB-DIS" }
].sort((a, b) => a.name.localeCompare(b.name));

// Get distributor by ID
export const getDistributorById = (id: string): Distributor | undefined => {
  return distributors.find(distributor => distributor.id === id);
};

// Interface for ANEEL tariff data
export interface TariffData {
  energyTariff: number;          // TE (R$/MWh)
  distributionTariff: number;    // TUSD (R$/MWh)
  generationDistributionTariff: number; // TUSDg (R$/kW)
  consumptionDistributionTariff: number; // TUSDc (R$/kW)
}

// Mock data for tariffs (in a real app, this would come from an API)
// These are fallback values when API data is unavailable
const defaultTariffs: Record<string, TariffData> = {
  "CEMIG": { energyTariff: 380, distributionTariff: 260, generationDistributionTariff: 12, consumptionDistributionTariff: 16 },
  "CPFL": { energyTariff: 350, distributionTariff: 250, generationDistributionTariff: 10, consumptionDistributionTariff: 15 },
  "ENEL-SP": { energyTariff: 370, distributionTariff: 270, generationDistributionTariff: 11, consumptionDistributionTariff: 17 },
  "default": { energyTariff: 350, distributionTariff: 250, generationDistributionTariff: 10, consumptionDistributionTariff: 15 }
};

// Function to fetch tariff data from ANEEL database
// In a real implementation, this would make an API call
export const fetchTariffData = async (distributorId: string): Promise<TariffData> => {
  // In a real app, this would call the ANEEL API with the following parameters:
  // 
  // For TE (energyTariff):
  // - Base Tarifária: Tarifa de aplicação
  // - Subgrupo: B1
  // - Modalidade: Convencional
  // - Classe: Residencial
  // - Subclasse: Residencial
  // - Detalhe: "Não se aplica"
  //
  // For TUSD carga (distributionTariff/consumptionDistributionTariff):
  // - Base Tarifária: Tarifa de aplicação
  // - Subgrupo: A4
  // - Modalidade: Verde
  // - Classe: "Não se aplica"
  // - Detalhe: "Não se aplica"
  // - Posto: "Não se aplica"
  //
  // For TUSD geração (generationDistributionTariff):
  // - Base Tarifária: Tarifa de aplicação
  // - Subgrupo: A4
  // - Modalidade: Geração
  // - Classe: "Não se aplica"
  // - Detalhe: "Não se aplica"
  // - Posto: "Não se aplica"

  // For now, we'll use the mock data
  // In a production app, this would be replaced with an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(defaultTariffs[distributorId] || defaultTariffs.default);
    }, 500); // Simulate network delay
  });
};
