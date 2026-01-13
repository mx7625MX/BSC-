# Frequently Asked Questions (FAQ)

## General Questions

### What is the BSC Defensive Bot?
The BSC Defensive Bot is a desktop application that monitors your BSC wallet and automatically protects your tokens from bot frontrunning attacks by executing priority sell transactions when large suspicious buys are detected.

### Is this bot legal to use?
Yes, the bot simply monitors blockchain data and executes transactions on your behalf. However, always comply with your local regulations regarding cryptocurrency trading.

### Do I need coding knowledge to use it?
Basic technical knowledge is helpful, but not required. You need to:
- Install Node.js
- Edit a configuration file
- Understand blockchain basics

### What blockchains does it support?
Currently only Binance Smart Chain (BSC) mainnet and testnet. Support for other EVM chains could be added.

## Security Questions

### Is my private key safe?
Your private key is:
- Stored in your `.env` file (not committed to git)
- Encrypted by Electron Store when saved in settings
- Never transmitted or logged
- Only used locally to sign transactions

**Important:** Always keep your system secure and never share your private key!

### Can the bot steal my tokens?
No. The bot only executes transactions you configure it to perform. It's open source - you can review all the code. The bot runs entirely on your local machine.

### What if I lose my private key?
The bot cannot help recover lost private keys. Always maintain secure backups of your wallet recovery phrase/private key separate from the bot.

### Should I use my main wallet?
**No!** It's recommended to use a dedicated wallet for bot operations to minimize risk. Transfer only the tokens you want to monitor.

## Configuration Questions

### What is the "Buy Threshold"?
The percentage of liquidity pool volume that triggers a defensive action. For example, 10% means if someone buys 10% or more of the pool's liquidity, the bot will execute a defensive sell.

### What should I set my Buy Threshold to?
- **Conservative:** 15-20% (fewer false triggers)
- **Moderate:** 10-15% (balanced)
- **Aggressive:** 5-10% (maximum protection, more gas costs)

Start conservative and adjust based on observed behavior.

### What is Gas Multiplier?
This multiplies the current gas price for priority transactions. A 1.5x multiplier means your sell will have 50% higher gas, making it more likely to execute before other transactions.

### What is Slippage Tolerance?
The maximum acceptable price difference between when you submit a transaction and when it executes. Higher slippage = more likely to succeed but worse price.

### What's the difference between Whitelist and Blacklist?

**Whitelist:**
- Token addresses you trust
- Bot will NOT sell these tokens
- Use for your own tokens or trusted projects

**Blacklist:**
- Wallet addresses you consider suspicious
- Bot will IMMEDIATELY sell if these addresses make large buys
- Use for known bot operators or suspicious wallets

## Operation Questions

### How do I know if the bot is working?
Check these indicators:
1. Status shows "Running" 🟢
2. Dashboard shows your wallet balance
3. Logs show periodic monitoring activity
4. Network connection is successful

### The bot detected a large buy but didn't sell. Why?
Possible reasons:
1. Token is on your whitelist
2. Buyer is not on blacklist AND buy is below threshold
3. Insufficient token balance
4. Transaction failed (check logs)
5. Slippage too low (transaction reverted)

### How fast does the bot react?
Reaction time depends on:
- Poll interval (default 5 seconds)
- Network latency
- Gas price for priority
- Blockchain confirmation time

Typically: 5-15 seconds from detection to execution

### Can I monitor multiple wallets?
Currently only one wallet per bot instance. You could run multiple instances with different configurations, but this requires separate installations.

### Does the bot work when my computer is off?
No. The bot must be running on your computer to monitor and execute transactions. Consider using a dedicated always-on machine or VPS.

## Technical Questions

### What is PancakeSwap Router/Factory?
- **Router:** Smart contract that executes swaps
- **Factory:** Smart contract that creates liquidity pairs

The bot uses these to:
- Find liquidity pools for tokens
- Execute sell transactions
- Get price quotes

### Why does the bot need my private key?
To sign and send transactions on your behalf. Without it, the bot can only monitor but cannot execute defensive sells.

### Can I use this with MetaMask?
Not directly. The bot needs the private key to execute automated transactions. MetaMask requires manual approval for each transaction.

### What RPC endpoint should I use?
Default endpoints work well:
- **Mainnet:** https://bsc-dataseed1.binance.org/
- **Testnet:** https://data-seed-prebsc-1-s1.binance.org:8545/

