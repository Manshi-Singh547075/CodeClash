import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface SocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    if (!isAuthenticated || !user) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttemptsRef.current = 0;

        // Authenticate with the server
        socket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));

        // Subscribe to updates
        socket.send(JSON.stringify({
          type: 'subscribe',
          userId: user.id
        }));
      };

      socket.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'connection':
            case 'authenticated':
            case 'subscribed':
              console.log('Socket status:', message.type);
              break;
            case 'agent_update':
              console.log('Agent update received:', message.data);
              break;
            case 'task_update':
              console.log('Task update received:', message.data);
              break;
            case 'new_activity':
              console.log('New activity received:', message.data);
              break;
            case 'system_status':
              console.log('System status update:', message.data);
              break;
            case 'error':
              console.error('Socket error:', message.message);
              break;
          }
        } catch (error) {
          console.error('Failed to parse socket message:', error);
        }
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        socketRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (isAuthenticated && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, delay);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setConnected(false);
    reconnectAttemptsRef.current = 0;
  };

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Ping to keep connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [connected]);

  return {
    connected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}
