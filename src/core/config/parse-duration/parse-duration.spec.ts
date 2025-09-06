import { parseDuration } from './parse-duration';

describe('Duration Parser', () => {
    it('should parse "1s" to 1 second milliseconds', () => {
        const ms = parseDuration('1s');
        expect(ms).toEqual(1000);
    });

    it('should parse "1m" to 1 minute milliseconds', () => {
        const ms = parseDuration('1m');
        expect(ms).toEqual(60000);
    });

    it('should parse "1h" to 1 hour milliseconds', () => {
        const ms = parseDuration('1h');
        expect(ms).toEqual(3600000);
    });

    it('should parse "1d" to 1 day milliseconds', () => {
        const ms = parseDuration('1d');
        expect(ms).toEqual(86400000);
    });

    it('should parse several durations', () => {
        const fifteenSeconds = parseDuration('15s');
        const twentyMinutes = parseDuration('20m');
        const twentySixHours = parseDuration('26h');
        const fiveDays = parseDuration('5d');

        expect(fifteenSeconds).toEqual(15000);
        expect(twentyMinutes).toEqual(1200000);
        expect(twentySixHours).toEqual(93600000);
        expect(fiveDays).toEqual(432000000);
    });
});
