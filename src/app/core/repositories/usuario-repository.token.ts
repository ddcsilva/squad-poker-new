import { InjectionToken } from '@angular/core';
import { IUsuarioRepository } from '../interfaces/usuario-repository.interface';

export const USUARIO_REPOSITORY = new InjectionToken<IUsuarioRepository>('UsuarioRepository');
