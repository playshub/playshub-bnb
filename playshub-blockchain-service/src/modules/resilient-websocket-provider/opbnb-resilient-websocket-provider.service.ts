import { Injectable, Logger } from '@nestjs/common';
import { Listener, ProviderEvent, WebSocketProvider } from 'ethers';
import { sleep } from 'src/utils';
import { WebSocket } from 'ws';

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 60 * 1000;
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 5000; // 5 seconds

@Injectable()
export class OpBnBResilientWebsocketProviderService {
  private logger = new Logger(OpBnBResilientWebsocketProviderService.name);

  private terminate: boolean = false;
  private reconnectionAttempts: number = 0;
  private ws: WebSocket;
  private isConnected: boolean = false;
  private provider: WebSocketProvider;
  private pingTimeout: NodeJS.Timeout;
  private keepAliveInterval: NodeJS.Timeout;
  public subscriptions: Set<{ event: ProviderEvent; listener: Listener }> =
    new Set();

  async connect(wsUrl: string): Promise<WebSocketProvider | null> {
    return new Promise((resolve) => {
      const startConnection = () => {
        if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
          console.error(
            `Max reconnection attempts (${MAX_RECONNECTION_ATTEMPTS}) reached for ${wsUrl}. Stopping reconnection.`,
          );
          this.terminate = true;
          resolve(null);
          return;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', async () => {
          this.reconnectionAttempts = 0;
          this.isConnected = true;
          this.setupKeepAlive();

          try {
            const wsp = new WebSocketProvider(() => this.ws);

            while (this.ws?.readyState !== WebSocket.OPEN) {
              this.logger.debug('Waiting for websocket to be open');
              await sleep(1000);
            }

            wsp._start();

            while (!wsp.ready) {
              this.logger.debug('Waiting for websocket provider to be ready');
              await sleep(1000);
            }

            this.provider = wsp;
            await this.resubscribe();
            resolve(this.provider);
          } catch (error) {
            this.logger.error(
              `Error initializing WebSocketProvider for ${wsUrl}:`,
              error,
            );
            this.cleanupConnection();
            this.reconnectionAttempts++;
            setTimeout(startConnection, RECONNECTION_DELAY);
          }
        });

        this.ws.on('close', () => {
          this.logger.error(`The websocket connection was closed for ${wsUrl}`);
          this.isConnected = false;
          this.cleanupConnection();
          if (!this.terminate) {
            this.reconnectionAttempts++;
            this.logger.debug(
              `Attempting to reconnect... (Attempt ${this.reconnectionAttempts})`,
            );
            setTimeout(startConnection, RECONNECTION_DELAY);
          }
        });

        this.ws.on('error', (error) => {
          this.logger.error(`WebSocket error for ${wsUrl}:`, error);
        });

        this.ws.on('pong', () => {
          this.logger.debug(
            'Received pong, so connection is alive, clearing the timeout',
          );
          if (this.pingTimeout) clearTimeout(this.pingTimeout);
        });
      };

      startConnection();
    });
  }

  setupKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      if (!this.ws) {
        this.logger.debug('No websocket, exiting keep alive interval');
        return;
      }
      this.logger.debug('Checking if the connection is alive, sending a ping');

      this.ws.ping();

      this.pingTimeout = setTimeout(() => {
        if (this.ws) this.ws.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);
  }

  async resubscribe() {
    this.logger.debug('Resubscribing to topics...');
    for (const subscription of this.subscriptions) {
      try {
        await this.provider.on(subscription.event, subscription.listener);

        this.logger.debug(
          `Resubscribed to ${JSON.stringify(subscription.event)}`,
        );
      } catch (error) {
        console.error(
          `Failed to resubscribe to ${JSON.stringify(subscription.event)}:`,
          error,
        );
      }
    }
  }

  cleanupConnection() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    if (this.pingTimeout) clearTimeout(this.pingTimeout);
  }
}
