# ♠️ SquadPoker

![Squad Poker Banner](docs/images/logo-banner.png)

[![License](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue)](LICENSE.md)
[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFA611)](https://firebase.google.com)

**Planning Poker simplificado e elegante para times ágeis**

## 🚀 Demonstração

![SquadPoker em ação](docs/images/demo-screenshot.png)

## ✨ Sobre o Projeto

**SquadPoker** é uma aplicação web colaborativa para _Planning Poker_, criada para facilitar a estimativa de tarefas em times ágeis. Com uma interface moderna, responsiva e intuitiva, permite criar salas, votar em rodadas, acompanhar resultados em tempo real e manter o histórico das votações.

### Principais funcionalidades

- **Criação e entrada em salas**: Participe como _moderador_, _participante_ ou _espectador_.
- **Votação em tempo real**: Cada participante escolhe sua carta de poker para estimar tarefas.
- **Revelação e ocultação de votos**: O moderador controla quando os votos são revelados.
- **Histórico de rodadas**: Consulte rodadas anteriores e exporte resultados.
- **Gestão de participantes**: Remova usuários, encerre a sala ou inicie novas rodadas.
- **Interface responsiva**: Experiência fluida em desktop e mobile.
- **Persistência em nuvem**: Dados das salas e votações salvos no Firebase Firestore.

## 🔧 Tecnologias

| ![Angular](https://angular.dev/assets/icons/favicon.svg) | ![Tailwind](https://tailwindcss.com/favicons/favicon-32x32.png) | ![Firebase](https://firebase.google.com/favicon.ico) | ![RxJS](https://rxjs.dev/assets/images/favicons/favicon-32x32.png) | ![TypeScript](https://www.typescriptlang.org/favicon-32x32.png) |
|:--:|:--:|:--:|:--:|:--:|
| Angular 18 | Tailwind CSS | Firebase | RxJS | TypeScript |

## 🚀 Como Começar

### Pré-requisitos

- Node.js (v18 ou superior)
- npm (v8 ou superior)
- Git

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/squad-poker.git
   cd squad-poker
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. Configure o Firebase:
Renomeie `src/environments/environment.template.ts` para `environment.ts` e preencha com suas credenciais do Firebase

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

Acesse <http://localhost:4200>

## 📚 Uso

1. **Na tela inicial**:
   - Crie uma nova sala como moderador ou participante
   - Ou entre em uma sala existente usando o código de convite

2. **Na sala de votação**:
   - Os participantes selecionam cartas para votar
   - O moderador revela votos quando todos estiverem prontos
   - Resultados são analisados automaticamente

3. **Exportação e histórico**:
   - Exporte resultados em PNG ou PDF
   - Consulte o histórico de rodadas anteriores

## 📄 Licença

Este projeto está licenciado sob **MIT License + Commons Clause** - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

**Resumo simplificado:**

- ✅ Você pode usar este código para fins não comerciais
- ✅ Você pode modificar e distribuir o código
- ✅ Você deve manter o aviso de direitos autorais
- ❌ Você não pode vender o software ou um serviço onde o valor derive substancialmente deste software
- ❌ Você não pode usar para fins comerciais sem autorização do autor

Para uso comercial ou dúvidas sobre licenciamento, entre em contato.

## 👥 Contribuição

Contribuições são bem-vindas! Para mudanças importantes:

1. Abra uma issue para discutir o que você gostaria de mudar
2. Envie um Pull Request referenciando a issue
3. Mantenha o código limpo e bem documentado
4. Respeite os termos da licença

Note que a licença Commons Clause impede o uso comercial sem autorização.

## 📬 Contato

Danilo Silva

- 📧 Email: danilo.silva [at] msn.com
- 💼 [LinkedIn](https://www.linkedin.com/in/ddcsilva/)
- 🌐 [GitHub](https://github.com/ddcsilva)

Link do Projeto: [https://github.com/ddcsilva/squad-poker](https://github.com/ddcsilva/squad-poker)

**Para questões sobre uso comercial ou licenciamento, favor entrar em contato via email.**
