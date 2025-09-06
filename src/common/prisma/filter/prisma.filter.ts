import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';
import queryErrors from './query-errors';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const { status, message } = queryErrors.get(exception.code) ?? {
            message: 'Unknown Error',
            status: 500
        };

        const meta = exception.meta;

        response.status(status).json({
            message,
            statusCode: status,
            meta
        });
    }
}
