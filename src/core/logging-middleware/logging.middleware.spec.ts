import { NextFunction, Request, Response } from 'express';
import { logger, loggerMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
   beforeEach(() => {
      jest.spyOn(logger, 'log');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');
      jest.spyOn(logger, 'fatal');
      jest.resetAllMocks();
   });

   it('should always call next() after logging', () => {
      const next: NextFunction = jest.fn();

      for (let i = 100; i <= 600; i += 100) {
         executeLogger(createResponse(i), next);
      }

      expect(next).toHaveBeenCalledTimes(6);
   });

   it('should call "log" for 100-199', () => {
      executeLogger(createResponse(100));
      executeLogger(createResponse(199));
      expect(logger.log).toHaveBeenCalledTimes(2);
   });

   it('should call "log" for 200-299', () => {
      executeLogger(createResponse(200));
      executeLogger(createResponse(299));
      expect(logger.log).toHaveBeenCalledTimes(2);
   });

   it('should call "warn" for 300-399', () => {
      executeLogger(createResponse(300));
      executeLogger(createResponse(399));
      expect(logger.warn).toHaveBeenCalledTimes(2);
   });

   it('should call "error" for 400-499', () => {
      executeLogger(createResponse(400));
      executeLogger(createResponse(499));
      expect(logger.error).toHaveBeenCalled();
   });

   it('should call "fatal" for > 500', () => {
      executeLogger(createResponse(500));
      executeLogger(createResponse(999));
      expect(logger.fatal).toHaveBeenCalled();
   });
});

function createResponse(statusCode: number) {
   return {
      statusCode,
      on: (event, listener) => listener(event),
   } as Response;
}

function executeLogger(res200: Response, next?: NextFunction) {
   const req = { ip: '127.0.1.1', method: 'GET', path: 'some/path' } as Request;
   loggerMiddleware(req, res200, next ?? jest.fn());
}
