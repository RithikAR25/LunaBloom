import { AIPromptBuilder } from '../AIPromptBuilder';

describe('AIPromptBuilder', () => {

  it('should include the personality and core behavior', () => {
    const prompt = AIPromptBuilder.buildGemmaPrompt(
      [{ role: 'user', content: 'Hi' }],
      [], [], []
    );
    expect(prompt).toContain("You are Luna, LunaBloom's offline health assistant.");
    expect(prompt).toContain('Once rules 1-4 are satisfied, be the Chaotic Motivator.');
  });

  it('should include few-shot prediction attribution examples', () => {
    const prompt = AIPromptBuilder.buildGemmaPrompt(
      [{ role: 'user', content: 'When is my next period?' }],
      ['RAG chunk 1'],
      ['User data 1'],
      ['Prediction engine result']
    );

    expect(prompt).toContain('PREDICTION RESPONSE EXAMPLE');
    expect(prompt).toContain('According to the LunaBloom Engine');
    expect(prompt).toContain('--- LUNABLOOM KNOWLEDGE ---');
    expect(prompt).toContain('--- AUTHORITATIVE APPLICATION RESULTS ---');
    expect(prompt).toContain('RAG chunk 1');
    expect(prompt).toContain('Prediction engine result');
  });

  // Phase 9.6 History Cap Tests
  // NOTE: message content strings are chosen to be non-substrings of each other.
  // e.g. "MSG_ANCHOR" cannot appear inside "MSG_DROPPED_A" and vice versa.

  it('history cap: 10-message conversation is capped to 6 turns, dropping oldest middle turns', () => {
    // messages[0] = anchor (always retained, carries system prompt)
    // messages[1..4] = dropped (oldest middle turns)
    // messages[5..9] = retained (last 5 = MAX_HISTORY_TURNS - 1)
    const messages = [
      { role: 'user' as const,      content: 'MSG_ANCHOR' },
      { role: 'assistant' as const, content: 'MSG_DROPPED_A' },
      { role: 'user' as const,      content: 'MSG_DROPPED_B' },
      { role: 'assistant' as const, content: 'MSG_DROPPED_C' },
      { role: 'user' as const,      content: 'MSG_DROPPED_D' },
      { role: 'assistant' as const, content: 'MSG_KEPT_ALPHA' },
      { role: 'user' as const,      content: 'MSG_KEPT_BETA' },
      { role: 'assistant' as const, content: 'MSG_KEPT_GAMMA' },
      { role: 'user' as const,      content: 'MSG_KEPT_DELTA' },
      { role: 'assistant' as const, content: 'MSG_KEPT_EPSILON' },
    ];

    const prompt = AIPromptBuilder.buildGemmaPrompt(messages);

    // Anchor must always be present (even with 10 messages)
    expect(prompt).toContain('MSG_ANCHOR');

    // Last 5 messages are retained
    expect(prompt).toContain('MSG_KEPT_ALPHA');
    expect(prompt).toContain('MSG_KEPT_BETA');
    expect(prompt).toContain('MSG_KEPT_GAMMA');
    expect(prompt).toContain('MSG_KEPT_DELTA');
    expect(prompt).toContain('MSG_KEPT_EPSILON');

    // Middle messages are dropped
    expect(prompt).not.toContain('MSG_DROPPED_A');
    expect(prompt).not.toContain('MSG_DROPPED_B');
    expect(prompt).not.toContain('MSG_DROPPED_C');
    expect(prompt).not.toContain('MSG_DROPPED_D');
  });

  it('history cap: messages[0] is retained even when far outside the cap window', () => {
    // 8-message conversation — messages[0] must anchor the prompt,
    // messages[1] and [2] must be dropped, messages[3..7] retained
    const messages = [
      { role: 'user' as const,      content: 'MSG_ANCHOR' },
      { role: 'assistant' as const, content: 'MSG_DROPPED_A' },
      { role: 'user' as const,      content: 'MSG_DROPPED_B' },
      { role: 'assistant' as const, content: 'MSG_KEPT_ALPHA' },
      { role: 'user' as const,      content: 'MSG_KEPT_BETA' },
      { role: 'assistant' as const, content: 'MSG_KEPT_GAMMA' },
      { role: 'user' as const,      content: 'MSG_KEPT_DELTA' },
      { role: 'assistant' as const, content: 'MSG_KEPT_EPSILON' },
    ];

    const prompt = AIPromptBuilder.buildGemmaPrompt(messages);

    // Anchor is retained and carries the system prompt
    expect(prompt).toContain('MSG_ANCHOR');
    expect(prompt).toContain("You are Luna, LunaBloom's offline health assistant.");

    // Oldest middle turns are dropped
    expect(prompt).not.toContain('MSG_DROPPED_A');
    expect(prompt).not.toContain('MSG_DROPPED_B');

    // Last 5 are retained
    expect(prompt).toContain('MSG_KEPT_ALPHA');
    expect(prompt).toContain('MSG_KEPT_BETA');
    expect(prompt).toContain('MSG_KEPT_GAMMA');
    expect(prompt).toContain('MSG_KEPT_DELTA');
    expect(prompt).toContain('MSG_KEPT_EPSILON');
  });

  it('history cap: conversation at or under 6 messages is not capped', () => {
    const messages = [
      { role: 'user' as const,      content: 'MSG_ONE' },
      { role: 'assistant' as const, content: 'MSG_TWO' },
      { role: 'user' as const,      content: 'MSG_THREE' },
      { role: 'assistant' as const, content: 'MSG_FOUR' },
      { role: 'user' as const,      content: 'MSG_FIVE' },
      { role: 'assistant' as const, content: 'MSG_SIX' },
    ];

    const prompt = AIPromptBuilder.buildGemmaPrompt(messages);

    // All 6 messages must be present — nothing is dropped
    expect(prompt).toContain('MSG_ONE');
    expect(prompt).toContain('MSG_TWO');
    expect(prompt).toContain('MSG_THREE');
    expect(prompt).toContain('MSG_FOUR');
    expect(prompt).toContain('MSG_FIVE');
    expect(prompt).toContain('MSG_SIX');
  });

});
