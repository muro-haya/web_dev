import { useEffect, useRef } from "react";

/**
 * useWebSocket
 * Generic WebSocket hook that accepts any message handler
 *
 * @param {string} url                    - WebSocket server URL
 * @param {(data: any) => void} onMessage - Callback for each received message
 * @param {object} [options]              - Optional config { onOpen, onClose, onError }
 */
export function useWebSocket(url, onMessage, options = {}) {
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => options.onOpen?.();
    ws.onclose = () => options.onClose?.();
    ws.onerror = (err) => options.onError?.(err);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    return () => ws.close();
  }, [url, onMessage, options]);

  return wsRef; // for sending messages if needed
}
