# 🚀 SDLC Studio

<div align="center">

**AI-Powered Software Development Lifecycle Automation Platform**

*From Idea to Deployed Code — Powered by AI*

<div>
---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [SDLC Stages](#-sdlc-stages)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Configuration](#-configuration)
- [Development Guide](#-development-guide)
- [Recent Updates](#-recent-updates)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 📊 Executive Summary

SDLC Studio is an enterprise-grade platform that revolutionizes software development by automating the entire Software Development Lifecycle (SDLC) using specialized AI agents. The platform transforms initial project ideas into production-ready code through seven structured stages, each powered by domain-specific AI specialists.

### Value Proposition

| Metric | Traditional Approach | With SDLC Studio |
|--------|---------------------|------------------|
| **Requirements Documentation** | 2-4 weeks | 2-4 hours |
| **Architecture Design** | 1-2 weeks | 30-60 minutes |
| **Initial Code Generation** | Weeks | Minutes |
| **Documentation Consistency** | Variable | 100% consistent |
| **Version Control** | Manual | Fully automated |

---

## 🎯 Problem Statement

### Current Industry Challenges

1. **Documentation Bottleneck**: 60% of development time spent on documentation and requirements gathering
2. **Knowledge Silos**: Critical project context lost between team handoffs
3. **Inconsistent Quality**: Variable artifact quality depending on individual expertise
4. **Slow Iteration**: Manual revision cycles extend project timelines
5. **Tool Fragmentation**: Multiple disconnected tools for different SDLC phases

### Target Users

- **Development Teams**: Accelerate project kickoff and maintain consistency
- **Project Managers**: Gain visibility into project artifacts and progress
- **Business Analysts**: Automate BRD and user story generation
- **Solutions Architects**: Quickly iterate on architecture options
- **Enterprise Organizations**: Standardize SDLC processes across teams

---

## 💡 Solution Overview

SDLC Studio provides an end-to-end automated pipeline that guides projects through seven structured stages:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              SDLC STUDIO PIPELINE                                     │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐        │
│ DISCOVER │  DEFINE  │  DESIGN  │ DEVELOP  │   TEST   │  BUILD   │ DELIVER  │        │
│    🔍    │    📋    │    🏗️    │    💻    │    🧪    │    📦    │    🚀    │        │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤        │
│ Problem  │   BRD    │  Arch    │  Code    │  Test    │  CI/CD   │ Deploy   │        │
│ Analysis │ Stories  │  Design  │   PRs    │  Plans   │  Config  │ Release  │        │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘        │
                                                                                        │
      AI Specialists: Business Analyst → Tech Writer → Solutions Architect → Developer  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Capabilities

- **AI-Powered Generation**: Specialized AI agents for each development phase
- **Context Preservation**: Full conversation history informs all artifact generation
- **Version Control**: Complete version history with compare and restore functionality
- **GitHub Integration**: Automated branches, issues, commits, and pull requests
- **Real-Time Collaboration**: Stage-specific chat with AI specialists
- **Progress Tracking**: Visual stage gates with live implementation progress

---

## ✨ Key Features

### 🤖 AI-Powered Automation

| Feature | Description |
|---------|-------------|
| **Specialized AI Agents** | Dedicated specialists for each stage (Business Analyst, Solutions Architect, Developer, etc.) |
| **Context-Aware Generation** | AI uses full conversation history and previous artifacts for informed decisions |
| **Iterative Refinement** | Regenerate any artifact with feedback to improve quality |
| **Multi-Model Support** | Configurable Azure OpenAI models (GPT-4, GPT-4o, etc.) |

### 📄 Artifact Management

| Feature | Description |
|---------|-------------|
| **Automatic Generation** | Problem statements, BRDs, user stories, architecture docs, and code |
| **Version History** | Track every change with full diff comparison |
| **Restore Capabilities** | Restore any previous version with one click |
| **Export Options** | Download artifacts as Markdown files |

### 🔄 GitHub Integration

| Feature | Description |
|---------|-------------|
| **Automated Workflows** | Create branches, issues, commits, and PRs automatically |
| **Secure Credentials** | AES-256 encrypted storage of GitHub tokens |
| **PR Generation** | Full implementation with proper GitHub linking (`Closes #N` syntax) |
| **Branch Management** | Feature branches per ticket with automatic naming |

### 📈 Progress Tracking

| Feature | Description |
|---------|-------------|
| **Real-Time Progress** | 5-step implementation tracking (Branch → Issue → Code → Commit → PR) |
| **Visual Stage Gates** | Clear indicators of completion status |
| **Activity Logging** | Complete audit trail of all project actions |
| **Implementation Status** | Live updates during code generation |

### 🔐 Security Features

| Feature | Description |
|---------|-------------|
| **Encrypted Credentials** | AES-256-GCM encryption for sensitive data |
| **Token Validation** | GitHub token validation before storage |
| **Session Management** | Secure user session handling |
| **Audit Logging** | Complete activity trail for compliance |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         React 18 + Vite + Tailwind                      ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      ││
│  │  │  Stage   │ │  Editor  │ │   Chat   │ │ Version  │ │  GitHub  │      ││
│  │  │Indicator │ │  Panel   │ │  Panel   │ │ History  │ │  Config  │      ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ REST API (HTTP/JSON)
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    FastAPI + Pydantic + SQLAlchemy                      ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      ││
│  │  │ Projects │ │Artifacts │ │   Chat   │ │ Versions │ │  GitHub  │      ││
│  │  │   API    │ │   API    │ │   API    │ │   API    │ │   API    │      ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   ││
│  │  │ Discover │ │  Define  │ │  Design  │ │ Develop  │                   ││
│  │  │   API    │ │   API    │ │   API    │ │   API    │                   ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │  AI Service  │ │   Artifact   │ │   Version    │ │    GitHub    │   ││
│  │  │ (OpenAI API) │ │   Service    │ │   Service    │ │   Service    │   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │   Discover   │ │    Define    │ │    Design    │ │   Develop    │   ││
│  │  │   Service    │ │   Service    │ │   Service    │ │   Service    │   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└────────────┬────────────────────────┬────────────────────────┬──────────────┘
             │                        │                        │
             ▼                        ▼                        ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│   PostgreSQL /     │  │   Azure OpenAI     │  │     GitHub API     │
│     SQLite         │  │   (GPT-4/GPT-4o)   │  │      (REST v3)     │
│    Database        │  │                    │  │                    │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

### Service Architecture

```
backend/app/
├── api/v1/                 # REST API endpoints
│   ├── projects.py         # Project CRUD operations
│   ├── artifacts.py        # Artifact management
│   ├── versions.py         # Version history API
│   ├── chat.py             # AI chat interface
│   ├── github.py           # GitHub integration
│   ├── discover.py         # Stage: Discover
│   ├── define.py           # Stage: Define
│   ├── design.py           # Stage: Design
│   └── develop.py          # Stage: Develop
│
├── services/               # Business logic layer
│   ├── ai_service.py       # Azure OpenAI integration
│   ├── artifact_service.py # Artifact CRUD & regeneration
│   ├── version_service.py  # Version history management
│   ├── chat_service.py     # Chat message handling
│   ├── project_service.py  # Project management
│   ├── github_service.py   # GitHub API integration
│   ├── discover_service.py # Problem analysis
│   ├── define_service.py   # BRD & stories generation
│   ├── design_service.py   # Architecture design
│   ├── develop_service.py  # Code generation & GitHub workflow
│   └── activity_service.py # Activity logging
│
├── models/                 # SQLAlchemy ORM models
│   ├── project.py          # Project entity
│   ├── artifact.py         # Artifact entity
│   ├── artifact_version.py # Version history
│   ├── chat_message.py     # Chat messages
│   ├── commit.py           # Commit tracking
│   ├── activity.py         # Activity log
│   └── gate_review.py      # Stage gate reviews
│
├── prompts/                # AI prompt templates
│   ├── discover_prompts.py # Problem statement prompts
│   ├── define_prompts.py   # BRD & stories prompts
│   ├── design_prompts.py   # Architecture prompts
│   ├── develop_prompts.py  # Code generation prompts
│   └── chat_prompts.py     # Chat agent prompts
│
└── core/                   # Core infrastructure
    ├── database.py         # Database connection
    ├── security.py         # Encryption utilities
    ├── progress.py         # Progress tracking
    └── exceptions.py       # Custom exceptions
```

---

## 🛠️ Tech Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core language |
| **FastAPI** | 0.100+ | Async REST API framework |
| **SQLAlchemy** | 2.0+ | Async ORM with type hints |
| **Pydantic** | 2.0+ | Data validation and settings |
| **PostgreSQL** | 15+ | Production database |
| **SQLite** | 3.x | Development database |
| **httpx** | 0.24+ | Async HTTP client |
| **cryptography** | 41+ | AES-256-GCM encryption |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI framework with hooks |
| **Vite** | 5+ | Fast build tool and dev server |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **Lucide React** | Latest | Icon library |
| **React Router** | 6+ | Client-side routing |

### External Integrations

| Service | Purpose | Features Used |
|---------|---------|---------------|
| **Azure OpenAI** | AI text generation | GPT-4, GPT-4o, Chat completions |
| **GitHub API** | Repository management | Repos, Issues, Branches, PRs, Commits |

---

## 🔄 SDLC Stages

### Stage 1: Discover 🔍

**Purpose**: Understand the problem space and stakeholders

**AI Specialist**: Business Analyst

**Artifacts Generated**:
- Problem Statement
- Stakeholder Analysis

**Features**:
- Natural language idea input
- Industry and team context
- Timeline estimation
- Stakeholder identification

### Stage 2: Define 📋

**Purpose**: Document business requirements and user needs

**AI Specialist**: Business Analyst / Technical Writer

**Artifacts Generated**:
- Business Requirements Document (BRD)
- User Stories with Acceptance Criteria

**Features**:
- Comprehensive BRD sections
- INVEST-compliant user stories
- Story point estimation
- Epic grouping

### Stage 3: Design 🏗️

**Purpose**: Create technical architecture

**AI Specialist**: Solutions Architect

**Artifacts Generated**:
- Architecture Options (3 alternatives)
- Final Architecture Document

**Features**:
- Multiple architecture options
- Trade-off analysis
- Technology recommendations
- Component diagrams
- Data flow documentation

### Stage 4: Develop 💻

**Purpose**: Generate implementation code

**AI Specialist**: Full-Stack Developer

**Artifacts Generated**:
- Development Tickets (JSON)
- Generated Code Files
- GitHub Issues
- Pull Requests

**Features**:
- Automatic ticket generation from artifacts
- AI-powered code generation
- GitHub workflow automation:
  - Feature branch creation
  - Issue creation with labels
  - File commits with proper messages
  - PR creation with `Closes #N` linking
- Real-time progress tracking (5 steps)

### Stage 5: Test 🧪 *(Coming Soon)*

**Purpose**: Create test plans and cases

**Artifacts Planned**:
- Test Plan
- Test Cases
- Test Data

### Stage 6: Build 📦 *(Coming Soon)*

**Purpose**: Configure CI/CD pipeline

**Artifacts Planned**:
- CI/CD Configuration
- Build Scripts
- Environment Configuration

### Stage 7: Deliver 🚀 *(Coming Soon)*

**Purpose**: Deploy and release

**Artifacts Planned**:
- Deployment Scripts
- Release Notes
- Runbook

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Azure OpenAI API access
- GitHub account (for GitHub integration)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-org/sdlc-studio.git
cd sdlc-studio

# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Application Settings
APP_NAME=SDLC Studio
DEBUG=true

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///./sdlc_studio.db
# For PostgreSQL production:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/sdlc_studio

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Security
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# CORS (for development)
CORS_ORIGINS=["http://localhost:5173"]
```

### Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/api/docs |
| **ReDoc** | http://localhost:8000/api/redoc |

---

## 📁 Project Structure

```
sdlc_studio/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── artifacts.py      # Artifact CRUD endpoints
│   │   │       ├── chat.py           # Chat API
│   │   │       ├── commits.py        # Commit tracking
│   │   │       ├── define.py         # Define stage API
│   │   │       ├── design.py         # Design stage API
│   │   │       ├── develop.py        # Develop stage API
│   │   │       ├── discover.py       # Discover stage API
│   │   │       ├── github.py         # GitHub integration API
│   │   │       ├── health.py         # Health check
│   │   │       ├── projects.py       # Project management
│   │   │       └── versions.py       # Version history API
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── database.py           # DB connection & session
│   │   │   ├── exceptions.py         # Custom exceptions
│   │   │   ├── progress.py           # Progress tracking
│   │   │   └── security.py           # Encryption utilities
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── activity.py           # Activity log model
│   │   │   ├── artifact.py           # Artifact model
│   │   │   ├── artifact_version.py   # Version history model
│   │   │   ├── base.py               # SQLAlchemy base
│   │   │   ├── chat_message.py       # Chat message model
│   │   │   ├── commit.py             # Commit model
│   │   │   ├── enums.py              # Enum definitions
│   │   │   ├── gate_review.py        # Stage gate model
│   │   │   └── project.py            # Project model
│   │   │
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   ├── chat_prompts.py       # Chat AI prompts
│   │   │   ├── define_prompts.py     # Define stage prompts
│   │   │   ├── design_prompts.py     # Design stage prompts
│   │   │   ├── develop_prompts.py    # Develop stage prompts
│   │   │   └── discover_prompts.py   # Discover stage prompts
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── artifact.py           # Artifact schemas
│   │   │   ├── base.py               # Base schemas
│   │   │   ├── chat.py               # Chat schemas
│   │   │   ├── github.py             # GitHub schemas
│   │   │   ├── project.py            # Project schemas
│   │   │   ├── stage_define.py       # Define stage schemas
│   │   │   ├── stage_design.py       # Design stage schemas
│   │   │   ├── stage_develop.py      # Develop stage schemas
│   │   │   └── stage_discover.py     # Discover stage schemas
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── activity_service.py   # Activity logging
│   │   │   ├── ai_service.py         # Azure OpenAI client
│   │   │   ├── artifact_service.py   # Artifact operations
│   │   │   ├── base.py               # Base service class
│   │   │   ├── chat_service.py       # Chat operations
│   │   │   ├── define_service.py     # Define stage logic
│   │   │   ├── design_service.py     # Design stage logic
│   │   │   ├── develop_service.py    # Develop stage logic
│   │   │   ├── discover_service.py   # Discover stage logic
│   │   │   ├── github_service.py     # GitHub API client
│   │   │   ├── project_service.py    # Project operations
│   │   │   └── version_service.py    # Version history
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── chat_context.py       # Chat history utilities
│   │   │   └── converters.py         # Data converters
│   │   │
│   │   ├── __init__.py
│   │   ├── config.py                 # Configuration settings
│   │   ├── dependencies.py           # FastAPI dependencies
│   │   └── main.py                   # Application entry point
│   │
│   ├── migrations/
│   │   └── 001_add_artifact_versions.sql
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_projects.py
│   │   ├── test_services.py
│   │   └── test_stages.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── AISpecialist.jsx    # AI chat interface
│   │   │   │   └── TeamChat.jsx        # Team collaboration
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── ErrorBoundary.jsx   # Error handling
│   │   │   │   ├── OnlineUsers.jsx     # User presence
│   │   │   │   └── WorkspaceTabs.jsx   # Tab navigation
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx          # App header
│   │   │   │   └── Sidebar.jsx         # Navigation sidebar
│   │   │   │
│   │   │   ├── project/
│   │   │   │   ├── EditorPanel.jsx     # Artifact editor
│   │   │   │   ├── GitHubConfigModal.jsx # GitHub setup
│   │   │   │   ├── HistoryTab.jsx      # Activity history
│   │   │   │   ├── ImplementationProgress.jsx # Progress tracker
│   │   │   │   ├── TicketList.jsx      # Dev tickets
│   │   │   │   └── VersionHistory.jsx  # Version control
│   │   │   │
│   │   │   └── stages/
│   │   │       ├── ArchitectureOptions.jsx  # Design options
│   │   │       ├── DefineInputPanel.jsx     # Define stage input
│   │   │       ├── DevelopStagePanel.jsx    # Develop stage
│   │   │       ├── DiscoverInputPanel.jsx   # Discover input
│   │   │       ├── StageGatePanel.jsx       # Stage gate UI
│   │   │       └── StageIndicator.jsx       # Progress indicator
│   │   │
│   │   ├── hooks/
│   │   │   ├── useApi.js             # API hook
│   │   │   └── useLocalStorage.js    # Storage hook
│   │   │
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx          # Authentication
│   │   │   ├── ProjectDashboard.jsx  # Dashboard view
│   │   │   ├── ProjectsPage.jsx      # Project list
│   │   │   └── WorkspaceView.jsx     # Main workspace
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css           # Global styles
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   └── formatters.js         # Data formatters
│   │   │
│   │   ├── App.jsx                   # Root component
│   │   └── main.jsx                  # Entry point
│   │
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 📡 API Reference

### Core Endpoints

#### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `PUT` | `/api/projects/{id}/stage` | Update current stage |

#### Artifacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/artifacts/{id}` | Get artifact by ID |
| `GET` | `/api/artifacts/project/{id}` | List project artifacts |
| `GET` | `/api/artifacts/project/{id}/stage/{stage}` | Get stage artifacts |
| `POST` | `/api/artifacts/regenerate` | Regenerate with feedback |

#### Version History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/versions/artifact/{id}` | Get version history |
| `GET` | `/api/versions/artifact/{id}/version/{n}` | Get specific version |
| `GET` | `/api/versions/artifact/{id}/compare` | Compare versions |
| `POST` | `/api/versions/artifact/{id}/restore/{n}` | Restore version |
| `GET` | `/api/versions/project/{id}/stats` | Project version stats |

#### SDLC Stages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/discover/analyze` | Generate Problem Statement |
| `POST` | `/api/define/generate-brd` | Generate BRD |
| `POST` | `/api/define/generate-stories` | Generate User Stories |
| `POST` | `/api/design/generate-options` | Generate Architecture Options |
| `POST` | `/api/design/generate-architecture` | Generate Final Architecture |
| `POST` | `/api/develop/generate-tickets` | Generate Dev Tickets |
| `POST` | `/api/develop/implement-ticket` | Implement Ticket |
| `GET` | `/api/develop/implementation-progress/{id}` | Get progress status |

#### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/projects/{id}/messages` | Get chat history |
| `POST` | `/api/chat/projects/{id}/messages` | Send message to AI |

#### GitHub Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/github/validate` | Validate credentials |
| `POST` | `/api/github/projects/{id}/config` | Save configuration |
| `GET` | `/api/github/projects/{id}/config` | Get configuration |

### Example API Calls

**Create a Project:**
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project",
    "description": "An AI-powered application",
    "created_by": "user123"
  }'
```

**Generate Problem Statement:**
```bash
curl -X POST http://localhost:8000/api/discover/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid-here",
    "idea_input": "I want to build a task management app...",
    "industry": "Technology",
    "team_size": "small",
    "timeline": "3 months"
  }'
```

**Compare Artifact Versions:**
```bash
curl "http://localhost:8000/api/versions/artifact/{artifact_id}/compare?v1=1&v2=2"
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│      projects       │
├─────────────────────┤
│ id (PK)             │──────────────────────────────────────────┐
│ name                │                                          │
│ description         │                                          │
│ current_stage       │                                          │
│ status              │                                          │
│ created_by          │                                          │
│ created_at          │                                          │
│ updated_at          │                                          │
│ meta_data           │                                          │
│ github_repository   │                                          │
│ github_token_enc    │                                          │
│ github_default_brch │                                          │
└─────────────────────┘                                          │
         │                                                        │
         │ 1:N                                                    │
         ▼                                                        │
┌─────────────────────┐                                          │
│     artifacts       │                                          │
├─────────────────────┤                                          │
│ id (PK)             │───────────────────────┐                  │
│ project_id (FK)     │◄──────────────────────│──────────────────┤
│ stage               │                       │                  │
│ artifact_type       │                       │                  │
│ name                │                       │                  │
│ content             │                       │                  │
│ version             │                       │                  │
│ created_by          │                       │                  │
│ created_at          │                       │                  │
│ updated_at          │                       │                  │
│ meta_data           │                       │                  │
└─────────────────────┘                       │                  │
         │                                    │                  │
         │ 1:N                                │                  │
         ▼                                    │                  │
┌─────────────────────┐                       │                  │
│  artifact_versions  │                       │                  │
├─────────────────────┤                       │                  │
│ id (PK)             │                       │                  │
│ artifact_id (FK)    │◄──────────────────────┘                  │
│ project_id (FK)     │◄─────────────────────────────────────────┤
│ version_number      │                                          │
│ content             │                                          │
│ name                │                                          │
│ stage               │                                          │
│ artifact_type       │                                          │
│ created_by          │                                          │
│ created_at          │                                          │
│ change_summary      │                                          │
│ meta_data           │                                          │
└─────────────────────┘                                          │
                                                                 │
┌─────────────────────┐     ┌─────────────────────┐              │
│   chat_messages     │     │     activities      │              │
├─────────────────────┤     ├─────────────────────┤              │
│ id (PK)             │     │ id (PK)             │              │
│ project_id (FK)     │◄────│ project_id (FK)     │◄─────────────┤
│ stage               │     │ user_id             │              │
│ role                │     │ action              │              │
│ content             │     │ details             │              │
│ created_by          │     │ created_at          │              │
│ created_at          │     └─────────────────────┘              │
│ meta_data           │                                          │
└─────────────────────┘                                          │
                                                                 │
┌─────────────────────┐     ┌─────────────────────┐              │
│      commits        │     │    gate_reviews     │              │
├─────────────────────┤     ├─────────────────────┤              │
│ id (PK)             │     │ id (PK)             │              │
│ project_id (FK)     │◄────│ project_id (FK)     │◄─────────────┘
│ stage               │     │ stage               │
│ author_id           │     │ status              │
│ message             │     │ reviewer            │
│ changes             │     │ comments            │
│ created_at          │     │ reviewed_at         │
└─────────────────────┘     └─────────────────────┘
```

### Enum Definitions

**StageType:**
```python
class StageType(str, Enum):
    DISCOVER = "discover"
    DEFINE = "define"
    DESIGN = "design"
    DEVELOP = "develop"
    TEST = "test"
    BUILD = "build"
    DEPLOY = "deploy"
```

**ArtifactType:**
```python
class ArtifactType(str, Enum):
    PROBLEM_STATEMENT = "problem_statement"
    STAKEHOLDER_ANALYSIS = "stakeholder_analysis"
    BRD = "brd"
    USER_STORIES = "user_stories"
    SOLUTION_OPTIONS = "solution_options"
    ARCHITECTURE = "architecture"
    SDD = "sdd"
    DEV_TICKETS = "dev_tickets"
    CODE = "code"
    API_SPEC = "api_spec"
    TEST_PLAN = "test_plan"
    TEST_CASES = "test_cases"
    CI_CD_CONFIG = "ci_cd_config"
    DEPLOYMENT_SCRIPT = "deployment_script"
    RELEASE_NOTES = "release_notes"
```

---

## ⚙️ Configuration

### Backend Configuration

```python
# app/config.py
class Settings:
    # Application
    app_name: str = "SDLC Studio"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./sdlc_studio.db"
    
    # Azure OpenAI
    azure_openai_endpoint: str
    azure_openai_key: str
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-02-15-preview"
    
    # Security
    encryption_key: str  # 32-byte key for AES-256-GCM
    
    # CORS
    cors_origins: list = ["http://localhost:5173"]
```

### Frontend Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 🧑‍💻 Development Guide

### Running Tests

```bash
# Backend tests
cd backend
pytest -v

# Frontend tests (if configured)
cd frontend
npm test
```

### Code Style

**Backend (Python):**
- Follow PEP 8 guidelines
- Use type hints for all functions
- Async/await for all database operations
- Docstrings for all public methods

**Frontend (JavaScript/React):**
- Functional components with hooks
- ES6+ syntax
- Tailwind CSS for styling
- Prop types or TypeScript for type safety

### Adding a New Stage

1. **Backend Service**: Create `backend/app/services/{stage}_service.py`
2. **Backend Prompts**: Create `backend/app/prompts/{stage}_prompts.py`
3. **Backend API**: Create `backend/app/api/v1/{stage}.py`
4. **Backend Schemas**: Create `backend/app/schemas/stage_{stage}.py`
5. **Frontend Component**: Create `frontend/src/components/stages/{Stage}Panel.jsx`
6. **Update Enums**: Add new artifact types to `enums.py`
7. **Update Router**: Register new router in `api/v1/__init__.py`

---

## 🆕 Recent Updates

### Version 2.1.0 (February 2026)

#### ✨ New Features

- **Version History System**: Complete version tracking with compare and restore
  - Timeline view showing all artifact versions
  - Side-by-side diff comparison
  - One-click restore to any previous version
  
- **Real-Time Implementation Progress**: 5-step progress tracking
  - Visual progress bar with animated steps
  - Live status updates during code generation
  - Step indicators: Branch → Issue → Code → Commit → PR

- **Enhanced GitHub Integration**:
  - Automatic feature branch creation
  - GitHub issue creation with labels
  - File commits with descriptive messages
  - PR creation with `Closes #N` syntax

#### 🐛 Bug Fixes

- Fixed artifact lookup reliability with specific name queries
- Fixed ticket status update 404 errors
- Fixed "Implement This Ticket" button click handling
- Improved error handling in develop stage

---

## 🗺️ Roadmap

### ✅ Completed (v2.1)

- [x] **Discover Stage** - Problem Statement & Stakeholder Analysis
- [x] **Define Stage** - BRD & User Stories
- [x] **Design Stage** - Architecture Options & Selection
- [x] **Develop Stage** - Ticket Generation & Implementation
- [x] **GitHub Integration** - Full workflow automation
- [x] **Real-time Progress Tracking** - 5-step implementation monitor
- [x] **Version History** - Compare & Restore capabilities
- [x] **AI Chat** - Stage-specific specialists

### 🚧 In Progress

- [ ] **Test Stage** - Test Plan & Cases Generation
- [ ] **Build Stage** - CI/CD Configuration
- [ ] **Deliver Stage** - Deployment & Release Notes

### 📋 Planned Features

- [ ] Multi-user collaboration with real-time sync
- [ ] Role-based access control (RBAC)
- [ ] Project templates and blueprints
- [ ] Custom AI prompt configuration
- [ ] Jira integration
- [ ] Azure DevOps integration
- [ ] Slack/Teams notifications
- [ ] Export to Confluence
- [ ] Analytics dashboard
- [ ] AI model fine-tuning options

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and patterns
- Include tests for new features
- Update documentation as needed
- Keep PRs focused on a single feature/fix

---

## 📄 License

This project is proprietary software developed for enterprise use.

---

## 📞 Support

For questions, issues, or feature requests:

- **Email**: support@sdlcstudio.io
- **Issue Tracker**: GitHub Issues
- **Documentation**: `/api/docs` (Swagger UI)

---

<div align="center">

*SDLC Studio — From Idea to Deployment, Powered by AI*

© 2026 SDLC Studio. All rights reserved.

</div>
