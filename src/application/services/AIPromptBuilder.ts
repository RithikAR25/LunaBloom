// src/application/services/AIPromptBuilder.ts

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export class AIPromptBuilder {
  /**
   * Formats a full conversation into Gemma 3's required prompt format.
   * Enforces the Chaotic Motivator personality, safety boundaries, and strict data hierarchies.
   */
  static buildGemmaPrompt(
    messages: AIMessage[],
    ragContextChunks: string[] = [],
    userDataChunks: string[] = [],
    authoritativeChunks: string[] = [],
    isMixedIntent: boolean = false
  ): string {
    
    const systemPrompt = `
You are Luna, LunaBloom's offline health assistant.

STRICT BEHAVIOR HIERARCHY (Must be followed in exact order):

1. SAFETY FIRST: Never give medical advice, diagnoses, or medication guidance. Tell users to see a doctor for medical issues.
2. PRIVACY SECOND: Never discuss other users or internal system databases.
3. DATA AUTHORITY THIRD: Treat all supplied APPLICATION RESULTS as absolute truth. Never recalculate dates, averages, or phases. Just echo what the engine says.
4. FACTUALITY FOURTH: Never invent user data or health facts. If no data exists, say so warmly. Rely strictly on the LUNABLOOM KNOWLEDGE provided.
5. PERSONALITY LAST: Once rules 1-4 are satisfied, be the Chaotic Motivator. Be warm, highly energetic, fiercely supportive, a little chaotic, and playfully blunt. Use max 2 emojis. Keep answers very short and punchy.

PREDICTION RESPONSE EXAMPLE
Application Result:
Next period: 2026-08-26

User:
When is my next period?

Assistant:
According to the LunaBloom Engine, your next period is coming up on August 26, 2026! 🎉 Be ready!
`;

    const mixedIntentRule = isMixedIntent 
      ? "\nMIXED QUERY RULE: The user has asked a dual question (e.g. asking for their data AND a medical explanation). The application has ALREADY provided their personal data separately. Do NOT mention their data, and do NOT apologize for not knowing it. ONLY answer the general/educational part of their question."
      : "";

    const finalSystemPrompt = systemPrompt + mixedIntentRule;

    const knowledgeBlock = ragContextChunks.length > 0
      ? `\n\n--- LUNABLOOM KNOWLEDGE ---\n(Static application/health knowledge)\n${ragContextChunks.join('\n\n')}`
      : '';

    const userDataBlock = userDataChunks.length > 0
      ? `\n\n--- USER DATA ---\n(Private data retrieved from LunaBloom)\n${userDataChunks.join('\n\n')}`
      : '';

    const authoritativeBlock = authoritativeChunks.length > 0
      ? `\n\n--- AUTHORITATIVE APPLICATION RESULTS ---\n(Predictions and calculations from the engine)\n${authoritativeChunks.join('\n\n')}`
      : '';

    const contextPayload = knowledgeBlock + userDataBlock + authoritativeBlock;

    // Phase 9.6 — Silent 6-message history cap.
    // Always retains messages[0] (system prompt + context payload are injected there).
    // Keeps the most recent (MAX_HISTORY_TURNS - 1) subsequent messages.
    // Invisible to the user — no notification is added.
    const MAX_HISTORY_TURNS = 6;
    const cappedMessages =
      messages.length > MAX_HISTORY_TURNS
        ? [messages[0]!, ...messages.slice(-(MAX_HISTORY_TURNS - 1))]
        : messages;

    let prompt = '';

    for (let i = 0; i < cappedMessages.length; i++) {
      const msg = cappedMessages[i]!;
      if (msg.role === 'user') {
        // Inject system prompt + context into the first user turn
        if (i === 0) {
          prompt += `<start_of_turn>user\n${finalSystemPrompt.trim()}\n${contextPayload}\n\n--- USER QUESTION ---\n${msg.content}<end_of_turn>\n`;
        } else {
          prompt += `<start_of_turn>user\n${msg.content}<end_of_turn>\n`;
        }
        prompt += `<start_of_turn>model\n`;
      } else {
        prompt += `${msg.content}<end_of_turn>\n`;
      }
    }

    // Leave the last <start_of_turn>model\n open for the model to continue
    return prompt;
  }
}
