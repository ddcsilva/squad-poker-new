import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // 🆕 Import essencial
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Sala, HistoricoRodada } from '../../core/models/sala.model';
import { JogadoresListaComponent } from './components/jogadores-lista/jogadores-lista.component';
import { HistoricoComponent } from './components/historico/historico.component';
import { CabecalhoSalaComponent } from './components/cabecalho-sala/cabecalho-sala.component';
import { SalaEncerradaComponent } from './components/sala-encerrada/sala-encerrada.component';
import { SalaCarregamentoComponent } from './components/sala-carregamento/sala-carregamento.component';
import { SalaAlternarLayoutComponent } from './components/sala-alternar-layout/sala-alternar-layout.component';
import { StatusVotacaoComponent } from './components/status-votacao/status-votacao.component';
import { CartaoVotacaoComponent } from './components/cartao-votacao/cartao-votacao.compoment';
import { ResultadoVotacaoComponent } from './components/resultado-votacao/resultado-votacao.component';
import { SalaPainelModeracaoComponent } from './components/sala-painel-moderacao/sala-painel-moderacao.component';
import { SalaRemoverParticipanteModalComponent } from './components/sala-remover-participante-modal/sala-remover-participante-modal.component';
import { VotacaoService } from '../../core/services/votacao.service';
import { VotoValidators } from '../../core/validators/voto.validators';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [
    CommonModule,
    JogadoresListaComponent,
    HistoricoComponent,
    CabecalhoSalaComponent,
    SalaEncerradaComponent,
    SalaCarregamentoComponent,
    SalaAlternarLayoutComponent,
    StatusVotacaoComponent,
    CartaoVotacaoComponent,
    ResultadoVotacaoComponent,
    SalaPainelModeracaoComponent,
    SalaRemoverParticipanteModalComponent,
  ],
  templateUrl: './sala.component.html',
})
export class SalaComponent implements OnInit {
  // Injeção de dependências
  public router = inject(Router);
  public usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private salaService = inject(SalaService);
  private votacaoService = inject(VotacaoService);
  private destroyRef = inject(DestroyRef);

  // Math exposto para uso no template
  public Math = Math;

  // Estados
  carregando = signal<boolean>(true);
  erro = signal<string | null>(null);
  copiado = signal<boolean>(false);
  salaId = '';
  cartasPoker = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  cartaSelecionada = signal<string | null>(null);
  pontuacaoFinal = signal<string>('');

  // Formulário e controles de UI
  descricaoNovaRodada = signal<string>('');
  criandoNovaRodada = signal<boolean>(false);

  // Estados para o histórico
  mostrandoHistorico = signal<boolean>(false);
  rodadaSelecionada = signal<HistoricoRodada | null>(null);

  // Estados para o modal de confirmação
  modalRemoverParticipanteVisivel = signal<boolean>(false);
  participanteParaRemover = signal<string | null>(null);

  ngOnInit(): void {
    this.salaId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarSala();
  }

