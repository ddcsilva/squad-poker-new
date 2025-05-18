import { InjectionToken } from '@angular/core';
import { ISalaRepository } from './sala-repository.interface';

export const SALA_REPOSITORY = new InjectionToken<ISalaRepository>('SalaRepository');
