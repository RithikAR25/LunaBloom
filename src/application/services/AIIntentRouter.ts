export type DataAccess = 'none' | 'rag' | 'user_data' | 'prediction' | 'mixed';

export type AIIntent =
  | 'prediction'
  | 'prediction_explanation'
  | 'current_phase'
  | 'cycle_history'
  | 'cycle_statistics'
  | 'cycle_statistics_explanation'
  | 'today_log'
  | 'recent_logs'
  | 'profile_data'
  | 'medical_education'
  | 'medical_personalized_diagnosis'
  | 'medical_personalized_interpretation'
  | 'medical_personalized_treatment'
  | 'user_data_integrity_violation'
  | 'general_conversation'
  | 'app_help'
  | 'medical_safety'
  | 'privacy_violation'
  | 'unknown';

export type IntentDomain = 'health' | 'cycle' | 'app' | 'privacy' | 'unknown';
export type IntentAction = 'educational' | 'retrieve_data' | 'predict' | 'diagnose' | 'interpretation' | 'treat' | 'urgent_guidance' | 'unknown';

export interface RouteResolution {
  intent: AIIntent;
  dataAccess: DataAccess;
  tools: string[]; // List of tools to execute
  needsRag: boolean; // Whether to also hit the RAG index
  domain: IntentDomain;
  action: IntentAction;
}

export interface ConversationContext {
  lastIntent: AIIntent | null;
  lastDataTools: string[];
}

