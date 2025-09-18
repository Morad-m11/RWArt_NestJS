import { InjectionToken, Provider, Type } from '@nestjs/common';

export function provideEmpty(...tokens: Type<unknown>[]): Provider<unknown>[] {
    return tokens.map((token) => ({ provide: token, useValue: {} }));
}

export function provideValue<T>(
    token: InjectionToken | Type<T>,
    implementation: Partial<T> = {}
): Provider<Partial<T>> {
    return { provide: token, useValue: implementation };
}
