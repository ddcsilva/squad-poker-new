import { InjectionToken } from '@angular/core';
import { ISalaRepository } from '../interfaces/sala-repository.interface';

/**
 * Token para injeção de dependência do repositório de salas
 */
export const SALA_REPOSITORY = new InjectionToken<ISalaRepository>('SalaRepository');
