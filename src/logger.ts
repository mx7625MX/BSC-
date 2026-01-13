import winston from 'winston';

export class Logger {
  private logger: winston.Logger;
  
  constructor(level: string = 'info') {
    this.logger = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
          }
          return msg;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
  }
  
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }
  
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }
  
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }
  
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