You can also use private RPC endpoints for better performance.

### How much does it cost to run?
Costs include:
- Gas fees for transactions (varies with network congestion)
- No subscription or usage fees
- Consider gas costs for frequent defensive sells

Typical gas costs: 0.001-0.01 BNB per transaction

## Troubleshooting Questions

### Bot says "Web3 not connected"
1. Check internet connection
2. Verify RPC URL is correct
3. Try alternative RPC endpoint
4. Check network selection (mainnet/testnet)

### Transactions keep failing
Common causes:
- Insufficient BNB for gas
- Slippage tolerance too low
- Gas price too low
- Token has trading restrictions
- Liquidity pool too small

### No tokens are being detected
1. Verify wallet address is correct
2. Ensure wallet has made token transactions
3. Check correct network is selected
4. Review logs for errors

### GUI won't load or is blank
1. Restart the application
2. Try `npm run dev` to see console errors
3. Check if all files are present
4. Reinstall: `rm -rf node_modules && npm install`

### How do I update the bot?
```bash
git pull  # Get latest code
npm install  # Update dependencies
npm test  # Verify everything works
```

## Performance Questions

### How much CPU/RAM does it use?
Typical usage:
- CPU: 2-5% (idle), 10-30% (active)
- RAM: 100-200 MB
- Network: Minimal (periodic polls only)

### Can I run other applications while the bot runs?
Yes! The bot is lightweight and runs in the background.

### Does it slow down my computer?
No, it has minimal resource impact. If you experience issues, check:
- Other applications using resources
- Poll interval (lower = more frequent checks)
- Number of monitored tokens

## Strategy Questions

### When should I use the bot?
Best for:
- Launch of your own token
- Protecting liquidity you've added
- Detecting and responding to bot attacks
- Monitoring high-risk pools

### Is it profitable?
The bot is **defensive**, not a profit-making tool. It protects against losses from bot frontrunning, but:
- You'll pay gas fees for sells
- Market timing still matters
- No guarantee of profit

### Can it prevent all bot attacks?
No tool can prevent all attacks, but it significantly reduces risk by:
- Detecting suspicious activity quickly
- Executing priority transactions
- Automating responses faster than manual trading

### Should I sell every large buy?
Not necessarily! Configure wisely:
- Use whitelist for legitimate large buyers
- Set appropriate thresholds
- Monitor and adjust based on patterns
- Consider market conditions

## Development Questions

### Can I modify the bot?
Yes! It's open source. You can:
- Add new features
- Customize trading logic
- Integrate with other tools
- Contribute improvements

### How do I add support for another DEX?
1. Add the DEX's router/factory addresses to config
2. Update the liquidity monitoring logic
3. Adjust ABI if different
4. Test thoroughly on testnet

### Can I contribute?
Yes! Consider contributing:
- Bug fixes
- New features
- Documentation improvements
- Testing and feedback

### Where can I report bugs?
Open an issue on the GitHub repository with:
- Clear description
- Steps to reproduce
- Error messages
- Your environment details

## Best Practices

### Testing
- ✅ Always test on testnet first
- ✅ Start with small amounts
- ✅ Monitor closely initially
- ✅ Keep logs for analysis

### Security
- ✅ Use dedicated wallet
- ✅ Keep private key secure
- ✅ Update software regularly
- ✅ Backup configuration

### Operation
- ✅ Monitor regularly
- ✅ Maintain sufficient gas balance
- ✅ Adjust settings based on behavior
- ✅ Review transaction history

### Optimization
- ✅ Tune thresholds based on your needs
- ✅ Use whitelist to reduce false triggers
- ✅ Balance gas costs vs protection
- ✅ Consider poll interval vs responsiveness

## Still Have Questions?

1. Check the documentation:
   - [README.md](README.md) - Overview and features
   - [QUICKSTART.md](QUICKSTART.md) - Getting started
   - [TESTING.md](TESTING.md) - Testing guide
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details

2. Review the logs:
   - `logs/bot.log` - General logs
   - `logs/error.log` - Error messages

3. Run diagnostics:
   ```bash
   npm test
   node validate-config.js
   ```

4. Check GitHub issues for similar problems

---

**Can't find your answer?** Open an issue on GitHub with your question!