  private async carregarSala(): Promise<void> {
    if (!this.salaId) {
      this.router.navigate(['/']);
      return;
    }

    try {
      this.carregando.set(true);

      // Verificar se o usuário está autenticado
      if (!this.usuarioService.usuarioAtual()) {
        this.router.navigate(['/']);
        return;
      }

      this.salaService
        .observarSala(this.salaId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: sala => {
            this.carregando.set(false);

            const usuarioAtual = this.usuarioService.usuarioAtual();
            if (usuarioAtual) {
              const usuarioAindaNaSala = sala.jogadores.some(j => j.id === usuarioAtual.id);

              // Se o usuário não estiver mais na sala, redirecionar para a tela inicial
              if (!usuarioAindaNaSala) {
                // Limpar dados do usuário local
                this.usuarioService.limparUsuario();

                // Exibir mensagem e redirecionar
                this.router.navigate(['/'], {
                  state: {
                    mensagem: 'Você foi removido da sala pelo moderador.',
                  },
                });
                return;
              }

              // Buscar o usuário atualizado do array de jogadores para ter o voto mais recente
              const jogadorAtualizado = sala.jogadores.find(j => j.id === usuarioAtual.id);
              if (jogadorAtualizado) {
                // Atualizar o usuário no serviço para manter tudo consistente
                this.usuarioService.atualizarVotoUsuario(jogadorAtualizado.voto);

                // Atualizar estado local da carta selecionada
                this.cartaSelecionada.set(jogadorAtualizado.voto);
              }
            }

            // Se os votos acabaram de ser revelados, definir pontuação inicial
            if (sala.votosRevelados && this.pontuacaoFinal() === '') {
              const { temEmpate } = this.verificarEmpate();
              const maisVotado = this.calcularMaisVotado();

              if (!temEmpate && maisVotado.valor !== '-') {
                this.pontuacaoFinal.set(maisVotado.valor);
              }
            }
          },
          error: error => {
            console.error('Erro ao carregar sala:', error);
            this.erro.set('Sala não encontrada ou você não tem permissão');
            this.carregando.set(false);
          },
        });
    } catch (error: any) {
      this.erro.set(error.message || 'Erro ao carregar sala');
      this.carregando.set(false);
    }
  }

  // Getter para acesso fácil à sala no template
  get sala(): Sala | null {
    return this.salaService.salaAtual();
  }

  // Métodos de interação com UI
  mostrarHistorico(mostrar: boolean): void {
    // Reset selected round whenever we toggle history mode
    this.rodadaSelecionada.set(null);
    this.mostrandoHistorico.set(mostrar);
  }

  copiarCodigoSala(): void {
    navigator.clipboard.writeText(this.salaId).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1500);
    });
  }

  /**
   * Método para registrar voto (com suporte a "desvotar")
   */
  async votar(valor: string): Promise<void> {
    // 1. Validar a existência da sala e do usuário
    if (!this.sala || !this.usuarioService.usuarioAtual()) {
      return;
    }

    // 2. Obter o usuário atual
    const usuario = this.usuarioService.usuarioAtual()!;

    // 3. Apenas participantes podem votar, não espectadores
    if (usuario.tipo === 'participante') {
      // 4. Se clicou na mesma carta, "desvota"
      const novoValor = usuario.voto === valor ? null : valor;

      // 5. Validar o voto
      const resultadoValidacao = VotoValidators.validarVoto(novoValor);

      if (!resultadoValidacao.valido) {
        console.error('Voto inválido:', resultadoValidacao.erro);
        this.vibrarDispositivo(200);
        return;
      }

      if (novoValor !== null) {
        // 6. Votando: vibração de confirmação
        this.vibrarDispositivo(50);
      } else {
        // 7. Desvotando: vibração mais suave
        this.vibrarDispositivo(30);
      }

      // 8. Atualizar estado local para feedback visual imediato
      this.cartaSelecionada.set(resultadoValidacao.valorSanitizado ?? null);

      try {
        // 9. Registrar voto (ou limpar voto) com valor sanitizado
        await this.salaService.registrarVoto(this.salaId, usuario.id, resultadoValidacao.valorSanitizado ?? null);
      } catch (error) {
        console.error('Erro ao atualizar voto:', error);
        // 10. Resetar estado local em caso de erro para voltar à posição anterior
        this.cartaSelecionada.set(usuario.voto);

        // 11. Feedback que deu problema
        this.vibrarDispositivo(200);
      }
    }
  }

  // Métodos para histórico
  selecionarRodadaHistorico(rodada: HistoricoRodada): void {
    this.rodadaSelecionada.set(rodada);
  }

  voltarParaListaHistorico(): void {
    this.rodadaSelecionada.set(null);
  }

  // Controles do moderador
  async revelarVotos(): Promise<void> {
    if (!this.ehDonoDaSala()) return;

    try {
      await this.salaService.revelarVotos(this.salaId);
    } catch (error) {
      console.error('Erro ao revelar votos:', error);
    }
  }

  async ocultarVotos(): Promise<void> {
    if (!this.ehDonoDaSala()) return;

    try {
      await this.salaService.ocultarVotos(this.salaId);
      // Limpar pontuação final ao reiniciar
      this.pontuacaoFinal.set('');
    } catch (error) {
      console.error('Erro ao ocultar votos:', error);
    }
  }

  /**
   * Método para iniciar nova rodada
   */
  async iniciarNovaRodada(): Promise<void> {
    // 1. Validar se o usuário é dono da sala e se a descrição da rodada está preenchida
    if (!this.ehDonoDaSala() || !this.descricaoNovaRodada()) {
      return;
    }

    try {
      // 2. Iniciar o processo de criação da nova rodada
      this.criandoNovaRodada.set(true);

      // 3. Validar os dados antes de iniciar a nova rodada
      const resultadoValidacao = VotoValidators.validarDadosRodada({
        descricao: this.descricaoNovaRodada(),
        pontuacaoFinal: this.pontuacaoFinal(),
      });

      // 4. Se os dados não forem válidos, exibir erro e sair
      if (!resultadoValidacao.valido) {
        console.error('Dados inválidos:', resultadoValidacao.erros);
        return;
      }

      // 5. Sanitizar os dados
      const dadosSegura = resultadoValidacao.dadosSanitizados!;

      // 6. Iniciar a nova rodada com os dados sanitizados
      await this.salaService.iniciarNovaRodada(this.salaId, dadosSegura.descricao, dadosSegura.pontuacaoFinal || '');

      // 7. Limpar formulário após sucesso
      this.descricaoNovaRodada.set('');
      this.pontuacaoFinal.set('');
    } catch (error) {
      console.error('Erro ao iniciar nova rodada:', error);
    } finally {
      this.criandoNovaRodada.set(false);
    }
  }

  // Auxiliares de formulário
  atualizarDescricaoNovaRodada(valor: string): void {
    this.descricaoNovaRodada.set(valor);
  }

  atualizarPontuacaoFinal(valor: string): void {
    // 1. Validação em tempo real
    const resultadoValidacao = VotoValidators.validarPontuacaoFinal(valor);

    // 2. Atualizar o valor se for válido
    if (resultadoValidacao.valido) {
      this.pontuacaoFinal.set(resultadoValidacao.valorSanitizado || '');
    } else {
      console.warn('Pontuação inválida:', resultadoValidacao.erro);
    }
  }

  // Método para verificar se o usuário é dono da sala
  ehDonoDaSala(): boolean {
    if (!this.sala || !this.usuarioService.usuarioAtual()) return false;
    return this.usuarioService.usuarioAtual()!.nome === this.sala.nomeDono;
  }

  // Métodos de manipulação de sala
  async sairDaSala(): Promise<void> {
    const usuario = this.usuarioService.usuarioAtual();
    const sala = this.sala;
    if (!usuario || !sala) return;

    try {
      // Se for dono - REMOVER a confirmação redundante
      if (usuario.nome === sala.nomeDono) {
        // O usuário já confirmou no modal do CabecalhoSalaComponent
        await this.salaService.encerrarSala(sala.id);
      } else {
        // Participante comum: remove da lista
        await this.salaService.removerJogador(sala.id, usuario.id);
      }

      // Limpar dados locais
      this.usuarioService.limparUsuario();

      // Navegar para tela inicial
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erro ao sair da sala:', error);
    }
  }

  async encerrarSala(): Promise<void> {
    if (!this.ehDonoDaSala() || !this.sala) {
      return;
    }

    try {
      // Passar o valor da pontuação final para o método
      await this.salaService.encerrarSala(this.sala.id, this.pontuacaoFinal());
    } catch (error) {
      console.error('Erro ao encerrar sala:', error);
    }
  }

  // Métodos para manipulação de participantes
  removerParticipante(jogadorId: string): void {
    if (!this.sala || !this.ehDonoDaSala()) return;

    this.confirmarRemocaoParticipante(jogadorId);
  }

  confirmarRemocaoParticipante(jogadorId: string): void {
    this.participanteParaRemover.set(jogadorId);
    this.modalRemoverParticipanteVisivel.set(true);
  }

  async executarRemocaoParticipante(): Promise<void> {
    const jogadorId = this.participanteParaRemover();
    if (!jogadorId || !this.sala) return;

    try {
      await this.salaService.removerJogador(this.sala.id, jogadorId);
      this.modalRemoverParticipanteVisivel.set(false);
      this.participanteParaRemover.set(null);
    } catch (error) {
      console.error('Erro ao remover participante:', error);
    }
  }

  cancelarRemocaoParticipante(): void {
    this.modalRemoverParticipanteVisivel.set(false);
    this.participanteParaRemover.set(null);
  }

  // Métodos de cálculo e análise
  verificarEmpate(): { temEmpate: boolean; valores: string[] } {
    if (!this.sala) return { temEmpate: false, valores: [] };
    return this.votacaoService.verificarEmpate(this.sala.jogadores);
  }

  calcularMaisVotado(): { valor: string; contagem: number; total: number } {
    if (!this.sala) return { valor: '-', contagem: 0, total: 0 };
    return this.votacaoService.calcularMaisVotado(this.sala.jogadores);
  }

  // Métodos auxiliares para o template
  obterParticipantesQueVotaram(): number {
    if (!this.sala?.jogadores) return 0;
    return this.votacaoService.contarParticipantesQueVotaram(this.sala.jogadores);
  }

  obterTotalParticipantes(): number {
    if (!this.sala?.jogadores) return 0;
    return this.votacaoService.contarTotalParticipantes(this.sala.jogadores);
  }

  private vibrarDispositivo(duracao: number): void {
    // Só tentar vibrar se:
    // 1. Está em dispositivo móvel
    // 2. API disponível
    // 3. Browser suporta
    if (
      'vibrate' in navigator &&
      navigator.vibrate &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      try {
        navigator.vibrate(duracao);
      } catch (error) {
        // Fail silently
      }
    }
  }
}
