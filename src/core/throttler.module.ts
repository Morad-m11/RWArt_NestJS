import { seconds, ThrottlerGetTrackerFunction, ThrottlerModule } from '@nestjs/throttler';
import { Request } from 'express';

export const throttlerEmailTracker: ThrottlerGetTrackerFunction = (req) => {
    const request = req as Request;
    const body = request.body as Record<string, string | undefined>;
    return body['email'] || request.ip || request.url;
};

export const ConfiguredThrottlerModule = ThrottlerModule.forRoot([
    { name: 'short', ttl: seconds(1), limit: 3 },
    { name: 'medium', ttl: seconds(10), limit: 20 },
    { name: 'long', ttl: seconds(60), limit: 100 }
]);
