import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, inject, provideEnvironmentInitializer, Provider } from '@angular/core';
import { alertInterceptor } from '../alert/alert.interceptor';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
  return [
    provideHttpClient(withInterceptors([authInterceptor, alertInterceptor])),
    provideEnvironmentInitializer(() => inject(AuthService)),
  ];
};