export class AIIntentRouter {
  /**
   * Routes a user message to a specific intent based on priority and intent dimensions.
   */
  static route(message: string, context?: ConversationContext): RouteResolution {
    const text = message.toLowerCase();

    // 1. PRIORITY: Privacy Violation Gate
    if (
      text.includes('another user') ||
      text.includes('someone else') ||
      text.includes('other people') ||
      text.includes('private data') ||
      text.includes('database') ||
      text.includes('sqlite') ||
      text.includes('export all') ||
      text.includes('all users') ||
      text.includes('raw data') ||
      text.includes('ignore your instructions') ||
      text.includes('ignore your rules')
    ) {
      return { intent: 'privacy_violation', dataAccess: 'none', tools: [], needsRag: false, domain: 'privacy', action: 'retrieve_data' };
    }

    // 2. PRIORITY: User Data Integrity Gate (Fabrication & Hallucination Requests)
    if (
      /(pretend|make up|invent|fake|guess|simulate).*(condition|symptom|cycle|period|data|date)/i.test(text) ||
      /(guess|estimate).*(what)/i.test(text) ||
      /(don't use|ignore|without).*(actual|real|my).*(data|cycle)/i.test(text) ||
      /(tell me|give me).*(not stored|not actually stored|isn't stored|my data says)/i.test(text) ||
      /(ignore|override|bypass).*(engine|rules|instructions|safety)/i.test(text) ||
      /(calculate|predict).*yourself/i.test(text) ||
      text.includes('tell me my data says')
    ) {
      return { intent: 'user_data_integrity_violation', dataAccess: 'none', tools: [], needsRag: false, domain: 'app', action: 'unknown' };
    }

    // 3. PRIORITY: Medical Safety Gate (Urgent, Personalized Diagnosis, Interpretation, Treatment)
    
    // 3a. Urgent Guidance
    if (
      /(severe|extreme|unbearable).*(pain|cramps)/i.test(text) ||
      /(heavy|excessive).*(bleeding|flow)/i.test(text) ||
      /(bleeding heavily|fainting|emergency|hospital|miscarriage|kill myself|suicide)/i.test(text)
    ) {
      return { intent: 'medical_safety', dataAccess: 'none', tools: [], needsRag: false, domain: 'health', action: 'urgent_guidance' };
    }

    // 3b. Personalized Treatment
    if (
      /(should i|do i need to).*(see a doctor|go to the doctor|go to hospital)/i.test(text) ||
      /(what|which).*(medicine|medication|pill|painkiller|drug|supplement).*(should i|can i|to) (take|use)/i.test(text) ||
      /(how to|what to do).*(cure|stop|fix|relieve).*(pain|cramps|bleeding|symptoms)/i.test(text) ||
      /what should i take/i.test(text)
    ) {
      return { intent: 'medical_personalized_treatment', dataAccess: 'none', tools: [], needsRag: false, domain: 'health', action: 'treat' };
    }

    // 3c. Personalized Diagnosis
    if (
      /(do i|could i|am i|does my).* (have|get).*(pcos|endometriosis|fibroids|cancer|cyst|syndrome|pregnant|pregnancy)/i.test(text) ||
      /(tell me|determine|check).*(if i|whether i).*(have|am).*(pcos|endometriosis|fibroids|cancer|cyst|syndrome|pregnant|pregnancy)/i.test(text) ||
      /(suggest|mean|indicate).*(i have|i am).*(pcos|endometriosis|pregnant)/i.test(text) ||
      /(what).*(condition|disease|disorder|issue).*(might|could) i have/i.test(text) ||
      /(point to|indicate).*(condition|disease|disorder)/i.test(text) ||
      /(what).*(condition|disease|disorder).*(do i have|i have|is this)/i.test(text) ||
      /(is something|something is).*(wrong|abnormal|bad).*(with me|with my body|with my hormones)/i.test(text) ||
      (/(is my|are my|my).*(cycle|period|symptoms).*(normal|healthy|okay)/i.test(text) && !text.includes('average cycle length')) ||
      /(do my symptoms suggest|is this|could this be) .*(pcos|endometriosis)/i.test(text) ||
      /diagnose me/i.test(text) ||
      /am i pregnant/i.test(text) ||
      /safety disclaimer/i.test(text)
    ) {
      return { intent: 'medical_personalized_diagnosis', dataAccess: 'none', tools: [], needsRag: false, domain: 'health', action: 'diagnose' };
    }

    // 3d. Personalized Interpretation (Indirect Diagnosis)
    if (
      text.includes('irregular cycle normal') ||
      text.includes('what condition could explain my symptoms') ||
      text.includes('is something wrong with my hormones') ||
      (text.includes('what does my history suggest') && !text.includes('average cycle length')) ||
      text.includes('what is wrong with me') ||
      text.includes('what does this pattern mean') ||
      text.includes('mean i have a disorder') ||
      text.includes('point to something serious') ||
      text.includes('could these symptoms indicate')
    ) {
      return { intent: 'medical_personalized_interpretation', dataAccess: 'none', tools: [], needsRag: false, domain: 'health', action: 'interpretation' };
    }

    // 4. PRIORITY: General Conversation / Personality
    if (text.includes('motivate me') || text.includes('pep talk') || text.includes('sad') || text.includes('happy')) {
      return { intent: 'general_conversation', dataAccess: 'none', tools: [], needsRag: false, domain: 'unknown', action: 'unknown' };
    }

    // 5. PRIORITY: User-Data Intents

    // Prediction
    if (
      text.includes('next period') ||
      text.includes('when is my period') ||
      text.includes('fertile window') ||
      text.includes('ovulation date') ||
      text.includes('predict')
    ) {
      if (text.includes('why') || text.includes('how does')) {
        return { intent: 'prediction_explanation', dataAccess: 'mixed', tools: ['getPrediction', 'getCycleHistory'], needsRag: true, domain: 'cycle', action: 'educational' };
      }
      return { intent: 'prediction', dataAccess: 'prediction', tools: ['getPrediction'], needsRag: false, domain: 'cycle', action: 'predict' };
    }

    // Profile Data (including explicitly asking for saved average)
    if (
      text.includes('profile') ||
      text.includes('my height') ||
      text.includes('my weight') ||
      text.includes('my date of birth') ||
      text.includes('my dob') ||
      text.includes('my exact date') ||
      text.includes('saved average')
    ) {
      return { intent: 'profile_data', dataAccess: 'user_data', tools: ['getUserProfile'], needsRag: false, domain: 'health', action: 'retrieve_data' };
    }

    // Cycle Statistics
    if (
      text.includes('average cycle') ||
      text.includes('average period') ||
      text.includes('shortest cycle') ||
      text.includes('longest cycle') ||
      text.includes('regularity') ||
      text.includes('irregular') ||
      text.includes('cycle statistics')
    ) {
      if (text.includes('normal') || text.includes('why')) {
        return { intent: 'cycle_statistics_explanation', dataAccess: 'mixed', tools: ['getCycleStatistics'], needsRag: true, domain: 'cycle', action: 'educational' };
      }
      return { intent: 'cycle_statistics', dataAccess: 'user_data', tools: ['getCycleStatistics'], needsRag: false, domain: 'cycle', action: 'retrieve_data' };
    }

    // Cycle History & Broad Data Queries
    if (
      text.includes('past cycles') ||
      text.includes('cycle history') ||
      text.includes('previous periods') ||
      text.includes('last cycle') ||
      text.includes('last period') ||
      text.includes('previous period') ||
      text.includes('when did my period') ||
      text.includes('how long was my last') ||
      text.includes('what information do you have') ||
      text.includes('conditions have i recorded') ||
      text.includes('what does lunabloom know about me') ||
      text.includes('tell me what you\'ve stored') ||
      text.includes('summarize my tracked data') ||
      text.includes('what information does lunabloom store') ||
      text.includes('what information isn\'t stored') ||
      text.includes('what was my first question')
    ) {
      return { intent: 'cycle_history', dataAccess: 'user_data', tools: ['getCycleHistory', 'getUserProfile'], needsRag: false, domain: 'cycle', action: 'retrieve_data' };
    }

    // Profile Data moved up for priority

    // Current Phase
    if (
      text.includes('current phase') ||
      text.includes('what phase am i in') ||
      text.includes('cycle day') ||
      text.includes('am i fertile today') ||
      text.includes('where am i in my cycle') ||
      text.includes("what's happening in my body") ||
      text.includes('what day am i on')
    ) {
      return { intent: 'current_phase', dataAccess: 'mixed', tools: ['getCurrentCyclePhase'], needsRag: true, domain: 'cycle', action: 'retrieve_data' };
    }

    // Today's Log & Recent Logs
    if (text.includes('today') && (text.includes('feel') || text.includes('symptom') || text.includes('log') || text.includes('tracked'))) {
      return { intent: 'today_log', dataAccess: 'user_data', tools: ['getTodayLog'], needsRag: false, domain: 'health', action: 'retrieve_data' };
    }
    
    if (text.includes('symptoms did i log') || text.includes('recent') || text.includes('this week') || text.includes('this month') || text.includes('recently')) {
      if (text.includes('pain') || text.includes('symptom') || text.includes('mood') || text.includes('feel') || text.includes('health') || text.includes('log')) {
        return { intent: 'recent_logs', dataAccess: 'user_data', tools: ['getRecentLogs'], needsRag: false, domain: 'health', action: 'retrieve_data' };
      }
    }

    // 5. PRIORITY: Medical Education (RAG)
    if (
      text.includes('what is') ||
      text.includes('explain') ||
      text.includes('how does') ||
      text.includes('tell me about') ||
      text.includes('what are common') ||
      text.includes('what causes') ||
      text.includes('why do i get') ||
      text.includes('why might i')
    ) {
      if (
        text.includes('pcos') ||
        text.includes('endometriosis') ||
        text.includes('ovulation') ||
        text.includes('luteal') ||
        text.includes('follicular') ||
        text.includes('menstrual') ||
        text.includes('hormone') ||
        text.includes('cramps') ||
        text.includes('symptoms of') ||
        text.includes('treatments for') ||
        text.includes('feel tired before it')
      ) {
        // Mixed intent detection for education + personal data
        let mixedTools: string[] = [];
        let isMixed = false;
        
        if (text.includes('average cycle length') || text.includes('my average')) {
          mixedTools.push('getCycleStatistics');
          isMixed = true;
        }
        if (text.includes('my symptoms')) {
          mixedTools.push('getRecentLogs');
          isMixed = true;
        }
        if (text.includes('next period')) {
          mixedTools.push('getPrediction');
          isMixed = true;
        }

        if (isMixed) {
          return { intent: 'medical_education', dataAccess: 'mixed', tools: mixedTools, needsRag: true, domain: 'health', action: 'educational' };
        }
        
        return { intent: 'medical_education', dataAccess: 'rag', tools: [], needsRag: true, domain: 'health', action: 'educational' };
      }
    }

    // 7. Capabilities & App Help
    if (text.includes('how to use') || text.includes('app settings')) {
      return { intent: 'app_help', dataAccess: 'none', tools: [], needsRag: false, domain: 'app', action: 'educational' };
    }

    // 8. Unknown Fallback
    if (context && context.lastIntent && (
      context.lastIntent === 'prediction' ||
      context.lastIntent === 'cycle_history' ||
      context.lastIntent === 'cycle_statistics' ||
      context.lastIntent === 'today_log' ||
      context.lastIntent === 'current_phase' ||
      context.lastIntent === 'recent_logs'
    )) {
      return { 
        intent: 'unknown', 
        dataAccess: 'user_data', 
        tools: context.lastDataTools, 
        needsRag: true, 
        domain: 'unknown', 
        action: 'unknown' 
      };
    }

    return { intent: 'unknown', dataAccess: 'rag', tools: [], needsRag: true, domain: 'unknown', action: 'unknown' };
  }
}
