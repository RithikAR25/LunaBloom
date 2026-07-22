import { create } from 'zustand';
import type { 
  IContentRepository, 
  MedicalConditionContent, 
  SymptomsData, 
  HealthTipsData 
} from '../../domain/repositories/IContentRepository';

type ContentState = {
  medicalConditions: MedicalConditionContent[];
  symptomsData: SymptomsData | null;
  healthTips: HealthTipsData | null;
  isLoading: boolean;
  error: string | null;
  _repository: IContentRepository | null;

  setRepository: (repo: IContentRepository) => void;
  loadContent: () => Promise<void>;
};

export const useContentStore = create<ContentState>((set, get) => ({
  medicalConditions: [],
  symptomsData: null,
  healthTips: null,
  isLoading: false,
  error: null,
  _repository: null,

  setRepository: (repo) => set({ _repository: repo }),

  loadContent: async () => {
    const { _repository } = get();
    if (!_repository) throw new Error('[useContentStore] Repository not injected');

    set({ isLoading: true, error: null });
    try {
      const [conditions, symptoms, tips] = await Promise.all([
        _repository.getMedicalConditions(),
        _repository.getSymptomsData(),
        _repository.getHealthTips(),
      ]);
      set({ 
        medicalConditions: conditions, 
        symptomsData: symptoms, 
        healthTips: tips, 
        isLoading: false 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content';
      set({ error: message, isLoading: false });
    }
  },
}));
