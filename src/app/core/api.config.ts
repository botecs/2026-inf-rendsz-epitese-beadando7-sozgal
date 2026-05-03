import { InjectionToken, Provider } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';

export function provideApiBaseUrl(baseUrl: string = DEFAULT_API_BASE_URL): Provider {
  return {
    provide: API_BASE_URL,
    useValue: baseUrl,
  };
}
