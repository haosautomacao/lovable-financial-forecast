
// Brazilian power distribution companies (from ANEEL data)
export interface Distributor {
  id: string;
  name: string;
  state: string;
}

// List of main power distributors in Brazil
export const distributors: Distributor[] = [
  // Região Sudeste
  { id: "CEMIG", name: "CEMIG Distribuição", state: "MG" },
  { id: "CPFL", name: "CPFL Paulista", state: "SP" },
  { id: "ENEL-SP", name: "Enel Distribuição São Paulo", state: "SP" },
  { id: "ENEL-RJ", name: "Enel Distribuição Rio", state: "RJ" },
  { id: "LIGHT", name: "Light Serviços de Eletricidade", state: "RJ" },
  { id: "EDP-SP", name: "EDP São Paulo", state: "SP" },
  { id: "EDP-ES", name: "EDP Espírito Santo", state: "ES" },
  { id: "ELEKTRO", name: "Elektro Eletricidade e Serviços", state: "SP" },
  
  // Região Sul
  { id: "COPEL", name: "Copel Distribuição", state: "PR" },
  { id: "CELESC", name: "Celesc Distribuição", state: "SC" },
  { id: "RGE", name: "RGE Sul", state: "RS" },
  { id: "CEEE-D", name: "CEEE Distribuição", state: "RS" },
  
  // Região Nordeste
  { id: "COELBA", name: "Coelba - Companhia de Eletricidade da Bahia", state: "BA" },
  { id: "CELPE", name: "Celpe - Companhia Energética de Pernambuco", state: "PE" },
  { id: "COSERN", name: "Cosern - Companhia Energética do Rio Grande do Norte", state: "RN" },
  { id: "ENEL-CE", name: "Enel Distribuição Ceará", state: "CE" },
  { id: "ENERGISA-PB", name: "Energisa Paraíba", state: "PB" },
  { id: "ENERGISA-SE", name: "Energisa Sergipe", state: "SE" },
  { id: "EQUATORIAL-MA", name: "Equatorial Maranhão", state: "MA" },
  { id: "EQUATORIAL-PI", name: "Equatorial Piauí", state: "PI" },
  { id: "EQUATORIAL-AL", name: "Equatorial Alagoas", state: "AL" },
  
  // Região Norte
  { id: "EQUATORIAL-PA", name: "Equatorial Pará", state: "PA" },
  { id: "AMAZONAS", name: "Amazonas Energia", state: "AM" },
  { id: "RORAIMA", name: "Roraima Energia", state: "RR" },
  { id: "ENERGISA-TO", name: "Energisa Tocantins", state: "TO" },
  { id: "ENERGISA-RO", name: "Energisa Rondônia", state: "RO" },
  { id: "ENERGISA-AC", name: "Energisa Acre", state: "AC" },
  
  // Região Centro-Oeste
  { id: "ENERGISA-MT", name: "Energisa Mato Grosso", state: "MT" },
  { id: "ENERGISA-MS", name: "Energisa Mato Grosso do Sul", state: "MS" },
  { id: "ENEL-GO", name: "Enel Distribuição Goiás", state: "GO" },
  { id: "CEB", name: "CEB Distribuição", state: "DF" }
];

// Group distributors by state
export const distributorsByState = distributors.reduce((acc, distributor) => {
  if (!acc[distributor.state]) {
    acc[distributor.state] = [];
  }
  acc[distributor.state].push(distributor);
  return acc;
}, {} as Record<string, Distributor[]>);

// States in alphabetical order
export const states = Object.keys(distributorsByState).sort();

// Get distributors for a specific state
export const getDistributorsByState = (state: string): Distributor[] => {
  return distributorsByState[state] || [];
};
