import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SalaService } from '../../core/services/sala.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Sala, HistoricoRodada } from '../../core/models/sala.model';
import { JogadoresListaComponent } from './components/jogadores-lista/jogadores-lista.component';
import { CartaoVotacaoComponent } from './components/cartao-votacao/cartao-votacao.compoment';
import { ResultadoVotacaoComponent } from './components/resultado-votacao/resultado-votacao.component';
import { ControlesModeracaoComponent } from './components/controles-moderacao/controles-moderacao.component';
import { HistoricoComponent } from './components/historico/historico.component';
import { CabecalhoSalaComponent } from './components/cabecalho-sala/cabecalho-sala.component';
import { StatusVotacaoComponent } from './components/status-votacao/status-votacao.component';
import { SalaEncerradaComponent } from './components/sala-encerrada/sala-encerrada.component';
import { ConfirmacaoModalComponent } from '../../shared/components/confirmacao-modal/confirmacao-modal.component';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [
    CommonModule,
    JogadoresListaComponent,
    CartaoVotacaoComponent,
    ResultadoVotacaoComponent,
    ControlesModeracaoComponent,
    HistoricoComponent,
    CabecalhoSalaComponent,
    StatusVotacaoComponent,
    SalaEncerradaComponent,
    ConfirmacaoModalComponent,
  ],
  templateUrl: './sala.component.html',
})
export class SalaComponent implements OnInit, OnDestroy {
  // Injeção de dependências
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private salaService = inject(SalaService);
  public usuarioService = inject(UsuarioService);

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
  // Novo state para formulário
  descricaoNovaRodada = signal<string>('');
  criandoNovaRodada = signal<boolean>(false);
  // Estados para o histórico
  mostrandoHistorico = signal<boolean>(false);
  rodadaSelecionada = signal<HistoricoRodada | null>(null);
  // Parte do SalaComponent.ts, adicionando os novos estados
  // Estados para o modal de confirmação de remoção de participante
  modalRemoverParticipanteVisivel = signal<boolean>(false);
  participanteParaRemover = signal<string | null>(null); // Armazena o ID do participante selecionado

  private salaSubscription?: Subscription;

  ngOnInit(): void {
    this.salaId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarSala();
  }

  ngOnDestroy(): void {
    // Limpar subscription para evitar memory leaks
    if (this.salaSubscription) {
      this.salaSubscription.unsubscribe();
    }
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
        // Se não tiver usuário, volta para entrada
        this.router.navigate(['/']);
        return;
      }

