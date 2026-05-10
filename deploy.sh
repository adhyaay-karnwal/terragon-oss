#!/bin/bash
# =============================================================================
# Terragon Deployment Script
# =============================================================================
# This script builds and deploys Terragon using Docker Compose.
#
# Usage:
#   ./deploy.sh          - Full deployment (build + start)
#   ./deploy.sh restart  - Just restart containers (no rebuild)
#   ./deploy.sh logs     - Show logs
#   ./deploy.sh stop     - Stop all containers
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Terragon Deployment Script ===${NC}"
echo ""

# Check for .env.production
if [ ! -f .env.production ]; then
    echo -e "${RED}ERROR: .env.production not found!${NC}"
    echo ""
    echo "To fix this:"
    echo "  1. Copy the example file:  cp .env.production.example .env.production"
    echo "  2. Edit it with your values:  nano .env.production"
    echo "  3. Run this script again:  ./deploy.sh"
    exit 1
fi

# Check for required env vars
check_env_var() {
    if ! grep -q "^$1=.\+" .env.production 2>/dev/null; then
        echo -e "${YELLOW}WARNING: $1 appears to be empty in .env.production${NC}"
    fi
}

echo "Checking required environment variables..."
check_env_var "BETTER_AUTH_SECRET"
check_env_var "ANTHROPIC_API_KEY"
check_env_var "E2B_API_KEY"
check_env_var "GITHUB_CLIENT_ID"
check_env_var "GITHUB_CLIENT_SECRET"
check_env_var "GITHUB_APP_PRIVATE_KEY"
check_env_var "R2_ACCESS_KEY_ID"
echo ""

# Handle commands
case "${1:-deploy}" in
    restart)
        echo -e "${GREEN}Restarting containers...${NC}"
        docker compose down
        docker compose up -d
        echo -e "${GREEN}Done! View logs with: docker compose logs -f${NC}"
        ;;

    logs)
        docker compose logs -f
        ;;

    stop)
        echo -e "${YELLOW}Stopping all containers...${NC}"
        docker compose down
        echo -e "${GREEN}Done!${NC}"
        ;;

    deploy|*)
        echo -e "${GREEN}Building Docker images...${NC}"
        echo "This may take 5-10 minutes on first build..."
        echo ""
        docker compose build

        echo ""
        echo -e "${GREEN}Starting services...${NC}"
        docker compose up -d

        echo ""
        echo -e "${GREEN}Waiting for services to be healthy...${NC}"
        sleep 10

        # Check if services are running
        if docker compose ps | grep -q "Up"; then
            echo ""
            echo -e "${GREEN}=== Deployment successful! ===${NC}"
            echo ""
            echo "Your app should be running at http://localhost:3000"
            echo ""
            echo "Next steps:"
            echo "  1. Set up Nginx reverse proxy (see DEPLOYMENT.md)"
            echo "  2. Get SSL certificate with Certbot"
            echo "  3. Push database schema:"
            echo "     docker compose exec app sh -c 'cd /app && npx drizzle-kit push'"
            echo ""
            echo "Useful commands:"
            echo "  View logs:     docker compose logs -f"
            echo "  View logs (app only): docker compose logs -f app"
            echo "  Restart:       ./deploy.sh restart"
            echo "  Stop:          ./deploy.sh stop"
        else
            echo -e "${RED}ERROR: Some services may not have started correctly.${NC}"
            echo "Check logs with: docker compose logs"
            exit 1
        fi
        ;;
esac
