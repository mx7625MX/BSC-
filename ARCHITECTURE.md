# Project Architecture

## Directory Structure

```
BSC-/
├── assets/                    # Application icons and images
│   └── README.md             # Icon requirements guide
├── logs/                      # Runtime logs (auto-created)
├── src/
│   ├── main.js               # Electron main process entry point
│   ├── core/                 # Core bot functionality
│   │   ├── BotController.js      # Main bot orchestration
│   │   ├── Web3Provider.js       # Blockchain connection
│   │   ├── WalletMonitor.js      # Wallet transaction monitoring
│   │   ├── LiquidityMonitor.js   # Liquidity pool monitoring
│   │   └── TransactionManager.js # Transaction execution
│   ├── config/               # Configuration management
│   │   └── ConfigManager.js      # Settings storage
│   ├── utils/                # Utility modules
│   │   └── logger.js            # Logging system
│   └── gui/                  # Electron renderer (UI)
│       ├── index.html           # Main UI layout
│       ├── styles.css           # UI styling
│       └── renderer.js          # UI logic and IPC
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Node.js project configuration
├── install.sh               # Linux/Mac installation script
├── install.bat              # Windows installation script
├── test.js                  # Module testing script
├── validate-config.js       # Configuration validation
├── README.md                # Main documentation
├── TESTING.md               # Testing guide
└── DEPLOYMENT.md            # Deployment guide
```

## Module Architecture

### Main Process (Electron)

```
main.js (Electron Main Process)
    ↓
    ├─→ BotController (Orchestrator)
    │       ↓
    │       ├─→ Web3Provider (Blockchain Connection)
    │       ├─→ WalletMonitor (Transaction Detection)
    │       ├─→ LiquidityMonitor (Pool Monitoring)
    │       └─→ TransactionManager (Trading Execution)
    │
    └─→ IPC Handlers (Communication with GUI)
```

### Renderer Process (GUI)

```
index.html (UI Structure)
    ↓
renderer.js (UI Logic)
    ↓
    ├─→ Dashboard View
    ├─→ Transactions View
    ├─→ Settings View
    ├─→ Whitelist/Blacklist Views
    └─→ Logs View
    
    ↓ IPC Communication ↓
    
BotController (Main Process)
```

## Data Flow

### Bot Start Sequence

```
1. User clicks "Start Bot" in GUI
        ↓
2. IPC call to main process
        ↓
3. BotController.start()
        ↓
4. Web3Provider.connect(rpc, privateKey)
        ↓
5. WalletMonitor.start()
        ↓
6. LiquidityMonitor.start()
        ↓
7. Status update sent to GUI
```

### Token Detection Flow

```
1. WalletMonitor detects new transaction
        ↓
2. Analyzes transaction type
        ↓
3. If token creation/liquidity:
        ↓
4. Emits 'token-detected' event
        ↓
5. BotController receives event
        ↓
6. Adds token to LiquidityMonitor
        ↓
7. GUI updated with new token
```

### Large Buy Detection & Response

```
1. LiquidityMonitor detects swap event
        ↓
2. Calculates % of liquidity
        ↓
3. If > threshold:
        ↓
4. Emits 'large-buy-detected' event
        ↓
5. BotController checks whitelist/blacklist
        ↓
6. If action needed:
        ↓
7. TransactionManager.executeSell()
        ↓
8. Priority transaction sent to blockchain
        ↓
9. Transaction logged and GUI updated
```

## Component Details

### Core Modules

#### BotController
**Responsibilities:**
- Orchestrate all bot operations
- Manage component lifecycle
- Handle events from monitors
- Execute defensive trading logic
- Manage whitelist/blacklist

**Key Methods:**
- `start()` - Initialize and start bot
- `stop()` - Stop all monitoring
- `executePrioritySell()` - Defensive sell action
- `updateConfig()` - Update settings

#### Web3Provider
**Responsibilities:**
- Maintain blockchain connection
- Execute transactions
- Query blockchain data

**Key Methods:**
- `connect()` - Establish connection
- `sendTransaction()` - Normal tx
- `sendPriorityTransaction()` - High-priority tx
- `getBalance()` - Query balance

#### WalletMonitor
**Responsibilities:**
- Monitor wallet transactions
- Detect token creations
- Detect liquidity additions

**Key Methods:**
- `start()` - Begin monitoring
- `checkNewBlocks()` - Poll for blocks
- `analyzeTx()` - Parse transaction

#### LiquidityMonitor
**Responsibilities:**
- Monitor liquidity pools
- Detect large buys
- Calculate buy percentages

**Key Methods:**
- `addToken()` - Add pool to monitor
- `checkSwapEvents()` - Poll for swaps
- `analyzeSwap()` - Evaluate swap size

#### TransactionManager
**Responsibilities:**
- Execute sell transactions
- Handle approvals
- Calculate slippage

**Key Methods:**
- `executeSell()` - Sell tokens
- `estimateGas()` - Gas estimation

### Configuration

#### ConfigManager
**Storage:** electron-store (persistent)

**Configuration:**
- Network settings
- Wallet credentials
- Trading parameters
- Whitelist/blacklist
- Logging preferences

### Utilities

#### Logger
**Based on:** Winston

**Features:**
- File logging (rotating)
- Console output (dev mode)
- In-memory buffer (for GUI)
- Multiple log levels

## Communication Flow

### IPC (Inter-Process Communication)

**Main → Renderer:**
- Status updates
- Event notifications
- Error messages

**Renderer → Main:**
- Start/stop commands
- Configuration updates
- Whitelist/blacklist changes
- Query requests

**IPC Channels:**
- `start-bot`
- `stop-bot`
- `get-status`
- `get-config`
- `update-config`
- `get-transactions`
- `get-logs`
- `add-whitelist`
- `add-blacklist`
- `remove-whitelist`
- `remove-blacklist`

## Security Architecture

### Private Key Storage
1. Environment variables (.env)
2. Electron store (OS-encrypted)
3. Never logged or transmitted

### Transaction Security
- Gas price limits
- Slippage protection
- Approval checks
- Transaction signing

### Network Security
- HTTPS RPC endpoints
- Request validation
- Error sanitization

## Performance Considerations

### Polling Strategy
- Default: 5 second intervals
- Configurable per user
- Batch block processing

### Memory Management
- Limited log buffer (1000 entries)
- Event cleanup
- Connection pooling

### Gas Optimization
- Smart gas estimation
- Priority multipliers
- Max gas limits

## Extension Points

### Adding New Monitors
1. Extend EventEmitter
2. Implement start/stop
3. Emit events to BotController
4. Register in BotController

### Adding GUI Pages
1. Add HTML section in index.html
2. Add styles in styles.css
3. Add logic in renderer.js
4. Add IPC handlers if needed

### Adding Trading Strategies
1. Listen to relevant events
2. Implement decision logic
3. Call TransactionManager
4. Log actions

## Technology Stack

**Backend:**
- Node.js (runtime)
- Web3.js (blockchain)
- Winston (logging)
- dotenv (env vars)

**Frontend:**
- Electron (desktop framework)
- HTML5/CSS3 (UI)
- Vanilla JavaScript (logic)

**Storage:**
- electron-store (config)
- File system (logs)

**Build:**
- electron-builder (packaging)

## Development Workflow

```
1. Code changes
    ↓
2. npm test (validate modules)
    ↓
3. npm run dev (test in Electron)
    ↓
4. Fix issues
    ↓
5. npm run build (create distributables)
    ↓
6. Test on target platforms
    ↓
7. Deploy
```
