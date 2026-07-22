import type { 
  IContentRepository, 
  MedicalConditionContent, 
  SymptomsData, 
  HealthTipsData 
} from '../../domain/repositories/IContentRepository';

// In Expo/Metro, we can require JSON files synchronously.
const medicalConditionsJson = require('../../../../assets/data/medicalConditions.json');
const symptomsJson = require('../../../../assets/data/symptoms.json');
const healthTipsJson = require('../../../../assets/data/healthTips.json');

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
}
