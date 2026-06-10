import { WebSocketServer, WebSocket } from 'ws';
import type { MatchData, Player, WSMessageType } from '../src/types/match';

const PLAYERS: Player[] = [
  { name: '樊振东', country: 'CHN', score: 0 },
  { name: '马龙', country: 'CHN', score: 0 },
  { name: '张本智和', country: 'JPN', score: 0 },
  { name: '特鲁尔斯·莫雷加德', country: 'SWE', score: 0 },
  { name: '雨果·卡尔德拉诺', country: 'BRA', score: 0 },
  { name: '林昀儒', country: 'TPE', score: 0 },
  { name: '迪米特里·奥恰洛夫', country: 'GER', score: 0 },
  { name: '费利克斯·勒布伦', country: 'FRA', score: 0 },
  { name: '林钟勋', country: 'KOR', score: 0 },
  { name: '邱党', country: 'GER', score: 0 },
];

const TABLE_NAMES = ['1号台', '2号台', '3号台', '4号台', '5号台'];

interface WSMessageData {
  type: WSMessageType;
  sequence?: number;
  tableId?: number;
  match?: MatchData;
  updates?: MatchData[];
  timestamp?: number;
}

let sequence = 0;
const messageHistory: { sequence: number; data: WSMessageData }[] = [];

function createMatches(): MatchData[] {
  const used = new Set<number>();
  const pick = () => {
    let idx: number;
    do {
      idx = Math.floor(Math.random() * PLAYERS.length);
    } while (used.has(idx));
    used.add(idx);
    return PLAYERS[idx];
  };

  return TABLE_NAMES.map((name, i) => {
    const p1 = pick();
    const p2 = pick();
    return {
      tableId: i + 1,
      tableName: name,
      player1: { ...p1, score: 0 },
      player2: { ...p2, score: 0 },
      currentGame: 1,
      games: [{ player1Score: 0, player2Score: 0 }],
      serving: (Math.random() > 0.5 ? 1 : 2) as 1 | 2,
      events: [],
      isGamePoint: false,
      isMatchPoint: false,
      isFinished: false,
      rallyScores: [],
      gameWins1: 0,
      gameWins2: 0,
    };
  });
}

function isGamePoint(state: MatchData): boolean {
  if (state.isFinished) return false;
  const g = state.games[state.currentGame - 1];
  if (!g) return false;
  const s1 = g.player1Score;
  const s2 = g.player2Score;
  if (s1 >= 10 && s1 > s2) return true;
  if (s2 >= 10 && s2 > s1) return true;
  return false;
}

function isMatchPoint(state: MatchData): boolean {
  if (!isGamePoint(state)) return false;
  const neededWins = Math.ceil(7 / 2);
  const g = state.games[state.currentGame - 1];
  if (state.gameWins1 === neededWins - 1 && g.player1Score >= 10 && g.player1Score > g.player2Score) return true;
  if (state.gameWins2 === neededWins - 1 && g.player2Score >= 10 && g.player2Score > g.player1Score) return true;
  return false;
}

