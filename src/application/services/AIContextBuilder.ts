import type { ToolResult } from './AIToolSystem';

export class AIContextBuilder {
  /**
   * Converts a typed tool result into a formatted string for the AI prompt.
   * Enforces the "missing data policy" by returning explicit text when data is missing.
   */
  static buildContext(toolName: string, result: ToolResult): string {
    if (!result.success) {
      return `Tool ${toolName} failed: ${result.error}`;
    }

    if (result.data === null || (Array.isArray(result.data) && result.data.length === 0)) {
      return `[System Notice]: No data available. LunaBloom does not have enough recorded data for this request. Do NOT guess or invent values. Tell the user you don't have enough data recorded yet.`;
    }

    switch (toolName) {
      case 'getCurrentCyclePhase': {
        const p = result.data;
        return `**Current Cycle Phase**: ${p.phase}
- **Cycle Day**: ${p.cycleDay ?? 'unknown'}
- **Fertility Status**: ${p.fertilityStatus ?? 'unknown'}`;
      }

      case 'getCycleHistory': {
        const cycles = result.data as any[];
        const lines = cycles.map((c, i) => {
          const endStr = c.endDate ?? 'ongoing';
          const durationStr = c.durationDays != null ? `${c.durationDays} days` : 'ongoing';
          const lengthStr = c.cycleLengthDays != null ? `Cycle length: ${c.cycleLengthDays} days` : 'First cycle';
          const excludedStr = c.isExcludedFromPredictions ? ' *(excluded from predictions)*' : '';
          return `- **Cycle ${i + 1}**: ${c.startDate} to ${endStr} (Bleeding: ${durationStr}, ${lengthStr})${excludedStr}`;
        });
        return `**Your Cycle History**:\n${lines.join('\n')}`;
      }

      case 'getCycleStatistics': {
        const stats = result.data;
        return `**Your Cycle Statistics**:
- **Historical Average**: ${stats.averageCycleLength} days *(based on completed tracked cycles)*
- **Saved Average**: 28 days *(user-set in profile)*
- **Average Period Duration**: ${stats.averagePeriodDuration} days
- **Irregularity Detected**: ${stats.isIrregular ? 'Yes' : 'No'}`;
      }

      case 'getPrediction': {
        const pred = result.data;
        return `**LunaBloom PredictionEngine Forecast**:
- **Next period date**: ${pred.nextPeriodDate ?? 'unknown'}
- **Predicted cycle length**: ${pred.predictedCycleLength} days`;
      }

      case 'getRecentLogs': {
        const logs = result.data as any[];
        const formatEnum = (str: string) => str.replace(/^(symp_|mood_)/, '').replace(/_/g, ' ');
        const lines = logs.map(log => {
          const parts: string[] = [`**${log.date}**`];
          if (log.flowIntensity) parts.push(`Flow: ${log.flowIntensity}`);
          if (log.symptoms?.length > 0) parts.push(`Symptoms: ${log.symptoms.map(formatEnum).join(', ')}`);
          if (log.moods?.length > 0) parts.push(`Moods: ${log.moods.map(formatEnum).join(', ')}`);
          if (log.painLevel != null) parts.push(`Pain: ${log.painLevel}/10`);
          if (log.energyLevel != null) parts.push(`Energy: ${log.energyLevel}/5`);
          if (log.sleepQuality != null) parts.push(`Sleep quality: ${log.sleepQuality}/5`);
          return `- ${parts.join(' | ')}`;
        });
        return `**Recent Health Logs**:\n${lines.join('\n')}`;
      }

      case 'getTodayLog': {
        const log = result.data;
        const formatEnum = (str: string) => str.replace(/^(symp_|mood_)/, '').replace(/_/g, ' ');
        const parts: string[] = [];
        if (log.flowIntensity) parts.push(`- Menstrual flow: ${log.flowIntensity}`);
        if (log.symptoms?.length > 0) parts.push(`- Symptoms logged: ${log.symptoms.map(formatEnum).join(', ')}`);
        if (log.moods?.length > 0) parts.push(`- Moods logged: ${log.moods.map(formatEnum).join(', ')}`);
        if (log.painLevel != null) parts.push(`- Pain level: ${log.painLevel}/10`);
        if (log.energyLevel != null) parts.push(`- Energy level: ${log.energyLevel}/5`);
        if (log.sleepQuality != null) parts.push(`- Sleep quality: ${log.sleepQuality}/5`);
        if (log.sleepHours != null) parts.push(`- Sleep hours: ${log.sleepHours}`);
        if (log.notes) parts.push(`- Notes: ${log.notes}`);
        return parts.length > 0 ? `**Today's Log (${log.date})**:\n${parts.join('\n')}` : `Today's log exists but has no data entries.`;
      }

      case 'getUserProfile': {
        const prof = result.data;
        return `**User Profile (App Settings)**:
- Tracking goal: ${prof.primaryGoal}
- Tracking mode: ${prof.trackingMode}
- Average cycle length (user-set): ${prof.avgCycleLength} days
- Average period duration (user-set): ${prof.avgPeriodDuration} days`;
      }

      default:
        return `Result: ${JSON.stringify(result.data)}`;
    }
  }
}
