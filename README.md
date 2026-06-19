<div align="center">

# Banco de Prompts · TV Mirante

**Biblioteca corporativa de prompts de IA — organizada por setor e categoria, com gestão de acessos, favoritos, histórico, likes, analytics e painel de administração completo.**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

[Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Arquitetura](#-arquitetura) · [Regras de Negócio](#-regras-de-negócio) · [Segurança](#-segurança) · [Instalação](#-instalação)

</div>

---

## 🔎 Visão Geral

O **Banco de Prompts** é uma plataforma interna da **TV Mirante** para centralizar, organizar e compartilhar prompts de IA entre as equipes. Cada colaborador acessa apenas os prompts do seu setor, pode favoritar os que usa com frequência, curtir, acompanhar o histórico de cópias e criar os seus próprios prompts.

O painel de administração permite gerenciar prompts, usuários, setores, categorias e visualizar métricas de uso — tudo em um design moderno com dark mode, animações fluidas e responsividade total.

---

## ✨ Funcionalidades

### Para todos os usuários

| | Funcionalidade | Descrição |
|---|---|---|
| 🔐 | **Login corporativo** | Google Sign-In restrito ao domínio `@mirante.com.br` |
| 🗂️ | **Biblioteca de prompts** | Filtros por setor, categoria, modelo de IA e dificuldade; busca em tempo real; ordenação; contagem cross-filtered |
| ✍️ | **Criar prompts** | Qualquer colaborador logado pode publicar prompts na biblioteca |
| ✏️ | **Editar e excluir os próprios** | O criador pode editar e excluir o que publicou sem precisar ser admin |
| ❤️ | **Favoritos** | Salva e acessa prompts favoritos em qualquer dispositivo (persistido no Firestore) |
| 👍 | **Likes** | Curte prompts; contador visível no card e na página de detalhe |
| 📋 | **Copiar com um clique** | Copia o conteúdo para a área de transferência; contador de cópias atualizado em tempo real |
| 🕓 | **Histórico** | Registro local dos últimos prompts copiados, com exportação em `.txt` |
| 👁️ | **Contadores** | Visualizações e cópias exibidas no card e na página de detalhe |
| 🌟 | **Destaques** | Seções colapsáveis de prompts Mirante IA e em destaque na Home |
| 📄 | **Paginação** | 20 prompts por página na Home e no painel admin |
| 🎨 | **Dark mode** | Alternância entre modo claro e escuro, persistida localmente |
| 📱 | **100% responsivo** | Bottom nav flutuante no mobile, sidebar no desktop |

### Para administradores

| | Funcionalidade | Descrição |
|---|---|---|
| 🛡️ | **Painel Admin** | Abas para Prompts, Usuários, Setores, Categorias e Analytics |
| 🔧 | **Gestão de prompts** | Criar, editar, excluir e marcar como destaque qualquer prompt |
| 👥 | **Gestão de usuários** | Ver colaboradores, alterar setores de acesso, promover papéis |
| 🏷️ | **Setores e categorias** | Criar, editar e organizar a taxonomia de prompts |
| 📊 | **Analytics** | Prompts mais copiados, mais vistos, distribuição por setor e modelo de IA |

---

## 🚀 Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| UI | React + React Router | 19 / v7 |
| Estilo | Tailwind CSS + design system próprio | v4 |
| Animações | Framer Motion (scroll-triggered, 3D tilt, spring physics) | v12 |
| Estado servidor | TanStack React Query (cache 5 min, invalidação) | v5 |
| Backend / BD | Firebase (Firestore + Authentication) | v12 |
| Componentes | Radix UI + Shadcn (acessibilidade headless) | — |
| Notificações | Sonner (toast) | v2 |
| Ícones | Lucide React | — |
| Build | Vite | v7 |

---

## 🏗️ Arquitetura

```
bancodeprompts-mirante/
├── .env.example                # Template de variáveis de ambiente
├── firestore.rules             # Regras de segurança do Firestore (versionadas)
│
└── src/
    ├── App.jsx                 # Roteamento + providers globais
    ├── main.jsx                # Entry point
    ├── index.css               # Design tokens, keyframes, utilities globais
    │
    ├── assets/
    │   └── logo_mirante.png
    │
    ├── context/
    │   ├── AuthContext.jsx     # Estado de autenticação, perfil, papéis
    │   └── ThemeContext.jsx    # Dark / light mode
    │
    ├── firebaseClient/
    │   ├── config.js           # Inicialização do Firebase
    │   ├── auth.js             # signInWithGoogle, logout
    │   ├── prompts.js          # CRUD + incrementViewCount / CopyCount
    │   ├── users.js            # getUserProfile, createUser, updateUser, getUsers
    │   ├── sectors.js          # getSectors, createSector, updateSector, deleteSector
    │   ├── categories.js       # getCategories, createCategory, ...
    │   ├── favorites.js        # getFavoritesByUser, toggleFavorite
    │   ├── likes.js            # getLikesByUser, toggleLike
    │   ├── history.js          # getHistory, addToHistory (localStorage)
    │   └── stats.js            # addPlatformTime (tempo de sessão)
    │
    ├── hooks/
    │   ├── useFavorites.js     # React Query + toggle com atualização otimista
    │   ├── useLikes.js         # React Query + toggle de likes
    │   └── useHistory.js       # Histórico de cópias (localStorage)
    │
    ├── pages/
    │   ├── LoginPage.jsx       # Tela de login com domínio restrito
    │   ├── HomePage.jsx        # Grid principal + filtros + hero + FAB
    │   ├── PromptDetailPage.jsx# Visualização e ações do prompt individual
    │   ├── FavoritesPage.jsx   # Biblioteca de favoritos do usuário
    │   ├── HistoryPage.jsx     # Histórico de prompts copiados + exportação .txt
    │   ├── ProfilePage.jsx     # Dados do usuário, tema, logout
    │   └── AdminPage.jsx       # Painel de administração (5 abas)
    │
    └── components/
        ├── layout/
        │   ├── AppLayout.jsx   # Sidebar + Navbar + transições de página + MouseFollower
        │   ├── Sidebar.jsx     # Navegação lateral (desktop lg+)
        │   ├── Navbar.jsx      # Barra superior responsiva + user menu
        │   └── MobileNav.jsx   # Bottom nav flutuante com glass effect (mobile)
        │
        ├── prompts/
        │   ├── PromptCard.jsx  # Card com 3D tilt, glow, shimmer, contadores
        │   ├── PromptGrid.jsx  # Grid responsivo com permissões
        │   ├── SearchBar.jsx   # Filtros com contagem cross-filtered
        │   ├── AiBadge.jsx     # Badge do modelo de IA (cor por modelo)
        │   └── DifficultyBadge.jsx
        │
        ├── admin/
        │   ├── PromptEditorModal.jsx
        │   ├── PromptsTab.jsx
        │   ├── UsersTab.jsx
        │   ├── SectorsTab.jsx
        │   ├── CategoriesTab.jsx
        │   └── AnalyticsTab.jsx
        │
        ├── ui/
        │   ├── MouseFollower.jsx   # Orb que segue o cursor (spring physics)
        │   ├── confirm-modal.jsx
        │   ├── checkbox.jsx
        │   ├── native-select.jsx
        │   └── ...                 # Primitivos Radix / Shadcn
        │
        ├── ProfileSetupModal.jsx   # Seleção de setor no primeiro login
        └── SessionTracker.jsx      # Rastreia tempo de sessão → Firestore
```

### Coleções no Firestore

| Coleção | Conteúdo |
|---|---|
| `users/{uid}` | Perfil, papel (`typeUser`), setores (`sectorIds`) |
| `users/{uid}/favorites/{id}` | Favoritos do usuário (subcollection) |
| `users/{uid}/likes/{id}` | Likes do usuário (subcollection) |
| `user_stats/{uid}` | Tempo total de sessão na plataforma |
| `sectors/{id}` | Nome, ícone do setor |
| `categories/{id}` | Nome, cor, setor pai (`sectorId`) |
| `prompts/{id}` | Conteúdo completo, metadados, contadores, referências |

### Campos do documento `prompts/{id}`

```js
{
  title:             string,
  short_description: string,
  content:           string,       // O prompt em si
  instructions:      string,       // Como usar (opcional)
  observations:      string,       // Notas adicionais (opcional)
  ai_model:          string,       // "ChatGPT" | "Claude" | "Gemini" | ...
  difficulty:        string,       // "Iniciante" | "Intermediário" | "Avançado"
  is_mirante_ia:     boolean,      // Exibe na seção "Mirante IA" da Home
  is_featured:       boolean,
  sectorIds:         string[],     // Array de IDs de setor (suportado)
  sectorId:          string,       // ID de setor único (legado, ainda suportado)
  categoryIds:       string[],     // Array de IDs de categoria (suportado)
  categoryId:        string,       // ID de categoria único (legado)
  createdAt:         Timestamp,
  updatedAt:         Timestamp,
  createdBy:         string,       // UID do criador (imutável)
  createdByName:     string,
  updatedBy:         string,
  updatedByName:     string,
  viewCount:         number,
  copyCount:         number,
  likesCount:        number,
}
```

---

## 📐 Regras de Negócio

### Autenticação

- Login exclusivo via **Google OAuth** — apenas contas `@mirante.com.br` são aceitas.
- O bloqueio ocorre em **dois níveis**: `AuthContext` (frontend) e Firestore Rules (backend).
- Na primeira autenticação, o documento `users/{uid}` é criado automaticamente com `typeUser: "user"`.
- O usuário é direcionado ao **modal de seleção de setor** logo após o primeiro login; pode pular e configurar depois.

### Papéis (`typeUser`)

| Papel | Atribuído por | Permissões |
|---|---|---|
| `user` | Sistema (primeiro login) | Ver prompts do setor, criar/editar/excluir os próprios, favoritar, curtir, copiar |
| `admin` | `superadmin` | Tudo de `user` + gerenciar qualquer prompt, usuários, setores, categorias, analytics |
| `superadmin` | Outro `superadmin` | Tudo de `admin` + promover/rebaixar papéis de qualquer usuário |

### Acesso a prompts

- Usuários veem **apenas prompts dos setores selecionados no perfil**.
- Admin e superadmin veem **todos os prompts** independente de setor.
- A filtragem é feita no cliente após o Firestore aplicar as regras de segurança.

### Criação e edição

- **Qualquer usuário logado** pode criar prompts (FAB visível na Home).
- O criador é registrado em `createdBy: uid` — campo **imutável** após criação.
- O criador pode **editar e excluir os próprios prompts** diretamente no card ou na página de detalhe.
- Admins podem editar e excluir **qualquer prompt** da biblioteca.

### Favoritos e Likes

- Favoritos ficam em `users/{uid}/favorites/` — **privados por usuário**.
- Likes ficam em `users/{uid}/likes/` e incrementam `likesCount` no prompt.
- Ambos gerenciados com toggle otimista via React Query — a UI atualiza antes da confirmação do servidor.

### Histórico

- Armazenado em `localStorage` — sem necessidade de autenticação para leitura.
- Registra cada prompt copiado com título, data e hora.
- Exportável como arquivo `.txt` diretamente da página de Histórico.

### Contadores (`viewCount`, `copyCount`, `likesCount`)

- Qualquer usuário autenticado pode incrementar esses campos.

### Setores e categorias

- Apenas admins criam, editam e excluem setores e categorias.
- Categorias têm um `sectorId` pai — o filtro de categorias na SearchBar é contextual ao setor selecionado.
- Prompts suportam múltiplos setores (`sectorIds[]`) e múltiplas categorias (`categoryIds[]`), com retrocompatibilidade aos campos singulares legados.

---

## 🔒 Segurança

As regras de segurança estão versionadas em [`firestore.rules`](./firestore.rules).

Para publicar no Firebase:
```
Firebase Console → Firestore → Regras → Cole o conteúdo → Publicar
```

### Permissões por coleção

| Coleção | Leitura | Escrita |
|---|---|---|
| `users/{uid}` | Próprio usuário ou qualquer autenticado | Próprio usuário, admin |
| `users/{uid}/favorites/*` | Próprio usuário | Próprio usuário |
| `users/{uid}/likes/*` | Próprio usuário | Próprio usuário |
| `user_stats/{uid}` | Próprio ou admin | Próprio usuário |
| `sectors/*` | Qualquer autenticado | Admin |
| `categories/*` | Qualquer autenticado | Admin |
| `prompts/*` | Qualquer autenticado | Admin + criador (próprio) |

### Pontos de segurança

- `typeUser` nunca pode ser auto-atribuído — requer `superadmin`
- `createdBy` é imutável — ninguém pode reatribuir a autoria de um prompt
- Restrição de domínio aplicada em duas camadas: `AuthContext` (UI) + Firestore Rules (banco)

---

## 💻 Instalação

### Pré-requisitos

- Node.js 18+
- Projeto Firebase com **Firestore** + **Authentication** (Google provider) habilitados

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/bancodeprompts-mirante.git
cd bancodeprompts-mirante
npm install
```

### 2. Configure o Firebase

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> As credenciais estão em: **Firebase Console → Configurações do projeto → Seus apps → SDK Config**

### 3. Publique as regras do Firestore

No Firebase Console → Firestore → Regras, cole o conteúdo de [`firestore.rules`](./firestore.rules) e publique.

### 4. Rode em desenvolvimento

```bash
npm run dev
```

Disponível em `http://localhost:5173`

### 5. Build de produção

```bash
npm run build
```

O output fica em `dist/`. Compatível com Vercel, Netlify, Firebase Hosting e qualquer CDN estático.

> **SPA routing:** Se usar Netlify ou Render, adicione um arquivo `public/_redirects` com `/* /index.html 200` para o React Router funcionar ao recarregar a página.

---

## 🛣️ Rotas

| Rota | Componente | Acesso |
|---|---|---|
| `/login` | `LoginPage` | Público (redireciona se já logado) |
| `/` | `HomePage` | Autenticado |
| `/prompt/:id` | `PromptDetailPage` | Autenticado |
| `/favorites` | `FavoritesPage` | Autenticado |
| `/history` | `HistoryPage` | Autenticado |
| `/profile` | `ProfilePage` | Autenticado |
| `/admin` | `AdminPage` | Admin / SuperAdmin |
| `*` | — | Redireciona para `/` |

---

## 🎨 Design System

- **Paleta:** off-white `#f7f7fb` (background) + `#ffffff` (cards) no claro; `#09090c` / `#111116` no escuro
- **Primário:** indigo `#4f46e5` (claro) / `#6366f1` (escuro)
- **Sombras:** sistema de 6 níveis (`shadow-xs` → `shadow-elevated`) inspirado no Stripe
- **Easing:** três curvas customizadas (`--ease-spring`, `--ease-smooth`, `--ease-snappy`)

### Animações

| Elemento | Animação |
|---|---|
| Cards | `whileInView` com stagger por índice ao fazer scroll |
| Cards (hover) | 3D tilt + glow radial rastreando o cursor via DOM direto |
| Cards (hover) | Shimmer no accent bar superior |
| Hero | Logo flutuante com animação loop suave |
| Cursor | `MouseFollower` — dois orbs com spring physics globais |
| Páginas | `AnimatePresence` fade + slide entre rotas |
| FAB | Ripple ring pulsante em loop |
| Sidebar | Micro-interação de scale + rotate nos ícones |
| StatPills | Count-up animado com easing ease-out cúbico |

---

## 📜 Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (com --host para LAN)
npm run build    # Build de produção
npm run preview  # Preview do build local
npm run lint     # Lint com ESLint
```

---

<div align="center">
  <sub>Construído com ❤️ para a equipe de tecnologia da <strong>TV Mirante</strong>.</sub>
</div>
