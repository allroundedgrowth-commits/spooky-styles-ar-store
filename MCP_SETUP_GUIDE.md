# 🤖 MCP Setup Guide - Complete Instructions

## ✅ Current Status

### Database Status: **WORKING** ✅
- **PostgreSQL**: Running and healthy on port 5432
- **Redis**: Running and healthy on port 6379
- **Connection**: Tested successfully
- **Database**: `spooky_styles_db`
- **User**: `spooky_user`

### MCP Configuration: **READY** ✅
- **Config file**: `.kiro/settings/mcp.json` created
- **PostgreSQL MCP**: Configured with correct connection string
- **Git MCP**: Configured for version control
- **Status**: Waiting for `uv` installation

---

## 🚀 Step-by-Step Setup

### Step 1: Install `uv` (Python Package Manager)

MCP servers run through `uvx`, which requires `uv` to be installed.

#### Option A: Install with pip (Recommended)
```bash
pip install uv
```

#### Option B: Install with PowerShell (Windows)
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Option C: Install with Homebrew (Mac/Linux)
```bash
brew install uv
```

#### Verify Installation
```bash
uv --version
# Should show: uv 0.x.x
```

---

### Step 2: Restart Kiro IDE

After installing `uv`, you need to restart Kiro so it can detect the MCP servers.

1. **Close Kiro completely**
2. **Reopen Kiro**
3. **Wait for MCP servers to connect** (check status bar or MCP view)

---

### Step 3: Verify MCP Connection

#### Check MCP Servers View
1. Open Kiro sidebar
2. Look for "MCP Servers" section
3. You should see:
   - ✅ **postgres** (connected)
   - ✅ **git** (connected)

#### Test with a Query
Try asking me:
- "Show me all tables in the database"
- "List all products"
- "What's in the users table?"
- "Show me recent git commits"

---

## 📊 What You Can Do with MCP

### PostgreSQL MCP

#### Database Queries
```
"Show me all products with stock < 10"
"Count how many users are registered"
"List all orders from today"
"What are the top 5 selling products?"
"Show me the products table structure"
```

#### Data Analysis
```
"What's the average order value?"
"How many products are in each category?"
"Show me users who registered this week"
"What's the total revenue this month?"
```

#### Debugging
```
"Check if product ID 123 exists"
"Show me the last 10 orders"
"Find all products with missing images"
"List users with admin role"
```

### Git MCP

#### Repository Info
```
"Show me recent commits"
"What files changed in the last week?"
"Show me the git status"
"What branches exist?"
```

#### Code History
```
"Who last modified the AR engine?"
"Show me commits related to authentication"
"What changed in the last commit?"
"Show me the diff for file X"
```

#### Branch Management
```
"Create a new branch for feature X"
"Switch to main branch"
"Show me uncommitted changes"
```

---

## 🔧 Troubleshooting

### Issue: MCP Servers Not Connecting

#### Solution 1: Check `uv` Installation
```bash
uv --version
```
If not found, install it (see Step 1)

#### Solution 2: Restart Kiro
Close and reopen Kiro completely

#### Solution 3: Check MCP Config
Open `.kiro/settings/mcp.json` and verify:
- File exists
- JSON is valid
- Connection strings are correct

#### Solution 4: Reconnect Manually
1. Open MCP Servers view in Kiro
2. Right-click on server
3. Select "Reconnect"

### Issue: Database Connection Failed

#### Solution 1: Check Docker Containers
```bash
docker ps | findstr spooky
```
All three containers should show "Up" and "healthy"

#### Solution 2: Start Containers
```bash
docker-compose up -d postgres redis
```

#### Solution 3: Test Connection
```bash
cd backend
npm run db:test
```
Should show "✅ Database connection successful!"

#### Solution 4: Check Connection String
In `.kiro/settings/mcp.json`:
```json
"POSTGRES_CONNECTION_STRING": "postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db"
```

### Issue: Permission Denied

#### Solution: Auto-Approve Safe Operations
In `.kiro/settings/mcp.json`, add to `autoApprove`:
```json
"autoApprove": ["query", "list_tables", "describe_table", "git_status", "git_log"]
```

---

## 📚 MCP Configuration Reference

### Current Configuration

```json
{
  "mcpServers": {
    "postgres": {
      "command": "uvx",
      "args": ["mcp-server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db"
      },
      "disabled": false,
      "autoApprove": ["query", "list_tables", "describe_table"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git"],
      "env": {
        "GIT_REPO_PATH": "."
      },
      "disabled": false,
      "autoApprove": ["git_status", "git_log", "git_diff"]
    }
  }
}
```

### Configuration Options

#### `command`
- The command to run the MCP server
- Always `"uvx"` for Python-based servers

