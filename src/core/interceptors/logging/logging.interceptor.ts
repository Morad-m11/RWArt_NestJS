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
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest<Request>();

        return next.handle().pipe(
            tap({
                next: (response: Response) =>
                    this.logSuccess(startTime, request, response),
                error: (error: HttpException) => this.logError(startTime, request, error)
            })
        );
    }

    private logSuccess(startTime: number, request: Request, response: Response) {
        const responseTime = Date.now() - startTime;

        this.logger.log({
            method: request.method,
            url: request.url,
            status: response.statusCode,
            time: `${responseTime}ms`
        });
    }

    private logError(startTime: number, request: Request, error: HttpException) {
        const responseTime = Date.now() - startTime;

        this.logger.error(
            {
                method: request.method,
                url: request.url,
                status: error.getStatus(),
                time: `${responseTime}ms`,
                error: error.getResponse()
            },
            error.stack
        );
    }
}
