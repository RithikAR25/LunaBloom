export interface MoodContent {
  id: string;
  label: string;
  icon: string;
}

export interface SymptomContent {
  id: string;
  label: string;
  category: string;
}

export interface MedicalConditionContent {
  id: string;
  label: string;
  description: string;
}

export interface SymptomsData {
  moods: MoodContent[];
  symptoms: SymptomContent[];
}

export type HealthTipsData = Record<string, string[]>;

export interface IContentRepository {
  getMedicalConditions(): Promise<MedicalConditionContent[]>;
  getSymptomsData(): Promise<SymptomsData>;
  getHealthTips(): Promise<HealthTipsData>;
}
