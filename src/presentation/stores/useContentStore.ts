import { create } from 'zustand';
import type { 
  IContentRepository, 
  MedicalConditionContent, 
  SymptomsData, 
  HealthTipsData,
  PhaseLearnContent,
  GlossaryTerm
} from '../../domain/repositories/IContentRepository';

type ContentState = {
  medicalConditions: MedicalConditionContent[];
  symptomsData: SymptomsData | null;
  healthTips: HealthTipsData | null;
  learnContent: PhaseLearnContent[] | null;
  glossary: GlossaryTerm[] | null;
  isLoading: boolean;
  isLearnContentLoading: boolean;
  error: string | null;
  _repository: IContentRepository | null;

  setRepository: (repo: IContentRepository) => void;
  loadContent: () => Promise<void>;
  loadLearnContent: () => Promise<void>;
};

export const useContentStore = create<ContentState>((set, get) => ({
  medicalConditions: [],
  symptomsData: null,
  healthTips: null,
  learnContent: null,
  glossary: null,
  isLoading: true,
  isLearnContentLoading: false,
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
        healthTips: tips 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadLearnContent: async () => {
    const { _repository, learnContent, glossary } = get();
    if (!_repository) throw new Error('[useContentStore] Repository not injected');
    
    // Skip if already loaded
    if (learnContent !== null && glossary !== null) return;

    set({ isLearnContentLoading: true, error: null });
    try {
      const [learn, gloss] = await Promise.all([
        _repository.getLearnContent(),
        _repository.getGlossary(),
      ]);
      set({ 
        learnContent: learn, 
        glossary: gloss 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load learn content';
      set({ error: message });
    } finally {
      set({ isLearnContentLoading: false });
    }
  },
}));
