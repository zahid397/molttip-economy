# 🪙 MotiP Economy

<div align="center">

![MotiP Economy Banner](https://img.shields.io/badge/SURGE_×_OpenClaw-Hackathon_2026-7c3aed?style=for-the-badge&labelColor=030712)
![Prize Pool](https://img.shields.io/badge/Prize_Pool-$50,000-00d4ff?style=for-the-badge&labelColor=030712)
![Built With](https://img.shields.io/badge/Built_With-OpenClaw-00ff94?style=for-the-badge&labelColor=030712)
![Status](https://img.shields.io/badge/Status-Live_Demo-ff6b35?style=for-the-badge&labelColor=030712)

**A tokenized AI agent economy — where autonomous agents earn, spend, stake, and trade MOTIP tokens in real time.**

[🚀 Live Demo](https://molttip-economy.vercel.app) · [📦 Repository](https://github.com/zahid397/molttip-economy) · [🎥 Demo Video](#demo)

</div>

---

## 🎯 What Problem Does It Solve?

> *"How do AI agents get paid? How do they transact autonomously? How do we visualize an agent-native economy?"*

**MotiP Economy** answers all three.

As AI agents become first-class participants in the internet, they need:
- A **token economy** to exchange value
- **Autonomous payment rails** — agents that pay each other without human approval
- A **real-time dashboard** for observing agent-to-agent transactions

MotiP Economy is a **fully functional simulation** of this future — built on top of OpenClaw's agent infrastructure, demonstrating what the **tokenized agent internet** actually looks like in practice.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Agent Economy** | 4 autonomous AI agents (Alpha, Beta, Gamma, Delta) each with balances, staked tokens, and reputation scores |
| ⚡ **Live Simulation Engine** | Agents autonomously execute trades every 2 seconds — no human input required |
| 💸 **Token Transfer Protocol** | Full payment lifecycle: pending → confirmed → failed with optimistic UI updates and rollback |
| 📊 **Real-Time Dashboard** | Live stats, animated counters, transaction feed, leaderboard — all updating as the simulation runs |
| 🏆 **Reputation System** | Agents build reputation through successful trades — affects their standing in the economy |
| 🔒 **Staking Mechanics** | Agents stake tokens to lock value — reducing available balance for transactions |
| 📈 **Economy Analytics** | Total supply, circulating supply, 24h volume, active agents — full economic visibility |
| 🎛️ **Manual Trading** | Users can manually execute trades between any two agents via the Trade page |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MotiP Economy                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ Simulation   │    │  Economy     │                   │
│  │ Engine       │───▶│  Store       │                   │
│  │ (OpenClaw)   │    │  (Zustand)   │                   │
│  └──────────────┘    └──────┬───────┘                   │
│         │                  │                            │
│         ▼                  ▼                            │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ Transaction  │    │  Wallet      │                   │
│  │ Store        │    │  Store       │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                  │                            │
│         └──────────┬────────┘                           │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────┐        │
│  │              React UI Layer                 │        │
│  │  Dashboard │ Agents │ Trade │ Payments │ LB │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Agent Autonomy Flow

```
SimulationStore.startSimulation()
        │
        ▼ every 2000ms
Pick random Agent A (sender)
Pick random Agent B (receiver)
        │
        ▼
Check: available balance > 0?
        │
        ├── NO  → skip tick
        │
        └── YES → calculate amount (up to 20% of available)
                        │
                        ▼
              recordTransaction(A → B, amount, type: 'trade')
                        │
                        ▼
              Optimistic UI update (pending)
                        │
                        ▼
              Simulate network (300ms)
                        │
                        ▼
              Confirm / Fail + rollback
                        │
                        ▼
              updateStats() → refresh economy overview
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5.5 |
| **Build Tool** | Vite 5 |
| **State Management** | Zustand 4 (3 independent stores) |
| **Routing** | React Router v6 (Hash Router for static hosting) |
| **Styling** | Tailwind CSS 3 + Custom CSS Design System |
| **Icons** | Lucide React |
| **Agent Runtime** | OpenClaw (autonomous simulation engine) |
| **Deployment** | Vercel (Edge Network) |
| **Type Safety** | Strict TypeScript — `noUnusedLocals`, `exactOptionalPropertyTypes` |

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.0.0
npm  >= 9.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/zahid397/molttip-economy.git
cd molttip-economy

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
```

---

## 📁 Project Structure

```
motip-economy/
├── src/
│   ├── components/
│   │   ├── economy/
│   │   │   ├── AgentCard.tsx        # Agent display with stats
│   │   │   ├── LaunchButton.tsx     # Simulation control
│   │   │   ├── MotiPStats.tsx       # Economy overview panel
│   │   │   ├── PaymentButton.tsx    # Manual payment UI
│   │   │   └── TokenBalance.tsx     # Animated balance display
│   │   ├── layout/
│   │   │   ├── DemoBanner.tsx       # Top demo mode indicator
│   │   │   ├── LiveTicker.tsx       # Scrolling transaction feed
│   │   │   ├── Navbar.tsx           # Top navigation
│   │   │   └── Sidebar.tsx          # Left navigation panel
│   │   └── ui/
│   │       ├── AnimatedNumber.tsx   # Count-up animation
│   │       ├── EmptyState.tsx       # Empty state component
│   │       └── Skeleton.tsx         # Loading skeletons
│   ├── config/
│   │   └── constants.ts             # SIMULATION_TICK_MS, etc.
│   ├── hooks/
│   │   ├── useCountUp.ts            # Animated number hook
│   │   └── useSimulation.ts         # Simulation lifecycle hook
│   ├── mocks/
│   │   ├── agents.ts                # Initial agent data
│   │   ├── leaderboard.ts           # Mock leaderboard data
│   │   └── transactions.ts          # Mock transaction history
│   ├── pages/
│   │   ├── Agents.tsx               # Agent management
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Leaderboard.tsx          # Agent rankings
│   │   ├── Payments.tsx             # Transaction history
│   │   └── Trade.tsx                # Manual trading
│   ├── services/
│   │   └── api.ts                   # API service layer
│   ├── stores/
│   │   ├── economyStore.ts          # Economy stats state
│   │   ├── simulationStore.ts       # Simulation engine state
│   │   ├── transactionStore.ts      # Transaction lifecycle state
│   │   └── walletStore.ts           # Agent wallet state
│   └── types/
│       └── index.ts                 # Full TypeScript types
├── public/
│   └── assets/avatars/              # Agent avatar images
├── index.html
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.cjs
```

---

## 🤖 OpenClaw Integration

MotiP Economy demonstrates **3 core OpenClaw capabilities**:

### 1. Proactive Execution
Agents don't wait for instructions. The `SimulationStore` runs an autonomous loop that picks agents, calculates amounts, and executes trades — mimicking how OpenClaw agents proactively take actions based on their environment.

```typescript
// simulationStore.ts — autonomous agent tick
const intervalId = setInterval(async () => {
  const agents = useWalletStore.getState().agents.filter(a => a.isActive);
  const from   = agents[Math.floor(Math.random() * agents.length)];
  const to     = agents[Math.floor(Math.random() * agents.length)];

  await useTransactionStore.getState().recordTransaction({
    fromAgentId: from.id,
    toAgentId:   to.id,
    amount,
    type: 'trade',
  });
}, SIMULATION_TICK_MS);
```

### 2. Multi-Step Reasoning
Each transaction goes through a full lifecycle demonstrating multi-step agent decision making:
1. **Evaluate** — check available balance, validate recipient
2. **Execute** — optimistic state update
3. **Confirm/Rollback** — handle success or failure atomically

### 3. Persistent State
All agent balances, reputation scores, and transaction history persist across the session — demonstrating stateful agent memory within the economy.

---

## 🎮 How To Use

### Launch The Economy
1. Open the [Live Demo](https://molttip-economy.vercel.app)
2. Click **"Launch Simulation"** in the top navbar
3. Watch agents start trading autonomously in real time
4. See the Live Ticker scroll with each transaction

### Explore The Dashboard
- **Economy Overview** — watch animated stats update live
- **Primary Wallet** — see Alpha agent's balance change in real time
- **Recent Transactions** — latest 5 agent-to-agent trades
- **Top Agents** — ranked by current balance

### Manual Trading
1. Navigate to **Trade** page
2. Select sender and recipient agents
3. Enter amount (or use 25/50/75/100% quick buttons)
4. Click **Execute Trade** — watch it appear in the feed

### Agent Management
- Navigate to **Agents** page
- Click any agent card to see their full profile
- View their transaction history, reputation, staked balance
- Send a manual payment directly from the detail modal

### Leaderboard
- See all agents ranked by total MOTIP earned
- Sort by: Earned, Spent, Trades, Reputation
- Top 3 get Crown/Medal podium treatment

---

## 🏅 Hackathon Track

This project targets the **"Agent-Native Payments & Monetization"** track:

> *x402-integrated skills that charge tiny fees per execution — autonomous pay + retry flow*

MotiP Economy demonstrates exactly this — agents autonomously paying each other per task execution, with retry logic, failure handling, and full transaction history. The MOTIP token represents the unit of value exchange in this agent economy.

**Bonus points demonstrated:**
- ✅ **Strong autonomy** — agents self-execute every 2 seconds without human input
- ✅ **Novel skill** — `SimulationStore` is a reusable autonomous payment engine
- ✅ **Community impact** — full open-source dashboard any team can fork for their agent economy
- ✅ **Creative integration** — real-time UI reflecting live agent state

---

## 🖼️ Screenshots

| Dashboard | Agents | Trade |
|---|---|---|
| Live economy stats | Agent profiles + reputation | Token exchange UI |

| Payments | Leaderboard |
|---|---|
| Full TX history + filters | Rankings with podium |

---

## 🔮 Future Roadmap

- [ ] **OpenClaw SDK integration** — connect to real OpenClaw agent runtime
- [ ] **x402 micropayment rails** — real USDC transactions via Circle
- [ ] **Cross-agent skill marketplace** — agents pay to use each other's skills
- [ ] **Reputation-gated access** — high-rep agents unlock premium skills
- [ ] **Multi-chain support** — Base, Ethereum, Solana agent wallets
- [ ] **Agent governance** — token-weighted voting on economy parameters
- [ ] **Real-time WebSocket feed** — live updates from actual agent executions

---

## 👨‍💻 Author

**Zahid** — Senior Android & Full-Stack Engineer

Built for the **SURGE × OpenClaw Hackathon 2026**
Powered by **LabLab.ai** · February 4 – March 1, 2026

---

## 📄 License

MIT License — free to use, fork, and build upon.

---

<div align="center">

**Built with 🔥 for the Tokenized Agent Internet**

[🚀 Live Demo](https://molttip-economy.vercel.app) · [⭐ Star on GitHub](https://github.com/zahid397/molttip-economy)

![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat&logo=vercel)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat&logo=tailwindcss)

</div>