      // Observar mudanças na sala em tempo real
      this.salaSubscription = this.salaService.observarSala(this.salaId).subscribe({
        next: sala => {
          this.carregando.set(false);

          // Atualizar estado de carta selecionada com base no voto atual
          const usuarioAtual = this.usuarioService.usuarioAtual();
          if (usuarioAtual) {
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

  // Método para copiar código da sala
  copiarCodigoSala(): void {
    navigator.clipboard.writeText(this.salaId).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1500);
    });
  }

  // Método para registrar voto (com suporte a "desvotar")
  async votar(valor: string): Promise<void> {
    if (!this.sala || !this.usuarioService.usuarioAtual()) {
      return;
    }

    const usuario = this.usuarioService.usuarioAtual()!;

    // Apenas participantes podem votar, não espectadores
    if (usuario.tipo === 'participante') {
      // Se clicou na mesma carta, "desvota"
      const novoValor = usuario.voto === valor ? null : valor;

      // Atualizar estado local para feedback visual imediato
      this.cartaSelecionada.set(novoValor);

      try {
        // Registrar voto (ou limpar voto)
        await this.salaService.registrarVoto(this.salaId, usuario.id, novoValor);
      } catch (error) {
        console.error('Erro ao atualizar voto:', error);
        // Resetar estado local em caso de erro para voltar à posição anterior
        this.cartaSelecionada.set(usuario.voto);
      }
    }
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

  // Método para iniciar nova rodada
  async iniciarNovaRodada(): Promise<void> {
    if (!this.ehDonoDaSala() || !this.descricaoNovaRodada()) {
      return;
    }

    try {
      this.criandoNovaRodada.set(true);

      await this.salaService.iniciarNovaRodada(this.salaId, this.descricaoNovaRodada(), this.pontuacaoFinal());

      // Limpar formulário após sucesso
      this.descricaoNovaRodada.set('');
      this.pontuacaoFinal.set('');
    } catch (error) {
      console.error('Erro ao iniciar nova rodada:', error);
    } finally {
      this.criandoNovaRodada.set(false);
    }
  }

  // Método auxiliar para atualizar descrição
  atualizarDescricaoNovaRodada(valor: string): void {
    this.descricaoNovaRodada.set(valor);
  }

  // Atualiza a pontuação definida pelo dono da sala
  atualizarPontuacaoFinal(valor: string): void {
    this.pontuacaoFinal.set(valor);
  }

  // Método para verificar se o usuário é dono da sala
  ehDonoDaSala(): boolean {
    if (!this.sala || !this.usuarioService.usuarioAtual()) return false;
    return this.usuarioService.usuarioAtual()!.nome === this.sala.nomeDono;
  }

  // Verifica se há empate nos votos mais frequentes
  verificarEmpate(): { temEmpate: boolean; valores: string[] } {
    if (!this.sala) return { temEmpate: false, valores: [] };

    // Contagem de cada voto
    const contagem: Record<string, number> = {};
    const votos = this.sala.jogadores.filter(j => j.voto !== null).map(j => j.voto!);

    if (votos.length === 0) return { temEmpate: false, valores: [] };

    // Conta ocorrências
    votos.forEach(voto => {
      contagem[voto] = (contagem[voto] || 0) + 1;
    });

    // Encontra o maior número de votos
    const maiorContagem = Math.max(...Object.values(contagem));

    // Encontra todos os valores com essa contagem
    const valoresEmpatados = Object.entries(contagem)
      .filter(([_, count]) => count === maiorContagem)
      .map(([valor, _]) => valor);

    // Temos empate se mais de um valor tem a contagem máxima
    return {
      temEmpate: valoresEmpatados.length > 1,
      valores: valoresEmpatados,
    };
  }

  // Calcula o valor mais votado e estatísticas
  calcularMaisVotado(): { valor: string; contagem: number; total: number } {
    if (!this.sala) return { valor: '-', contagem: 0, total: 0 };

    const votos = this.sala.jogadores.filter(j => j.voto !== null).map(j => j.voto!);

    if (votos.length === 0) return { valor: '-', contagem: 0, total: 0 };

    // Conta ocorrências de cada voto
    const contagem: Record<string, number> = {};
    votos.forEach(voto => {
      contagem[voto] = (contagem[voto] || 0) + 1;
    });

    // Encontra o voto mais frequente
    let maisVotado = votos[0];
    let maiorContagem = contagem[maisVotado];

    Object.entries(contagem).forEach(([voto, count]) => {
      if (count > maiorContagem) {
        maisVotado = voto;
        maiorContagem = count;
      }
    });

    return {
      valor: maisVotado,
      contagem: maiorContagem,
      total: votos.length,
    };
  }

  // Métodos auxiliares para o template
  obterParticipantesQueVotaram(): number {
    if (!this.sala?.jogadores) return 0;
    return this.sala.jogadores.filter(j => j.tipo === 'participante' && j.voto !== null).length;
  }

  obterTotalParticipantes(): number {
    if (!this.sala?.jogadores) return 0;
    return this.sala.jogadores.filter(j => j.tipo === 'participante').length;
  }

  // Métodos para o histórico
  mostrarHistorico(mostrar: boolean): void {
    // Reset selected round whenever we toggle history mode
    this.rodadaSelecionada.set(null);
    this.mostrandoHistorico.set(mostrar);
  }

  selecionarRodadaHistorico(rodada: HistoricoRodada): void {
    this.rodadaSelecionada.set(rodada);
  }

  voltarParaListaHistorico(): void {
    this.rodadaSelecionada.set(null);
  }

  // Método auxiliar para pegar IDs de jogadores da rodada
  getJogadoresIds(rodada: HistoricoRodada): string[] {
    if (!rodada.votos) return [];
    return Object.keys(rodada.votos);
  }

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

  removerParticipante(jogadorId: string): void {
    if (!this.sala || !this.ehDonoDaSala()) return;

    this.confirmarRemocaoParticipante(jogadorId);
  }

  async exportarRodadaHistorico(): Promise<void> {
    console.log('Exportar rodada do histórico');
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
      // Poderia mostrar uma mensagem de erro ao usuário aqui
    }
  }

  cancelarRemocaoParticipante(): void {
    this.modalRemoverParticipanteVisivel.set(false);
    this.participanteParaRemover.set(null);
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
}
