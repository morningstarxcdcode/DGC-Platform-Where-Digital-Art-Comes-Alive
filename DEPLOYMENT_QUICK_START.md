# 🚀 Quick Deployment Guide

## Prerequisites Checklist
- [ ] GitHub repository access
- [ ] All tests passing (run `./validate-deployment.sh`)
- [ ] Clean git status

## Step 1: Verify Everything is Ready

```bash
# Run validation
bash validate-deployment.sh

# Check git status
git status
```

## Step 2: Configure GitHub Repository Settings

### Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save changes

### Add Repository Secrets (If deploying contracts to testnet)
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `SEPOLIA_RPC_URL`: Your Infura/Alchemy Sepolia endpoint
   - `PRIVATE_KEY`: Your deployment wallet private key
   - `ETHERSCAN_API_KEY`: Your Etherscan API key

## Step 3: Push to GitHub

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "🎨 DGC Platform v1.0.0 - Production Ready

- ✅ Fixed all linting errors
- ✅ Comprehensive CI/CD workflows
- ✅ GitHub Pages deployment configured
- ✅ Complete documentation and setup guide
- ✅ All core tests passing
- 📚 Added detailed API documentation
- 🔧 Optimized build configuration"

# Push to main branch
git push origin main
```

## Step 4: Monitor Deployment

### Watch GitHub Actions
1. Go to your repository on GitHub
2. Click **Actions** tab
3. You should see workflows running:
   - ✅ **Complete CI/CD Pipeline** - Testing all components
   - ✅ **Deploy to GitHub Pages** - Building and deploying frontend

### Check Deployment Status
- CI/CD typically takes 5-10 minutes
- GitHub Pages deployment takes 2-3 minutes after CI passes

## Step 5: Access Your Live Site

Once deployed, your site will be available at:
```
https://morningstarxcdcode.github.io/DGC-Platform-Where-Digital-Art-Comes-Alive/
```

## Step 6: Verify Live Deployment

```bash
# Test the live API endpoint (if backend is deployed)
curl https://your-backend-url.com/health

# Check frontend loads correctly
open https://morningstarxcdcode.github.io/DGC-Platform-Where-Digital-Art-Comes-Alive/
```

## Troubleshooting

### Workflow Failures

**If CI/CD fails:**
1. Click on the failed workflow
2. Review the error logs
3. Fix the issues locally
4. Commit and push again

**Common issues:**
- Missing dependencies: Check `package.json` and `requirements.txt`
- Test failures: Run tests locally first
- Build errors: Ensure all build scripts work locally

### GitHub Pages Not Showing

1. Check Pages settings are correct
2. Verify workflow completed successfully
3. Wait 2-3 minutes for DNS propagation
4. Clear browser cache and try again

### Permission Errors

If you see permission errors:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Save and re-run the workflow

## Quick Commands Reference

```bash
# Full validation
bash validate-deployment.sh

# Check git status
git status

# View commit history
git log --oneline -10

# Force push (use with caution!)
git push origin main --force

# View remote URL
git remote -v

# Pull latest changes
git pull origin main
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly on GitHub Pages
- [ ] All workflow badges show passing
- [ ] README displays correctly
- [ ] Documentation links work
- [ ] No broken images or assets
- [ ] Mobile responsive design works
- [ ] MetaMask integration functional (if applicable)

## Updating After Initial Deployment

```bash
# Make your changes
# ...

# Run tests
npm test

# Validate
bash validate-deployment.sh

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

## Creating a Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag
git push origin v1.0.0
```

This will trigger the **Automated Release** workflow which creates a GitHub release with build artifacts.

---

**Need Help?**
- Check [SETUP_AND_RUN_GUIDE.md](SETUP_AND_RUN_GUIDE.md) for detailed setup
- Review [GitHub Actions logs](https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive/actions)
- Open an [issue](https://github.com/morningstarxcdcode/DGC-Platform-Where-Digital-Art-Comes-Alive/issues) if problems persist