#### `args`
- Arguments passed to the command
- Server package name (e.g., `"mcp-server-postgres"`)

#### `env`
- Environment variables for the server
- Connection strings, API keys, etc.

#### `disabled`
- `false`: Server is active
- `true`: Server is disabled

#### `autoApprove`
- List of operations that don't require approval
- Safe read-only operations
- Speeds up workflow

---

## 🎯 Example Workflows

### Workflow 1: Check Inventory
```
You: "Show me all products with stock less than 10"
Kiro: [Queries database via MCP]
Kiro: "Here are 5 products with low stock:
       1. Witch Hat - 3 remaining
       2. Vampire Cape - 7 remaining
       ..."
```

### Workflow 2: Analyze Sales
```
You: "What are the top 5 selling products this month?"
Kiro: [Queries orders and products tables]
Kiro: "Top 5 products:
       1. Spooky Wig - 45 sales
       2. Ghost Costume - 32 sales
       ..."
```

### Workflow 3: Debug Issues
```
You: "Show me all failed orders from today"
Kiro: [Queries orders with error status]
Kiro: "Found 2 failed orders:
       Order #123 - Payment failed
       Order #124 - Out of stock"
```

### Workflow 4: Code Review
```
You: "What files changed in the last commit?"
Kiro: [Uses git MCP]
Kiro: "Last commit changed:
       - frontend/src/pages/Simple2DARTryOn.tsx
       - frontend/src/engine/Simple2DAREngine.ts
       - Added image upload feature"
```

---

## 🔐 Security Notes

### Safe Operations (Auto-Approved)
- `query` - Read-only SELECT queries
- `list_tables` - List database tables
- `describe_table` - Show table structure
- `git_status` - Show git status
- `git_log` - Show commit history
- `git_diff` - Show file differences

### Operations Requiring Approval
- `INSERT` - Adding data
- `UPDATE` - Modifying data
- `DELETE` - Removing data
- `CREATE` - Creating tables
- `DROP` - Dropping tables
- `git_commit` - Committing changes
- `git_push` - Pushing to remote

### Best Practices
1. **Never auto-approve write operations**
2. **Review queries before execution**
3. **Use read-only queries for analysis**
4. **Keep connection strings secure**
5. **Don't commit MCP config with secrets**

---

## 📈 Performance Tips

### Optimize Queries
- Use specific columns instead of `SELECT *`
- Add `LIMIT` to large result sets
- Use indexes for frequently queried columns

### Cache Results
- Store frequently accessed data
- Use Redis for caching
- Refresh cache periodically

### Monitor Usage
- Track query performance
- Log slow queries
- Optimize database indexes

---

## 🎓 Learning Resources

### MCP Documentation
- [Official MCP Docs](https://modelcontextprotocol.io/)
- [MCP Server List](https://github.com/modelcontextprotocol/servers)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

### PostgreSQL MCP
- [mcp-server-postgres](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- Query syntax and examples
- Security best practices

### Git MCP
- [mcp-server-git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- Git operations available
- Branch management

---

## ✅ Quick Checklist

### Setup Checklist
- [ ] Install `uv`: `pip install uv`
- [ ] Verify installation: `uv --version`
- [ ] Restart Kiro IDE
- [ ] Check MCP Servers view
- [ ] Test with simple query
- [ ] Verify database connection
- [ ] Test git operations

### Daily Usage Checklist
- [ ] Docker containers running
- [ ] MCP servers connected
- [ ] Database accessible
- [ ] Git repository clean

---

## 🆘 Getting Help

### If MCP Doesn't Work
1. Check this guide's troubleshooting section
2. Verify `uv` is installed
3. Restart Kiro
4. Check MCP Servers view
5. Test database connection manually

### If Database Issues
1. Check Docker containers: `docker ps`
2. Start containers: `docker-compose up -d`
3. Test connection: `npm run db:test`
4. Check logs: `docker logs spooky-styles-postgres`

### If Git Issues
1. Check git status: `git status`
2. Verify repository: `git remote -v`
3. Check MCP config: `.kiro/settings/mcp.json`

---

## 🎉 You're Ready!

Once you've completed Step 1 (install `uv`) and Step 2 (restart Kiro), you'll be able to:

✅ Query your database directly through chat  
✅ Analyze data without writing SQL  
✅ Debug issues faster  
✅ Review git history easily  
✅ Automate repetitive tasks  

**Next Step**: Install `uv` with `pip install uv`, then restart Kiro!

---

## 📞 Quick Commands

```bash
# Install uv
pip install uv

# Check uv version
uv --version

# Start database
docker-compose up -d postgres redis

# Test database
cd backend && npm run db:test

# Check containers
docker ps | findstr spooky

# View MCP config
cat .kiro/settings/mcp.json
```

Happy querying! 🚀
