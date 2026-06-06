export type Region =
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Europe - Asia"
  | "Oceania"
  | "Antarctic"
  | "Unknown";

export type RegimeCategory =
  | "Liberal democracy"
  | "Electoral democracy"
  | "Electoral autocracy"
  | "Closed autocracy"
  | "Hybrid regime"
  | "Unknown";

export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export type DataSource = {
  name: string;
  url?: string;
  field?: string;
  retrievedAt?: string;
};

export type SymbolVerificationLevel = "Cao" | "Trung bình" | "Cần kiểm chứng thêm";

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export type CountryLeaderRole = "headOfState" | "headOfGovernment" | "other";

export type CountryLeaderEntry = {
  role: CountryLeaderRole;
  title: string;
  titleEn?: string;
  name: string;
  imageUrl?: string;
  sourceUrl?: string;
  since?: string;
  order?: number;
};

export type CountrySymbolSection = {
  title: string;
  officialName?: string;
  nativeName?: string;
  lyricist?: string;
  composer?: string;
  adopted?: string;
  role?: string;
  city?: string;
  address?: string;
  coordinates?: GeoCoordinates;
  ancientDepth?: string;
  modernFoundingYear?: number;
  keyMilestone?: string;
  yearsCount?: number;
  calculation?: string;
  description: string;
  imageUrl?: string;
  audioUrl?: string;
  sourceUrl?: string;
  licenseNote?: string;
};

export type CountrySymbolProfile = {
  iso2: string;
  iso3: string;
  countryNameVi: string;
  countryNameEn: string;
  regionVi: string;
  verificationLevel: SymbolVerificationLevel;
  updatedAt: string;
  mainSources: DataSource[];
  sections: {
    emblem: CountrySymbolSection;
    anthem: CountrySymbolSection;
    seal: CountrySymbolSection;
    headResidence: CountrySymbolSection;
    cultureIdentity: CountrySymbolSection;
    historyDepth: CountrySymbolSection;
  };
  leaders?: CountryLeaderEntry[];
  notes?: string;
};

export type CountryPoliticalProfile = {
  id: string;
  iso2: string;
  iso3: string;
  numericCode?: string;

  countryName: string;
  officialName: string;
  nativeName?: string;
  englishName: string;
  flagEmoji: string;
  flagSvgUrl?: string;

  region: Region;
  subregion?: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  languages?: string[];
  currencies?: string[];

  stateForm?: string;
  governmentSystem?: string;
  constitutionalIdentity?: string;
  officialIdeology?: string;
  ideologyFamily?: string[];

  politicalRegime?: string;
  regimeCategory?: RegimeCategory;
  democracyScore?: number;
  democracySource?: string;

  powerStructure?: string;
  rulingParty?: string;
  rulingCoalition?: string;
  partySystem?: string;

  headOfStateTitle?: string;
  headOfState?: string;
  headOfStateSince?: string;

  headOfGovernmentTitle?: string;
  headOfGovernment?: string;
  headOfGovernmentSince?: string;

  legislature?: string;
  legislatureStructure?: "Unicameral" | "Bicameral" | "None" | "Unknown";
  judiciary?: string;
  constitution?: string;
  constitutionYear?: number;

  lastElection?: string;
  nextElection?: string;

  economicModel?: string;
  gdp?: number;
  gdpPerCapita?: number;

  hasCommunistRulingParty?: boolean;
  hasMilitaryGovernment?: boolean;
  isMonarchy?: boolean;
  isRepublic?: boolean;
  isFederal?: boolean;
  isUnitary?: boolean;

  summary?: string;
  notes?: string[];

  sources: DataSource[];
  dataUpdatedAt: string;
  confidenceLevel: ConfidenceLevel;
};

export type CountrySearchFilters = {
  search?: string;
  region?: string;
  subregion?: string;
  regimeCategory?: string;
  officialIdeology?: string;
  governmentSystem?: string;
  stateForm?: string;
  hasCommunistRulingParty?: boolean;
  hasMilitaryGovernment?: boolean;
  isMonarchy?: boolean;
  isRepublic?: boolean;
  isFederal?: boolean;
  isUnitary?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
};

export type CountrySearchResult = {
  data: CountryPoliticalProfile[];
  total: number;
  page: number;
  limit: number;
};

export type GlobalStats = {
  totalCountries: number;
  groupedStats: Record<string, number>;
  missingDataCount: number;
  topRegions: Record<string, number>;
  regimeCounts: Record<string, number>;
  dataUpdatedAt?: string;
};
