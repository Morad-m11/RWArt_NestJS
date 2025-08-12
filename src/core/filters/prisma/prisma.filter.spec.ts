import { PrismaClientExceptionFilter } from './prisma.filter';

describe('PrismaFilter', () => {
    it('should be defined', () => {
        expect(new PrismaClientExceptionFilter()).toBeDefined();
    });
});
