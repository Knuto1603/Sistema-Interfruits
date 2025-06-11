import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, importProvidersFrom, inject,provideEnvironmentInitializer, Provider } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FuseConfig } from '@coreui2/services/config';
import { FUSE_CONFIG } from '@coreui2/services/config/config.constants';
import { FuseConfirmationService } from '@coreui2/services/confirmation';
import {
    fuseLoadingInterceptor,
    FuseLoadingService,
} from '@coreui2/services/loading';
import { FuseMediaWatcherService } from '@coreui2/services/media-watcher';
import { FusePlatformService } from '@coreui2/services/platform';
import { FuseUtilsService } from '@coreui2/services/utils';

export type FuseProviderConfig = {
    mockApi?: {
        delay?: number;
        services?: any[];
    };
    fuse?: FuseConfig;
};

/**
 * Fuse provider
 */
export const provideFuse = (
    config: FuseProviderConfig
): Array<Provider | EnvironmentProviders> => {
    // Base providers
    const providers: Array<Provider | EnvironmentProviders> = [
        {
            // Disable 'theme' sanity check
            provide: MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme: false,
                version: true,
            },
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill',
            },
        },
        {
            provide: FUSE_CONFIG,
            useValue: config?.fuse ?? {},
        },

        importProvidersFrom(MatDialogModule),
        provideEnvironmentInitializer(() => inject(FuseConfirmationService)),

        provideHttpClient(withInterceptors([fuseLoadingInterceptor])),
        provideEnvironmentInitializer(() => inject(FuseLoadingService)),

        provideEnvironmentInitializer(() => inject(FuseMediaWatcherService)),
        provideEnvironmentInitializer(() => inject(FusePlatformService)),
        provideEnvironmentInitializer(() => inject(FuseUtilsService)),
    ];

    // Mock Api services
    // if (config?.mockApi?.services) {
    //     providers.push(
    //         provideHttpClient(withInterceptors([mockApiInterceptor])),
    //         provideAppInitializer(() => {
    //     const initializerFn = (() => (): any => null)(inject(...config.mockApi.services));
    //     return initializerFn();
    //   })
    //     );
    // }

    // Return the providers
    return providers;
};
