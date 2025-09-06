type DurationTime = number;

type DurationUnit = 's' | 'm' | 'h' | 'd';

type Duration = `${DurationTime}${DurationUnit}`;

/**
 * @example
 * ```ts
 * parseDuration("10s");
 * parseDuration("10m");
 * parseDuration("10h");
 * parseDuration("10d");
 * ```
 *
 * @returns
 * milliseconds
 */
export const parseDuration = (value: Duration): number => {
    if (typeof value !== 'string') {
        throw new Error('Value must be a valid string');
    }

    const [duration, unit] = splitNumberAndDuration(value);

    switch (unit) {
        case 's':
            return duration * 1000;
        case 'm':
            return duration * 60 * 1000;
        case 'h':
            return duration * 60 * 60 * 1000;
        case 'd':
            return duration * 24 * 60 * 60 * 1000;
    }
};

function splitNumberAndDuration(value: Duration): [number, DurationUnit] {
    const duration = value.match(/\d+/)?.at(0);
    const unit = value.match(/(s|m|h|d)/)?.at(0);

    if (!duration || isNaN(+duration)) {
        throw new Error('Invalid duration');
    }

    return [+duration, unit] as [number, DurationUnit];
}
