export interface Player {
  name: string;
  country: string;
  score: number;
}

export interface GameScore {
  player1Score: number;
  player2Score: number;
}

export interface MatchEvent {
  type: 'point' | 'timeout' | 'challenge' | 'game_win' | 'match_win';
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

export interface WSMessage {
  type: 'match_update' | 'batch_update' | 'heartbeat';
  sequence?: number;
  tableId?: number;
  match?: MatchData;
  updates?: MatchData[];
  timestamp?: number;
}

export interface WSClientMessage {
  type: 'subscribe' | 'reconnect';
  tableIds?: number[];
  lastSequence?: number;
}
