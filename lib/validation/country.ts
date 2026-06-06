import { z } from "zod";

export const DataSourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  field: z.string().optional(),
  retrievedAt: z.string().optional()
});

const GeoCoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const CountryLeaderEntrySchema = z.object({
  role: z.enum(["headOfState", "headOfGovernment", "other"]),
  title: z.string().min(1),
  titleEn: z.string().optional(),
  name: z.string().min(1),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  since: z.string().optional(),
  order: z.number().int().positive().optional()
});

export const CountrySymbolSectionSchema = z.object({
  title: z.string().min(1),
  officialName: z.string().optional(),
  nativeName: z.string().optional(),
  lyricist: z.string().optional(),
  composer: z.string().optional(),
  adopted: z.string().optional(),
  role: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  coordinates: GeoCoordinatesSchema.optional(),
  ancientDepth: z.string().optional(),
  modernFoundingYear: z.number().int().optional(),
  keyMilestone: z.string().optional(),
  yearsCount: z.number().int().nonnegative().optional(),
  calculation: z.string().optional(),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  licenseNote: z.string().optional()
});

export const CountrySymbolProfileSchema = z.object({
  iso2: z.string().length(2),
  iso3: z.string().length(3),
  countryNameVi: z.string().min(1),
  countryNameEn: z.string().min(1),
  regionVi: z.string().min(1),
  verificationLevel: z.preprocess(normalizeSymbolVerificationLevel, z.enum(["Cao", "Trung bình", "Cần kiểm chứng thêm"])),
  updatedAt: z.string().min(1),
  mainSources: z.array(DataSourceSchema),
  sections: z.object({
    emblem: CountrySymbolSectionSchema,
    anthem: CountrySymbolSectionSchema,
    seal: CountrySymbolSectionSchema,
    headResidence: CountrySymbolSectionSchema,
    cultureIdentity: CountrySymbolSectionSchema,
    historyDepth: CountrySymbolSectionSchema
  }),
  leaders: z.array(CountryLeaderEntrySchema).optional(),
  notes: z.string().optional()
});

export const CountrySymbolProfilesSchema = z.array(CountrySymbolProfileSchema);

function normalizeSymbolVerificationLevel(value: unknown) {
  if (value === "Cao" || value === "Trung bình" || value === "Cần kiểm chứng thêm") {
    return value;
  }

  if (value === "Dữ liệu Wikipedia") {
    return "Trung bình";
  }

  if (value === "Sinh tự động") {
    return "Cần kiểm chứng thêm";
  }

  return "Cần kiểm chứng thêm";
}

export const CountryPoliticalProfileSchema = z.object({
  id: z.string().min(1),
  iso2: z.string().length(2),
  iso3: z.string().length(3),
  numericCode: z.string().optional(),
  countryName: z.string().min(1),
  officialName: z.string().min(1),
  nativeName: z.string().optional(),
  englishName: z.string().min(1),
  flagEmoji: z.string().min(1),
  flagSvgUrl: z.string().url().optional(),
  region: z.enum(["Africa", "Americas", "Asia", "Europe", "Europe - Asia", "Oceania", "Antarctic", "Unknown"]),
  subregion: z.string().optional(),
  capital: z.string().optional(),
  population: z.number().nonnegative().optional(),
  areaKm2: z.number().nonnegative().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number()
    })
    .optional(),
  languages: z.array(z.string()).optional(),
  currencies: z.array(z.string()).optional(),
  stateForm: z.string().optional(),
  governmentSystem: z.string().optional(),
  constitutionalIdentity: z.string().optional(),
  officialIdeology: z.string().optional(),
  ideologyFamily: z.array(z.string()).optional(),
  politicalRegime: z.string().optional(),
  regimeCategory: z
    .enum([
      "Liberal democracy",
      "Electoral democracy",
      "Electoral autocracy",
      "Closed autocracy",
      "Hybrid regime",
      "Unknown"
    ])
    .optional(),
  democracyScore: z.number().optional(),
  democracySource: z.string().optional(),
  powerStructure: z.string().optional(),
  rulingParty: z.string().optional(),
  rulingCoalition: z.string().optional(),
  partySystem: z.string().optional(),
  headOfStateTitle: z.string().optional(),
  headOfState: z.string().optional(),
  headOfStateSince: z.string().optional(),
  headOfGovernmentTitle: z.string().optional(),
  headOfGovernment: z.string().optional(),
  headOfGovernmentSince: z.string().optional(),
  legislature: z.string().optional(),
  legislatureStructure: z.enum(["Unicameral", "Bicameral", "None", "Unknown"]).optional(),
  judiciary: z.string().optional(),
  constitution: z.string().optional(),
  constitutionYear: z.number().int().optional(),
  lastElection: z.string().optional(),
  nextElection: z.string().optional(),
  economicModel: z.string().optional(),
  gdp: z.number().optional(),
  gdpPerCapita: z.number().optional(),
  hasCommunistRulingParty: z.boolean().optional(),
  hasMilitaryGovernment: z.boolean().optional(),
  isMonarchy: z.boolean().optional(),
  isRepublic: z.boolean().optional(),
  isFederal: z.boolean().optional(),
  isUnitary: z.boolean().optional(),
  summary: z.string().optional(),
  notes: z.array(z.string()).optional(),
  sources: z.array(DataSourceSchema),
  dataUpdatedAt: z.string().min(1),
  confidenceLevel: z.enum(["high", "medium", "low", "unknown"])
});

export const CountryPoliticalProfilesSchema = z.array(CountryPoliticalProfileSchema);
