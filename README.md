# Screen Annotator

<p align="center">
  <img src="desktop.png" alt="Screen Annotator Logo">
</p>

<p align="center">
  <strong>Aplicativo de anotações na tela para apresentações e videoconferências</strong>
</p>

<p align="center">
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#uso">Uso</a> •
  <a href="#desenvolvimento">Desenvolvimento</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#contribuição">Contribuição</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-28-47848F?logo=electron">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript">
</p>

---

## Sobre

O **Screen Annotator** é um aplicativo desktop open-source que permite fazer anotações diretamente na tela do computador durante apresentações, aulas online e videoconferências. Similar ao [Presentify](https://presentify.compzets.com/) para macOS, mas disponível para Windows, macOS e Linux.

## Funcionalidades

### Ferramentas de Desenho
- ✏️ **Caneta** - Desenho livre
- 🖍️ **Marcador** - Destaque com transparência
- ⬜ **Retângulo** - Formas retangulares
- ⭕ **Círculo** - Formas circulares/elipses
- ➡️ **Seta** - Indicar direções
- ➖ **Linha** - Linhas retas
- 📝 **Texto** - Adicionar texto
- 🧹 **Borracha** - Apagar anotações

### Recursos Adicionais
- 🔦 **Spotlight** - Holofote para destacar áreas específicas
- 🎨 **Cores personalizáveis** - 9 cores predefinidas + seletor de cor
- 📏 **Espessura ajustável** - Controle do tamanho do traço (1-50px)
- ↩️ **Desfazer/Refazer** - Histórico completo de ações
- ⌨️ **Atalhos personalizáveis** - Configure seus próprios atalhos
- 🖱️ **Toolbar arrastável** - Posicione onde preferir
- 📥 **System Tray** - Acesso rápido pela bandeja do sistema

## Instalação

### Pré-requisitos

- [Bun](https://bun.sh/) v1.0+ (recomendado) ou [Node.js](https://nodejs.org/) v18+
- Git

### Instalando o Bun

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

### Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/in100tiva/Screen-Annotator.git
cd Screen-Annotator

# Instale as dependências
bun install
```

## Uso

### Desenvolvimento

```bash
# Inicie o app em modo desenvolvimento com hot-reload
bun run dev
```

### Build

```bash
# Build para produção
bun run build

# Build para Windows
bun run build:win

# Build para macOS
bun run build:mac

# Build para Linux
bun run build:linux
```

Os executáveis serão gerados na pasta `dist/`.

### Atalhos de Teclado Padrão

| Atalho | Ação |
|--------|------|
| `Ctrl+Shift+D` | Alternar modo desenho/visualização |
| `Ctrl+Shift+A` | Mostrar/ocultar janela |
| `Ctrl+Shift+C` | Limpar tela |
| `Ctrl+Shift+S` | Alternar spotlight |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+1-6` | Selecionar ferramentas |
| `Ctrl+E` | Borracha |
| `T` | Ferramenta de texto |

> 💡 Todos os atalhos podem ser personalizados nas configurações!

## Desenvolvimento

### Estrutura do Projeto

```
screen-annotator/
├── .github/                    # Configurações do GitHub
│   └── CONTRIBUTING.md         # Guia de contribuição
├── resources/                  # Ícones e assets
├── src/
│   ├── main/                   # Electron Main Process
│   │   └── index.ts            # Ponto de entrada principal
│   ├── preload/                # Electron Preload Scripts
│   │   └── index.ts            # Bridge de comunicação IPC
│   ├── renderer/               # Aplicação React
│   │   ├── components/         # Componentes React
│   │   │   ├── ui/             # Componentes shadcn/ui
│   │   │   ├── canvas/         # Canvas de desenho
│   │   │   ├── toolbar/        # Barra de ferramentas
│   │   │   └── settings/       # Modal de configurações
│   │   ├── hooks/              # React Hooks customizados
│   │   ├── stores/             # Zustand Stores
│   │   ├── lib/                # Utilitários
│   │   ├── styles/             # Estilos globais
│   │   ├── App.tsx             # Componente principal
│   │   └── main.tsx            # Ponto de entrada React
│   └── shared/                 # Código compartilhado
│       ├── types/              # TypeScript types
│       └── constants/          # Constantes globais
├── electron.vite.config.ts     # Configuração electron-vite
├── tailwind.config.js          # Configuração Tailwind CSS
├── tsconfig.json               # Configuração TypeScript
├── components.json             # Configuração shadcn/ui
└── package.json                # Dependências e scripts
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Inicia em modo desenvolvimento |
| `bun run build` | Build para produção |
| `bun run preview` | Preview do build |
| `bun run build:win` | Build para Windows |
| `bun run build:mac` | Build para macOS |
| `bun run build:linux` | Build para Linux |
| `bun run lint` | Executa o ESLint |
| `bun run lint:fix` | Corrige erros do ESLint |
| `bun run typecheck` | Verifica tipos TypeScript |
| `bun run clean` | Limpa arquivos de build |

### Adicionando Componentes shadcn/ui

```bash
# O projeto já inclui os componentes necessários
# Para adicionar novos, copie de: https://ui.shadcn.com/docs/components
```

## Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| [Electron](https://www.electronjs.org/) | 28+ | Framework para apps desktop |
| [React](https://react.dev/) | 18+ | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5+ | Superset tipado de JavaScript |
| [Vite](https://vitejs.dev/) | 5+ | Build tool e dev server |
| [electron-vite](https://electron-vite.org/) | 2+ | Integração Electron + Vite |
| [Tailwind CSS](https://tailwindcss.com/) | 3+ | Framework CSS utility-first |
| [shadcn/ui](https://ui.shadcn.com/) | - | Componentes UI acessíveis |
| [Zustand](https://zustand-demo.pmnd.rs/) | 4+ | Gerenciamento de estado |
| [Konva](https://konvajs.org/) | 9+ | Canvas 2D para React |
| [Lucide](https://lucide.dev/) | - | Ícones SVG |
| [Bun](https://bun.sh/) | 1+ | Runtime JavaScript rápido |

## Contribuição

Contribuições são muito bem-vindas! Veja o [Guia de Contribuição](.github/CONTRIBUTING.md) para detalhes.

### Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/desktop-apresentation.git`
3. **Crie uma branch**: `git checkout -b feature/nova-funcionalidade`
4. **Faça suas alterações** e commit: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para seu fork: `git push origin feature/nova-funcionalidade`
6. Abra um **Pull Request**

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Manutenção

## Roadmap

- [ ] Salvar/carregar anotações como arquivo
- [ ] Camadas (layers) para organizar desenhos
- [ ] Gravar tela com anotações
- [ ] Zoom e pan no canvas
- [ ] Mais formas: estrela, polígono, nuvem de fala
- [ ] Temas claro/escuro personalizáveis
- [ ] Exportar como imagem (PNG/SVG)
- [ ] Suporte a touch/stylus
- [ ] Múltiplos monitores

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<p align="center">
  Feito com ❤️ pela comunidade
</p>

<p align="center">
  <a href="https://github.com/in100tiva/desktop-apresentation/issues">Reportar Bug</a> •
  <a href="https://github.com/in100tiva/desktop-apresentation/issues">Solicitar Feature</a>
</p>
