import { createLogger, format, transports, config } from 'winston';


const { combine, timestamp, json, splat } = format;
const level = 'debug';

const logger = createLogger({
    level,
    format: combine(
        timestamp(),
        splat(),
        json({ space: 2 }),
    ),
    transports: [new transports.Console()],
    exceptionHandlers: [new transports.Console()],
    exitOnError: false
});

export default logger;