function simulatePoint(state: MatchData): MatchData {
  if (state.isFinished) return state;

  const newState = { ...state, games: state.games.map((g) => ({ ...g })), events: [...state.events] };

  const winner: 1 | 2 = Math.random() > 0.5 ? 1 : 2;
  const g = { ...newState.games[newState.currentGame - 1] };

  if (winner === 1) {
    g.player1Score += 1;
    newState.player1 = { ...newState.player1, score: g.player1Score };
  } else {
    g.player2Score += 1;
    newState.player2 = { ...newState.player2, score: g.player2Score };
  }

  newState.games[newState.currentGame - 1] = g;

  const totalPoints = g.player1Score + g.player2Score;
  if (totalPoints % 2 === 0) {
    newState.serving = newState.serving === 1 ? 2 : 1;
  }
  if (g.player1Score >= 10 && g.player2Score >= 10 && (totalPoints) % 2 === 1) {
    newState.serving = newState.serving === 1 ? 2 : 1;
  }

  const rs = [...newState.rallyScores, { player1: g.player1Score, player2: g.player2Score }];
  newState.rallyScores = rs.length > 20 ? rs.slice(-20) : rs;

  const gameWin = (g.player1Score >= 11 || g.player2Score >= 11) && Math.abs(g.player1Score - g.player2Score) >= 2;

  if (gameWin) {
    const gameWinner = g.player1Score > g.player2Score ? 1 : 2;
    if (gameWinner === 1) newState.gameWins1 += 1;
    else newState.gameWins2 += 1;

    newState.events = [
      ...newState.events,
      {
        type: 'game_win',
        player: gameWinner,
        timestamp: Date.now(),
        detail: `第${newState.currentGame}局 ${g.player1Score}:${g.player2Score}`,
      },
    ];

    const neededWins = Math.ceil(7 / 2);
    if (newState.gameWins1 >= neededWins || newState.gameWins2 >= neededWins) {
      newState.isFinished = true;
      newState.isGamePoint = false;
      newState.isMatchPoint = false;
      newState.events = [
        ...newState.events,
        {
          type: 'match_win',
          player: newState.gameWins1 >= neededWins ? 1 : 2,
          timestamp: Date.now(),
        },
      ];
      return newState;
    }

    newState.currentGame += 1;
    newState.games.push({ player1Score: 0, player2Score: 0 });
    newState.player1 = { ...newState.player1, score: 0 };
    newState.player2 = { ...newState.player2, score: 0 };
    newState.serving = newState.currentGame % 2 === 1 ? 1 : 2;
  }

  if (Math.random() < 0.03 && !newState.isFinished) {
    const tp: 1 | 2 = Math.random() > 0.5 ? 1 : 2;
    newState.events = [
      ...newState.events,
      { type: 'timeout', player: tp, timestamp: Date.now(), detail: '暂停' },
    ];
  }

  if (Math.random() < 0.015 && !newState.isFinished) {
    const cp: 1 | 2 = Math.random() > 0.5 ? 1 : 2;
    const success = Math.random() > 0.5;
    newState.events = [
      ...newState.events,
      { type: 'challenge', player: cp, timestamp: Date.now(), detail: success ? '挑战成功' : '挑战失败' },
    ];
  }

  newState.isGamePoint = isGamePoint(newState);
  newState.isMatchPoint = isMatchPoint(newState);

  return newState;
}

function broadcast(wss: WebSocketServer, data: WSMessageData) {
  sequence += 1;
  const msg = { ...data, sequence };
  messageHistory.push({ sequence, data: msg });
  if (messageHistory.length > 5000) messageHistory.splice(0, 2000);

  const payload = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function main() {
  const port = 3001;
  const wss = new WebSocketServer({ port });

  const matches = createMatches();

  console.log(`WebSocket Mock Server running on ws://localhost:${port}`);

  wss.on('connection', (ws) => {
    console.log('Client connected');

    matches.forEach((m) => {
      sequence += 1;
      const msg = { type: 'match_update', sequence, tableId: m.tableId, match: m };
      ws.send(JSON.stringify(msg));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === 'reconnect' && typeof msg.lastSequence === 'number') {
          const missed = messageHistory.filter((h) => h.sequence > msg.lastSequence);
          if (missed.length > 0) {
            const updates: MatchData[] = [];
            const seen = new Map<number, MatchData>();
            for (const h of missed) {
              if (h.data.type === 'match_update' && h.data.match && h.data.tableId !== undefined) {
                seen.set(h.data.tableId, h.data.match);
              }
            }
            seen.forEach((match) => updates.push(match));

            if (updates.length > 0) {
              sequence += 1;
              const batchMsg = { type: 'batch_update', sequence, updates };
              ws.send(JSON.stringify(batchMsg));
            }
          }
          console.log(`Reconnect catchup: lastSeq=${msg.lastSequence}, current=${sequence}`);
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    });
  }, 3000);

  const intervalMs = 1500;
  setInterval(() => {
    const idx = Math.floor(Math.random() * matches.length);
    if (matches[idx].isFinished) {
      const allFinished = matches.every((m) => m.isFinished);
      if (allFinished) {
        matches.forEach((_, i) => {
          Object.assign(matches[i], createMatches()[i] || createMatches()[0]);
        });
      }
      return;
    }

    matches[idx] = simulatePoint(matches[idx]);
    broadcast(wss, {
      type: 'match_update',
      tableId: matches[idx].tableId,
      match: matches[idx],
    });
  }, intervalMs);
}

main();
