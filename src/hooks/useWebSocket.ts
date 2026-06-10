import { useEffect, useRef, useCallback } from 'react';
import { useMatchStore } from '@/store/matchStore';
import type { WSMessage, WSClientMessage } from '@/types/match';

const WS_URL = typeof window !== 'undefined'
  ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/ws`
  : 'ws://localhost:3001';
const RECONNECT_DELAY_BASE = 1000;
const RECONNECT_DELAY_MAX = 30000;
const DISCONNECT_BANNER_DELAY = 5000;
const HEARTBEAT_TIMEOUT = 8000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const manualCloseRef = useRef(false);

  const { updateMatch, batchUpdate, setWsState } = useMatchStore();

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    reconnectTimerRef.current = null;
    bannerTimerRef.current = null;
    heartbeatTimerRef.current = null;
  }, []);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setTimeout(() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }, HEARTBEAT_TIMEOUT);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        if (msg.type === 'heartbeat') {
          resetHeartbeat();
          return;
        }

        if (msg.type === 'match_update' && msg.match) {
          updateMatch(msg.match);
          if (msg.sequence) {
            setWsState({ lastSequence: msg.sequence });
          }
        }

        if (msg.type === 'batch_update' && msg.updates) {
          batchUpdate(msg.updates);
          if (msg.sequence) {
            setWsState({ lastSequence: msg.sequence });
          }
        }
      } catch {
        // ignore parse errors
      }
    },
    [updateMatch, batchUpdate, setWsState, resetHeartbeat]
  );

  const connect = useCallback(() => {
    if (manualCloseRef.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      clearTimers();
      reconnectAttemptRef.current = 0;
      setWsState({
        connected: true,
        reconnecting: false,
        disconnectedAt: null,
        showBanner: false,
      });
      resetHeartbeat();

      const subscribeMsg: WSClientMessage = {
        type: 'subscribe',
        tableIds: [1, 2, 3, 4, 5],
      };
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setWsState({ connected: false });

      const state = useMatchStore.getState().wsState;
      if (!state.disconnectedAt) {
        setWsState({ disconnectedAt: Date.now() });

        bannerTimerRef.current = setTimeout(() => {
          setWsState({ showBanner: true });
        }, DISCONNECT_BANNER_DELAY);
      }

      if (!manualCloseRef.current) {
        const delay = Math.min(
          RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttemptRef.current),
          RECONNECT_DELAY_MAX
        );
        reconnectAttemptRef.current += 1;
        setWsState({ reconnecting: true });

        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };

    wsRef.current = ws;
  }, [clearTimers, handleMessage, resetHeartbeat, setWsState]);

  const reconnectWithDataCatchup = useCallback(() => {
    const state = useMatchStore.getState().wsState;
    const catchupMsg: WSClientMessage = {
      type: 'reconnect',
      lastSequence: state.lastSequence,
    };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(catchupMsg));
    }
  }, []);

  useEffect(() => {
    manualCloseRef.current = false;
    connect();
    return () => {
      manualCloseRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearTimers]);

  useEffect(() => {
    const unsubscribe = useMatchStore.subscribe((state, prev) => {
      if (
        state.wsState.connected &&
        !prev.wsState.connected
      ) {
        reconnectWithDataCatchup();
      }
    });
    return unsubscribe;
  }, [reconnectWithDataCatchup]);
}
