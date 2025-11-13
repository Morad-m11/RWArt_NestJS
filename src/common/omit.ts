type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

/**
 * Returns a copy of the object without selected properties
 */
export const omit = <T extends object, K extends keyof T>(
    obj: T,
    ...keys: K[]
): Prettify<Omit<T, K>> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key as K))
    ) as Omit<T, K>;
};

/**
 * Returns a copy of the object with only selected properties
 */
export const extract = <T extends object, K extends keyof T>(
    obj: T,
    ...keys: K[]
): Prettify<Pick<T, K>> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key as K))
    ) as Pick<T, K>;
};

export const optional = <T extends Record<string, unknown>>(
    assertion: unknown,
    obj: T
): T | undefined => {
    if (assertion) {
        return obj;
    }

    return undefined;
};
