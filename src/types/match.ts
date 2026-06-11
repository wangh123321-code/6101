export interface Player {
  name: string;
  country: string;
  score: number;
}

export interface GameScore {
  player1Score: number;
  player2Score: number;
}

export type MatchEventType = 'point' | 'timeout' | 'challenge' | 'game_win' | 'match_win';

export interface MatchEvent {
  type: MatchEventType;
  player: 1 | 2;
  timestamp: number;
  detail?: string;
}

export interface RallyPoint {
  player1: number;
  player2: number;
}

export interface MatchData {
  tableId: number;
  tableName: string;
  player1: Player;
  player2: Player;
  currentGame: number;
  games: GameScore[];
  serving: 1 | 2;
  events: MatchEvent[];
  isGamePoint: boolean;
  isMatchPoint: boolean;
  isFinished: boolean;
  rallyScores: RallyPoint[];
  gameWins1: number;
  gameWins2: number;
}

export interface WSState {
  connected: boolean;
  lastSequence: number;
  reconnecting: boolean;
  disconnectedAt: number | null;
  showBanner: boolean;
}

export type WSMessageType = 'match_update' | 'batch_update' | 'heartbeat';

export interface WSMessage {
  type: WSMessageType;
  sequence?: number;
  tableId?: number;
  match?: MatchData;
  updates?: MatchData[];
  timestamp?: number;
}

export type WSClientMessageType = 'subscribe' | 'reconnect';

export interface WSClientMessage {
  type: WSClientMessageType;
  tableIds?: number[];
  lastSequence?: number;
}

export type ReplayClipType = 'game_point' | 'match_point';

export interface ReplayClip {
  id: string;
  tableId: number;
  type: ReplayClipType;
  rallyScores: RallyPoint[];
  triggerIndex: number;
  gameNumber: number;
  timestamp: number;
  sequence: number;
}

export interface ReplayState {
  isReplayMode: boolean;
  currentClip: ReplayClip | null;
  currentStep: number;
  isPlaying: boolean;
  clipsByTable: Record<number, ReplayClip[]>;
  activeTableId: number | null;
}
