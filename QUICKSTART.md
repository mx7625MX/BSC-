# Quick Start Guide

Get up and running with the BSC Defensive Bot in 5 minutes!

## Prerequisites

- ✅ Node.js v16 or higher installed
- ✅ A BSC wallet with some BNB for gas fees
- ✅ Basic understanding of blockchain transactions

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

**Linux/Mac:**
```bash
./install.sh
```

**Windows:**
```cmd
install.bat
```

**Or manually:**
```bash
npm install
```

### 2. Configure Your Wallet (1 minute)

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` and add your wallet details:
```env
WALLET_ADDRESS=0xYourWalletAddress
PRIVATE_KEY=YourPrivateKey
NETWORK=testnet  # Start with testnet!
```

⚠️ **Important:** Start with testnet to avoid losing real funds!

### 3. Validate Configuration (30 seconds)

```bash
node validate-config.js
```

This checks your configuration and tests the network connection.

### 4. Start the Bot (30 seconds)

**Development mode (with DevTools for debugging):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Configure Settings (1 minute)

In the GUI:
1. Click on **Settings** tab
2. Review and adjust:
   - Buy Threshold (default: 10%)
   - Gas Multiplier (default: 1.5x)
   - Slippage Tolerance (default: 5%)
3. Click **Save Settings**

### 6. Start Monitoring

1. Click the **▶️ Start Bot** button in the top right
2. Watch the Dashboard for updates
3. Monitor the Logs tab for activity

## Understanding the Dashboard

### Status Indicators

🟢 **Running** - Bot is actively monitoring
🔴 **Stopped** - Bot is not running

### Key Metrics

- **Wallet Balance** - Your current BNB balance
- **Monitored Tokens** - Number of tokens being tracked
- **Total Transactions** - Count of all transactions executed
- **Network** - Which network you're connected to

## Your First Test (Testnet)

### 1. Get Testnet BNB
Visit: https://testnet.binance.org/faucet-smart

### 2. Make a Test Transaction
Send a small amount of testnet BNB or interact with a token

### 3. Verify Detection
Check the Dashboard and Logs to see if the transaction was detected

## Common Tasks

### Adding to Whitelist
1. Go to **Whitelist** tab
2. Enter token address
3. Click **Add to Whitelist**

This prevents the bot from selling these tokens even if a large buy is detected.

### Adding to Blacklist
1. Go to **Blacklist** tab
2. Enter wallet address
3. Click **Add to Blacklist**

This triggers immediate defensive action if this address makes a large buy.

### Viewing Transaction History
1. Go to **Transactions** tab
2. See all executed transactions
3. Review success/failure status

### Checking Logs
1. Go to **Logs** tab
2. Click **🔄 Refresh** to update
3. Review system activity

## Safety Tips

### Before Going Live

- ✅ Test thoroughly on testnet
- ✅ Start with low thresholds
- ✅ Use a dedicated wallet (not your main wallet)
- ✅ Only fund with what you can afford to lose
- ✅ Monitor closely for the first few hours
- ✅ Keep your private key secure

### When Running

- 📊 Monitor regularly
- 💰 Keep sufficient BNB for gas
- ⚙️ Adjust settings based on behavior
- 📝 Review logs daily
- 🔄 Update whitelist as needed

## Switching to Mainnet

When you're ready to use real funds:

1. **Stop the bot** if running
2. Go to **Settings** tab
3. Change **Network** to "mainnet"
4. Verify wallet address is correct
5. **Save Settings**
6. Ensure wallet has BNB for gas
7. **Start** the bot

⚠️ **Warning:** Mainnet transactions use real funds!

## Troubleshooting

### Bot won't start
```bash
# Check configuration
node validate-config.js

# Check modules
npm test
```

### No transactions detected
- Verify wallet address is correct
- Check that wallet has made transactions
- Ensure network is correct (mainnet/testnet)

### Transactions failing
- Check BNB balance for gas
- Increase slippage tolerance
- Verify gas settings

### GUI not loading
- Restart the application
- Try `npm run dev` for debugging
- Check console for errors (Ctrl+Shift+I)

## Next Steps

### Learn More
- 📖 Read [README.md](README.md) for detailed features
- 🏗️ Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- 🧪 Check [TESTING.md](TESTING.md) for testing scenarios
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for building executables

### Customize
- Adjust trading parameters for your strategy
- Set up whitelists for trusted tokens
- Configure blacklists for known bad actors
- Fine-tune gas settings for your needs

### Monitor
- Keep logs tab open
- Watch for large buy detections
- Review transaction history
- Check wallet balance regularly

## Support

### Getting Help
1. Check documentation in this repository
2. Review logs in `logs/` folder
3. Run validation scripts
4. Test on testnet first

### Reporting Issues
When reporting problems:
- Include error messages
- Specify network (mainnet/testnet)
- Share relevant logs
- Describe steps to reproduce

## Quick Reference

### Commands
```bash
npm start          # Start bot (production)
npm run dev        # Start bot (development)
npm test           # Test modules
node validate-config.js  # Validate configuration
npm run build      # Build executable
```

### File Locations
- Configuration: `.env`
- Logs: `logs/bot.log` and `logs/error.log`
- Settings: Auto-saved by Electron

### Important Settings
- **Buy Threshold**: 5-15% is typical
- **Gas Multiplier**: 1.5-2.0x for priority
- **Slippage**: 3-10% depending on token
- **Poll Interval**: 3000-10000ms

## Best Practices

1. **Always test on testnet first**
2. **Use a dedicated wallet**
3. **Start with conservative settings**
4. **Monitor actively when running**
5. **Keep software updated**
6. **Backup your configuration**
7. **Never share your private key**
8. **Maintain sufficient gas balance**

---

**Ready to start?** Run `npm run dev` and begin monitoring! 🚀
