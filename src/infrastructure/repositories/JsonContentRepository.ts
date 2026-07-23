import type { 
  IContentRepository, 
  MedicalConditionContent, 
  SymptomsData, 
  HealthTipsData,
  PhaseLearnContent,
  GlossaryTerm
} from '../../domain/repositories/IContentRepository';

// In Expo/Metro, we can require JSON files synchronously.
const medicalConditionsJson = require('../../../assets/data/medicalConditions.json');
const symptomsJson = require('../../../assets/data/symptoms.json');
const healthTipsJson = require('../../../assets/data/healthTips.json');
const learnContentJson = require('../../../assets/data/learnContent.json');
const glossaryJson = require('../../../assets/data/glossary.json');

export class JsonContentRepository implements IContentRepository {
  public async getMedicalConditions(): Promise<MedicalConditionContent[]> {
    return Promise.resolve(medicalConditionsJson as MedicalConditionContent[]);
  }

  public async getSymptomsData(): Promise<SymptomsData> {
    return Promise.resolve(symptomsJson as SymptomsData);
  }

  public async getHealthTips(): Promise<HealthTipsData> {
    return Promise.resolve(healthTipsJson as HealthTipsData);
  }

  public async getLearnContent(): Promise<PhaseLearnContent[]> {
    return Promise.resolve(learnContentJson as PhaseLearnContent[]);
  }

  public async getGlossary(): Promise<GlossaryTerm[]> {
    const sortedTerms = [...(glossaryJson as GlossaryTerm[])].sort((a, b) => 
      a.term.localeCompare(b.term)
    );
    return Promise.resolve(sortedTerms);
  }
}
