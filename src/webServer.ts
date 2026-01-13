import express, { Request, Response } from 'express';
import { Server as WebSocketServer } from 'ws';
import * as http from 'http';
import * as path from 'path';
import { SniperBot } from './bot';

export interface BotStatus {
  isRunning: boolean;
  accountAddress: string;
  accountBalance: string;
  processedPairs: number;
  holdings: Array<{
    tokenAddress: string;
    amount: string;
    buyPrice: string;
    currentProfit: string;
    buyTimestamp: number;
  }>;
  recentLogs: string[];
  config: {
    autoTradeEnabled: boolean;
    takeProfitEnabled: boolean;
    quickSellEnabled: boolean;
    copyTradeEnabled: boolean;
    sellOnBuyVolumeEnabled: boolean;
    maxBuyAmount: number;
    minLiquidityBnb: number;
  };
}

export class WebServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocketServer;
  private bot: SniperBot | null = null;
  private recentLogs: string[] = [];
  private maxLogs = 100;

  constructor(private port: number = 3000) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.setupRoutes();
    this.setupWebSocket();
  }

  setBotInstance(bot: SniperBot) {
    this.bot = bot;
  }

  addLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.recentLogs.push(logEntry);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.shift();
    }
    // 广播日志到所有连接的客户端
    this.broadcast({ type: 'log', data: logEntry });
  }

  private setupRoutes() {
    // 静态文件
    this.app.use(express.static(path.join(__dirname, '../public')));

    // API路由
    this.app.get('/api/status', async (req: Request, res: Response) => {
      try {
        const status = await this.getBotStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    // 主页
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('新的WebSocket连接');

      // 发送当前状态
      this.getBotStatus().then(status => {
        ws.send(JSON.stringify({ type: 'status', data: status }));
      });

      // 发送最近的日志
      this.recentLogs.forEach(log => {
        ws.send(JSON.stringify({ type: 'log', data: log }));
      });
    });
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(data);
      }
    });
  }

  private async getBotStatus(): Promise<BotStatus> {
    if (!this.bot) {
      return {
        isRunning: false,
        accountAddress: '',
        accountBalance: '0',
        processedPairs: 0,
        holdings: [],
        recentLogs: this.recentLogs,
        config: {
          autoTradeEnabled: false,
          takeProfitEnabled: false,
          quickSellEnabled: false,
          copyTradeEnabled: false,
          sellOnBuyVolumeEnabled: false,
          maxBuyAmount: 0,
          minLiquidityBnb: 0,
        }
      };
    }

    const status = this.bot.getStatus();
    return {
      ...status,
      recentLogs: this.recentLogs
    };
  }

  // 定期广播状态更新
  startStatusBroadcast(interval: number = 5000) {
    setInterval(async () => {
      const status = await this.getBotStatus();
      this.broadcast({ type: 'status', data: status });
    }, interval);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Web界面已启动: http://localhost:${this.port}`);
      console.log(`请在浏览器中打开上述地址查看机器人状态`);
    });

    // 启动状态广播
    this.startStatusBroadcast();
  }

  stop() {
    this.wss.close();
    this.server.close();
  }
}
