import { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
    seconds,
    ThrottlerGetTrackerFunction,
    ThrottlerGuard,
    ThrottlerModule
} from '@nestjs/throttler';
import { Request } from 'express';

export const emailTracker: ThrottlerGetTrackerFunction = (req) => {
    const request = req as Request;
    const body = request.body as Record<string, string | undefined>;
    return body['email'] || request.ip || request.url;
};

export const ConfiguredThrottlerModule = ThrottlerModule.forRoot([
    { name: 'short', ttl: seconds(1), limit: 3 },
    { name: 'medium', ttl: seconds(10), limit: 20 },
    { name: 'long', ttl: seconds(60), limit: 100 }
]);

export const provideThrottlerGuard = (): Provider => {
    return {
        provide: APP_GUARD,
        useClass: ThrottlerGuard
    };
};
