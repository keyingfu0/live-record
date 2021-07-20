import CSV from 'winston-csv-format'
import winston from 'winston'

const csvHeaders = {
  timestamp: 'timestamp',
}

const { createLogger, format, transports } = winston

const { combine, timestamp, printf } = format

const myFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`
})

export const logger = createLogger({
  // level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    // format.json()
    CSV.default(['timestamp', 'level','message', 'detail','data', 'error'], { delimiter: ',' })
    // myFormat
  ),

  // format: CSV.default(['created', 'status'], { delimiter: ',' }),
  transports: [
    new transports.Console(),
    new transports.File({
      name: 'error',
      colorize: true,
      timestamp: true,
      level: 'error',
      filename: './logs/log.csv',
      json: true,
    }),
    new transports.File({
      name: 'info',
      colorize: true,
      timestamp: true,
      level: 'info',
      filename: './logs/log.csv',
      json: true,
    }),
  ],
})
// logger.log('info', csvHeaders)
