import { LocalAuthGuard } from './local.guard';

describe('LocalGuard', () => {
    it('should be defined', () => {
        expect(new LocalAuthGuard()).toBeDefined();
    });
});
