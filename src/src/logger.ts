import winston, {createLogger, format, transports} from "winston";
import {InternalConfig} from "./InternalConfigs";
import {SPLAT} from "triple-beam";

const enumerateErrorFormat = format(info => {

    if (info.error && info.error instanceof Error) {
        info.error = Object.assign({
            message: info.error.message,
            stack: info.error.stack
        }, info.error);
    }

    if (info.exception) {
        if (logger.hasOwnProperty("crit")) {
            info.level = "crit";
        }
    }

    if (info.message instanceof Error) {
        info.message = Object.assign({
            message: info.message.message,
            stack: info.message.stack,
            error: Object.assign({
                message: info.message.message,
                stack: info.message.stack
            }, info.message)
        }, info.message);

        // logger.error("Error in logger that should not happen?", info);
    }

    if (info[SPLAT] && info[SPLAT].length > 0 && info[SPLAT][0] instanceof Error) {
        const possibleError = info[SPLAT][0];
        info.error = Object.assign({
            message: possibleError.message,
            stack: possibleError.stack
        }, possibleError);
    }

    if (info instanceof Error) {
        info = Object.assign({
            message: info.message,
            stack: info.stack,
            error: Object.assign({
                message: info.message,
                stack: info.stack
            }, info)
        }, info);
    }

    return info;
});

const formatConsoleError = format((info) => {
    if (info.error && info.error.message && info.error.stack && info.error.stack.length > 0 && info.error.message.length > 0 && !info.exception) {
        info.message = info.error.message + "\n" + info.error.stack + "\n";
    }
    return info;
});

const defaultTransports = [
    new transports.Console({
        format: format.combine(
            formatConsoleError(),
            format.timestamp(),
            format.colorize(),
            format.simple()
        ),
        handleExceptions: true,
        handleRejections: true,
    }),
    new transports.File({
        maxsize: 104857600, // 100MB
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        handleExceptions: true,
        handleRejections: true,
        filename: InternalConfig.logFile
    }),
];

export const logger: winston.Logger = createLogger({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    level: 0,
    defaultMeta: {service: {name: 'bot_venus_lounge'}},
    format: format.combine(
        enumerateErrorFormat(),
    ),
    levels: winston.config.syslog.levels,
    transports: defaultTransports,
});

