# ♠️ SquadPoker

**SquadPoker** é uma aplicação web colaborativa para _Planning Poker_, criada para facilitar a estimativa de tarefas em times ágeis. Com uma interface moderna, responsiva e intuitiva, permite criar salas, votar em rodadas, acompanhar resultados em tempo real e manter o histórico das votações.

## ✨ Funcionalidades

- **Criação e entrada em salas**: Participe como _moderador_, _participante_ ou _espectador_.
- **Votação em tempo real**: Cada participante escolhe sua carta de poker para estimar tarefas.
- **Revelação e ocultação de votos**: O moderador controla quando os votos são revelados.
- **Histórico de rodadas**: Consulte rodadas anteriores e exporte resultados.
- **Gestão de participantes**: Remova usuários, encerre a sala ou inicie novas rodadas.
- **Interface responsiva**: Experiência fluida em desktop e mobile.
- **Persistência em nuvem**: Dados das salas e votações salvos no Firebase Firestore.

## 🚀 Tecnologias

- **Angular 18** (standalone components)
- **TailwindCSS** para estilização moderna
- **Firebase Firestore** para backend em tempo real
- **RxJS** para reatividade
- **TypeScript** e **UUID** para tipagem e identificação
- **html2canvas** e **jsPDF** para exportação de resultados

## 🖥️ Como rodar o projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/squad-poker.git
   cd squad-poker
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure o Firebase:**
   - Renomeie `src/environments/environment.ts.example` para `environment.ts` e preencha com suas credenciais do Firebase (ou use as já presentes para testes).

4. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm start
   ```

   Acesse [http://localhost:4200](http://localhost:4200).

## 🛠️ Scripts úteis

- `npm start` — inicia o servidor local
- `npm run build` — gera a build de produção
- `npm test` — executa os testes unitários

## 📁 Estrutura do projeto

- `src/app/features/entrada` — Tela de entrada/criação de sala
- `src/app/features/sala` — Lógica e interface da sala de votação
- `src/app/shared/components` — Componentes reutilizáveis (cartão de poker, modais, etc)
- `src/app/core` — Serviços, modelos e repositórios

## 🔒 Autoria e licença

Desenvolvido por Danilo Silva.
