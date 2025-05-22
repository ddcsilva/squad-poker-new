import { InjectionToken } from '@angular/core';
import { IUsuarioRepository } from '../interfaces/usuario-repository.interface';

/**
 * Token para injeção de dependência do repositório de usuários
 */
export const USUARIO_REPOSITORY = new InjectionToken<IUsuarioRepository>('UsuarioRepository');
