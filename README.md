# BSC Defensive Bot

A desktop application for monitoring and managing BSC (Binance Smart Chain) tokens with defensive trading capabilities.

## Features

### 🔍 Wallet Monitoring
- Track wallet for new token interactions
- Detect token creation and liquidity additions
- Automatically monitor new tokens

### 💧 Liquidity Pool Monitoring
- Monitor liquidity pools in real-time
- Detect large buy transactions (configurable threshold)
- Track percentage of liquidity volume for each transaction

### ⚡ Priority Selling
- Execute priority sell operations to counter bot frontrunning
- Configurable gas price multipliers for urgent transactions
- Automatic slippage protection

### ⚙️ Configuration
- User-friendly GUI for all settings
- Adjustable buy/sell thresholds
- Gas configuration and slippage tolerance
- Network selection (Mainnet/Testnet)

### 📋 Whitelist/Blacklist
- Whitelist trusted token addresses
- Blacklist suspicious wallet addresses
- Automatic defensive action on blacklisted buyers

### 📊 Dashboard
- Real-time wallet balance display
- Monitored tokens counter
- Transaction history
- Live event feed

### 📝 Logging & Audit
- Comprehensive logging system
- Transaction history tracking
- Audit trail for all bot actions

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/mx7625MX/BSC-.git
cd BSC-
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
# Required
WALLET_ADDRESS=your_wallet_address
PRIVATE_KEY=your_private_key

# Optional (defaults provided)
NETWORK=mainnet
BUY_THRESHOLD_PERCENT=10
SELL_PRIORITY_GAS_MULTIPLIER=1.5
SLIPPAGE_TOLERANCE=5
```

## Usage

### Development Mode
Run the bot in development mode with DevTools:
```bash
npm run dev
```

### Production Mode
Run the bot normally:
```bash
npm start
```

### Building Executables

Build for all platforms:
```bash
npm run build
```

Build for specific platform:
```bash
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

Executables will be created in the `dist` folder.

## Configuration

### Network Settings
- **Network**: Choose between mainnet and testnet
- **RPC URL**: Configured automatically based on network selection
- **Wallet**: Enter your wallet address and private key

### Trading Parameters
- **Buy Threshold**: Percentage of liquidity that triggers defensive action (default: 10%)
- **Gas Multiplier**: Priority gas multiplier for defensive sells (default: 1.5x)
- **Slippage Tolerance**: Maximum acceptable slippage (default: 5%)
- **Poll Interval**: How often to check for new events in milliseconds (default: 5000ms)

### Smart Contract Addresses
Default addresses for PancakeSwap V2 on BSC mainnet:
- **Router**: 0x10ED43C718714eb63d5aA57B78B54704E256024E
- **Factory**: 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
- **WBNB**: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c

## Testing

### BSC Testnet
1. Set `NETWORK=testnet` in `.env` or change in GUI
2. Use testnet BNB from faucet: https://testnet.binance.org/faucet-smart
3. Deploy test tokens or use existing testnet tokens
4. Monitor and test defensive selling features

### Validation Checklist
- [ ] Bot connects to BSC network
- [ ] Wallet monitoring detects new transactions
- [ ] Liquidity pool monitoring tracks swaps
- [ ] Large buys trigger defensive sells
- [ ] Whitelist prevents unnecessary sells
- [ ] Blacklist triggers immediate action
- [ ] Transaction history logs all actions
- [ ] GUI updates in real-time

## Security

### Best Practices
- **Never share your private key**
- Store `.env` file securely and never commit it
- Use a dedicated wallet for bot operations
- Test thoroughly on testnet before mainnet use
- Monitor gas prices to avoid excessive fees
- Set reasonable thresholds to prevent false triggers

### Private Key Storage
The bot stores your private key in:
1. Environment variables (`.env` file)
2. Electron store (encrypted by OS)

Always ensure your system is secure and protected.

## Architecture

### Core Modules
- **Web3Provider**: Blockchain connection and transaction management
- **WalletMonitor**: Monitors wallet for new token interactions
- **LiquidityMonitor**: Tracks liquidity pools and large buys
- **TransactionManager**: Executes buy/sell transactions
- **BotController**: Orchestrates all bot operations

### GUI
- Built with Electron.js for cross-platform desktop support
- Real-time updates via IPC (Inter-Process Communication)
- Responsive design with dark theme

## Troubleshooting

### Bot won't start
- Verify wallet address and private key are correct
- Check network connectivity
- Ensure sufficient BNB for gas fees

### Transactions failing
- Check gas price configuration
- Verify slippage tolerance is adequate
- Ensure wallet has sufficient token balance

### No tokens detected
- Verify wallet address is correct
- Check if wallet has made token transactions
- Confirm network selection matches wallet activity

## Logs

Logs are stored in the `logs` directory:
- `bot.log`: All bot operations
- `error.log`: Error messages only

View logs in the GUI or access files directly.

## Contributing

This project is for educational purposes. Use at your own risk.

## License

MIT License

## Disclaimer

This software is provided "as is" without warranty of any kind. Trading cryptocurrencies carries risk. Always test thoroughly and never risk more than you can afford to lose.
