import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import type { IDailyLogRepository } from '../../domain/repositories/IDailyLogRepository';
import type { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { PredictionEngine } from '../../domain/prediction';
import { CycleStatisticsService } from '../../domain/services/CycleStatisticsService';
import { todayISO, addDays } from '../../utils/dateUtils';

// Tool Definition Types
export type ToolCall = {
  tool: string;
  arguments: Record<string, any>;
};

export type ToolResult = {
  success: boolean;
  data?: any;
  error?: string;
};

// Strictly allowed tools
const ALLOWED_TOOLS = [
  'getCurrentCyclePhase',
  'getCycleHistory',
  'getCycleStatistics',
  'getPrediction',
  'getRecentLogs',
  'getTodayLog',
  'getUserProfile'
];

export const TOOL_DESCRIPTIONS = `
Available tools (use ONLY when you cannot answer the question without additional context):

TOOL: getCurrentCyclePhase
DESCRIPTION: Returns the user's current cycle phase, cycle day, and fertility status.
CALL FORMAT:
{"type": "tool_call", "tool": "getCurrentCyclePhase", "arguments": {}}

TOOL: getCycleHistory
DESCRIPTION: Returns the last N cycles with start/end dates and lengths.
CALL FORMAT:
{"type": "tool_call", "tool": "getCycleHistory", "arguments": {"limit": 6}}

TOOL: getCycleStatistics
DESCRIPTION: Returns average cycle length, average period duration, and regularity.
CALL FORMAT:
{"type": "tool_call", "tool": "getCycleStatistics", "arguments": {}}

TOOL: getPrediction
DESCRIPTION: Returns the predicted next period start, fertile window, and ovulation date.
CALL FORMAT:
{"type": "tool_call", "tool": "getPrediction", "arguments": {}}

TOOL: getRecentLogs
DESCRIPTION: Returns daily logs for the last N days (max 90).
CALL FORMAT:
{"type": "tool_call", "tool": "getRecentLogs", "arguments": {"days": 7}}

TOOL: getTodayLog
DESCRIPTION: Returns today's health log (symptoms, mood, flow, energy, sleep, pain).
CALL FORMAT:
{"type": "tool_call", "tool": "getTodayLog", "arguments": {}}

TOOL: getUserProfile
DESCRIPTION: Returns tracking goals and averages.
CALL FORMAT:
{"type": "tool_call", "tool": "getUserProfile", "arguments": {}}

If you output a tool call, output ONLY the JSON object. Do not include any other text.
`;

export class AIToolSystem {
  constructor(
    private cycleRepo: ICycleRepository,
    private logRepo: IDailyLogRepository,
    private profileRepo: IUserProfileRepository
  ) {}

  /**
   * Safely parses JSON tool calls and validates against allowlist.
   */
  static parseToolCall(llmOutput: string): ToolCall | null {
    try {
      const match = llmOutput.match(/{[\s\S]*}/);
      if (!match) return null;
      
      const parsed = JSON.parse(match[0]);
      if (parsed.type === 'tool_call' && parsed.tool && ALLOWED_TOOLS.includes(parsed.tool)) {
        return {
          tool: parsed.tool,
          arguments: parsed.arguments || {}
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Executes a parsed tool call with argument limits.
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    try {
      if (!ALLOWED_TOOLS.includes(toolCall.tool)) {
        return { success: false, error: `Tool '${toolCall.tool}' is not allowed.` };
      }

      switch (toolCall.tool) {
        case 'getCurrentCyclePhase':
          return await this.getCurrentCyclePhase();
        case 'getCycleHistory': {
          let limit = toolCall.arguments?.limit ?? 6;
          if (typeof limit !== 'number' || isNaN(limit)) limit = 6;
          limit = Math.max(1, Math.min(limit, 12)); // constrain between 1 and 12
          return await this.getCycleHistory(limit);
        }
        case 'getCycleStatistics':
          return await this.getCycleStatistics();
        case 'getPrediction':
          return await this.getPrediction();
        case 'getRecentLogs': {
          let days = toolCall.arguments?.days ?? 7;
          if (typeof days !== 'number' || isNaN(days)) days = 7;
          days = Math.max(1, Math.min(days, 90)); // constrain between 1 and 90
          return await this.getRecentLogs(days);
        }
        case 'getTodayLog':
          return await this.getTodayLog();
        case 'getUserProfile':
          return await this.getUserProfileSummary();
        default:
          return { success: false, error: `Unknown tool: ${toolCall.tool}` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tool execution failed';
      return { success: false, error: message };
    }
  }

  private async getCurrentCyclePhase(): Promise<ToolResult> {
    const cycles = await this.cycleRepo.getAll();
    if (cycles.length === 0) {
      return { success: true, data: null }; // Represent missing data
    }

    const profile = await this.profileRepo.get();
    const engine = new PredictionEngine();
    const avgCycleLength = profile?.avgCycleLength ?? 28;
    const avgPeriodDuration = profile?.avgPeriodDuration ?? 5;
    const today = todayISO();
    
    const timeline = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, today);
    const phaseInfo = engine.getPhaseForDate(today, timeline);

    if (!phaseInfo.phase) {
      return { success: true, data: null };
    }

    return { success: true, data: phaseInfo };
  }

  private async getCycleHistory(limit: number): Promise<ToolResult> {
    const recent = await this.cycleRepo.getLastN(limit);
    if (recent.length === 0) {
      return { success: true, data: [] };
    }
    return { success: true, data: recent };
  }

  private async getCycleStatistics(): Promise<ToolResult> {
    const cycles = await this.cycleRepo.getAll();
    if (cycles.length === 0) {
      return { success: true, data: null };
    }
    const statsService = new CycleStatisticsService();
    const stats = statsService.getCycleStatistics(cycles);

    return {
      success: true,
      data: {
        averageCycleLength: stats.averageCycleLength,
        averagePeriodDuration: stats.averagePeriodDuration,
        isIrregular: stats.isIrregular
      }
    };
  }

  private async getPrediction(): Promise<ToolResult> {
    const cycles = await this.cycleRepo.getAll();
    if (cycles.length === 0) {
      return { success: true, data: null };
    }

    const profile = await this.profileRepo.get();
    const engine = new PredictionEngine();
    const avgCycleLength = profile?.avgCycleLength ?? 28;
    const avgPeriodDuration = profile?.avgPeriodDuration ?? 5;
    const today = todayISO();

    const timeline = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, today);
    const dash = timeline.dashboardInfo;

    if (!dash) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        nextPeriodDate: dash.nextPeriodDate,
        daysUntilNextPeriod: dash.daysUntilNextPeriod,
        predictedCycleLength: dash.predictedCycleLength,
        confidence: dash.confidence,
        currentDate: today
      }
    };
  }

  private async getRecentLogs(days: number): Promise<ToolResult> {
    const today = todayISO();
    const cutoff = addDays(today, -days);
    const recentLogs = await this.logRepo.getRange(cutoff, today);

    if (recentLogs.length === 0) {
      return { success: true, data: [] };
    }
    return { success: true, data: recentLogs };
  }

  private async getTodayLog(): Promise<ToolResult> {
    const today = todayISO();
    const todayLog = await this.logRepo.getByDate(today);

    if (!todayLog) {
      return { success: true, data: null };
    }
    return { success: true, data: todayLog };
  }

  private async getUserProfileSummary(): Promise<ToolResult> {
    const profile = await this.profileRepo.get();
    if (!profile) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        primaryGoal: profile.primaryGoal,
        trackingMode: profile.trackingMode,
        avgCycleLength: profile.avgCycleLength,
        avgPeriodDuration: profile.avgPeriodDuration
      }
    };
  }
}
