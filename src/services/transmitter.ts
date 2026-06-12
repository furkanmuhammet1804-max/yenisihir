/**
 * Remote / Transmitter architecture.
 *
 * The perform screen only talks to the `Transmitter` interface, so swapping
 * the local mock for Supabase Realtime / WebSocket later means implementing
 * `connect/disconnect/send` against a channel and changing one factory line.
 */

export interface RemoteMessage {
  kind: 'text' | 'number' | 'imageUri' | 'paths';
  value: string;
  paths?: string[];
}

type Listener = (msg: RemoteMessage) => void;

export interface Transmitter {
  /** Player side: start listening for assistant messages. */
  subscribe(listener: Listener): () => void;
  /** Assistant side: push a value to the player. */
  send(msg: RemoteMessage): void;
}

/** In-process mock: assistant panel and perform screen share one bus. */
class LocalMockTransmitter implements Transmitter {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(msg: RemoteMessage): void {
    this.listeners.forEach((l) => {
      try {
        l(msg);
      } catch {
        // a broken listener must never take down the show
      }
    });
  }
}

// Future: `return new SupabaseTransmitter(channelId)` behind a setting.
export const transmitter: Transmitter = new LocalMockTransmitter();
