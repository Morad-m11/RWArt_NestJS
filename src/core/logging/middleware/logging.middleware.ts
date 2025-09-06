import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export const logger = new Logger('HTTP');

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, path } = req;

    res.on('finish', () => {
        const { statusCode } = res;
        const message = `${path}, ${method}, ${statusCode}, ${ip}`;

        if (statusCode >= 100 && statusCode <= 199) {
            logger.log(message);
        } else if (statusCode >= 200 && statusCode <= 299) {
            logger.log(message);
        } else if (statusCode >= 300 && statusCode <= 399) {
            logger.warn(message);
        } else if (statusCode >= 400 && statusCode <= 499) {
            logger.error(message);
        } else {
            logger.fatal(message);
        }
    });

    next();
}
