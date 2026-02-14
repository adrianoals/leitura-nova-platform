export type OneOrMany<T> = T | T[] | null | undefined;

export function firstOfRelation<T>(value: OneOrMany<T>): T | null {
    if (!value) return null;
    if (Array.isArray(value)) return value[0] ?? null;
    return value;
}
