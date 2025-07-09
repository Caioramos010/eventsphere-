# EventSphere 🌟

**EventSphere** é uma plataforma completa para criação, gestão e participação em eventos, desenvolvida com React no frontend e Java Spring Boot no backend.

## 🚀 Funcionalidades

### 👤 Gestão de Usuários
- Cadastro e login de usuários
- Perfil personalizado com foto
- Autenticação JWT segura

### 🎪 Gestão de Eventos
- **Criação de eventos** com informações detalhadas
- **Upload de imagens** para eventos
- **Estados do evento**: Criado, Ativo, Finalizado, Cancelado
- **Controle de acesso**: Eventos públicos e privados
- **Limite de participantes** configurável

### 🎫 Sistema de Convites
- **Convites por link** com token único
- **Códigos de evento** de 8 caracteres
- **Validação automática** de convites
- **Fluxo otimizado** de registro via convite

### 👥 Participação
- **Participação em eventos públicos**
- **Sistema de colaboradores** para auxílio na organização
- **Status de participação**: Convidado, Confirmado, Presente
- **Marcação automática** do organizador como presente

### 📊 Interface Moderna
- **Modais padronizados** para todas as ações
- **Filtros avançados** por status e tipo
- **Design responsivo** para todos os dispositivos
- **Feedback visual** em tempo real

## 🏗️ Arquitetura

```
eventsphere-/
├── backend/                # Backend Java Spring Boot
│   └── EventSphere/
│       ├── src/main/java/com/eventsphere/
│       │   ├── controller/     # Controllers REST
│       │   ├── service/        # Lógica de negócio
│       │   ├── entity/         # Entidades JPA
│       │   ├── repository/     # Repositórios
│       │   ├── dto/           # Data Transfer Objects
│       │   └── mapper/        # Mapeamento DTO ↔ Entity
│       ├── pom.xml
│       └── Dockerfile
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços de API
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   └── styles/           # Estilos CSS
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── mysql-init/             # Scripts de inicialização do banco
├── docker-compose.yml      # Orquestração dos containers
└── .env                    # Variáveis de ambiente
```

## 🐳 Como Executar

### Pré-requisitos
- **Docker** e **Docker Compose**
- **Node.js 18+** (para desenvolvimento local)
- **Java 17+** (para desenvolvimento local)

### 🚀 Execução com Docker (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd eventsphere-

# Suba todos os serviços
docker-compose up --build

# Acesso:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# MySQL: localhost:3307
```

### 💻 Desenvolvimento Local

#### Backend
```bash
cd backend/EventSphere
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```properties
# Banco de Dados
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=eventsphere
MYSQL_USER=eventsphere
MYSQL_PASSWORD=eventspherepass
MYSQL_PORT=3307

# Segurança
JWT_SECRET=eventSphereSecretKey2024ForProduction

# Spring Boot
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/eventsphere?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=eventsphere
SPRING_DATASOURCE_PASSWORD=eventspherepass
```

## 🎯 Principais Endpoints

### Autenticação
- `POST /login/accept` - Login de usuário
- `POST /register/accept` - Registro de usuário

### Eventos
- `GET /api/event/my` - Eventos do usuário (ativos)
- `GET /api/event/all-my` - Todos os eventos do usuário
- `GET /api/event/public` - Eventos públicos
- `POST /api/event/register` - Criar evento
- `PUT /api/event/{id}/start` - Iniciar evento
- `PUT /api/event/{id}/finish` - Finalizar evento

### Convites
- `GET /api/event/{id}/invite` - Gerar link de convite
- `GET /api/event/invite/{token}` - Validar convite
- `POST /api/participant/join/{token}` - Participar via convite

## 🧩 Componentes Principais

### Frontend
- **StandardModal** - Sistema de modais padronizados
- **EventCard** - Card de exibição de eventos
- **StandardButton** - Botões padronizados
- **Header/Footer** - Layout principal

### Backend
- **EventService** - Lógica de negócio de eventos
- **ParticipantService** - Gestão de participantes
- **UserService** - Gestão de usuários
- **AuthController** - Autenticação e autorização

## 🚀 Tecnologias

### Frontend
- **React 18** com Hooks
- **React Router** para navegação
- **CSS Modules** com variáveis CSS
- **React Icons** para ícones
- **Fetch API** para requisições

### Backend
- **Spring Boot 3**
- **Spring Security** com JWT
- **Spring Data JPA**
- **MySQL** como banco de dados
- **Bean Validation** para validações

### DevOps
- **Docker** e **Docker Compose**
- **MySQL** com healthcheck
- **Nginx** para servir frontend em produção

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints para:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🔒 Segurança

- **JWT** para autenticação
- **Validação** de entrada em frontend e backend
- **Sanitização** de dados
- **Controle de permissões** por roles
- **Proteção CORS** configurada

## 🎨 Design System

- **Variáveis CSS** centralizadas
- **Componentes padronizados**
- **Tema consistente** em toda aplicação
- **Modais unificados** para ações

## 📝 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para facilitar a organização de eventos**
