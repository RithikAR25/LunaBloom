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

export type PhaseIdentifier = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface LearnSection {
  title: string;
  summary: string;
  details?: string;
}

export interface PhaseLearnContent {
  id: PhaseIdentifier;
  name: string;
  tagline: string;
  biology: LearnSection;
  symptoms: LearnSection;
  nutrition: LearnSection;
  exercise: LearnSection;
  selfCare: LearnSection;
  whatToExpect: LearnSection;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface IContentRepository {
  getMedicalConditions(): Promise<MedicalConditionContent[]>;
  getSymptomsData(): Promise<SymptomsData>;
  getHealthTips(): Promise<HealthTipsData>;
  getLearnContent(): Promise<PhaseLearnContent[]>;
  getGlossary(): Promise<GlossaryTerm[]>;
}
