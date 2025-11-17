export function parseJSONString(value: unknown): string[] {
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value) as string[];
            return parsed;
        } catch {
            return [];
        }
    }

    throw new Error('tags must be a stringified array');
}
