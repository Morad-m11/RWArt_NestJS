import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    Logger,
    NestInterceptor
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap({
                next: (val: unknown) => this.logNext(val, context),
                error: (err: Error) => this.logError(err, context)
            })
        );
    }

    private logNext(_val: unknown, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        this.logger.log({
            method: request.method,
            url: request.url,
            status: response.statusCode
        });
    }

    private logError(err: Error, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<Request>();

        if (!(err instanceof HttpException)) {
            this.logger.error({ message: `ERROR: ${request.method} ${request.url}` });
            return;
        }

        const statusCode = err.getStatus();
        const errorObject = {
            method: request.method,
            url: request.url,
            status: statusCode,
            error: err.getResponse()
        };

        if (statusCode >= 500) {
            this.logger.error(errorObject, err.stack);
        } else {
            this.logger.warn(errorObject);
        }
    }
}
