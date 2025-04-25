#!/bin/bash

# Main deployment script that orchestrates both backend and frontend deployments
# Usage: ./deploy.sh [--no-backend] [--no-frontend]

# Set strict error handling
set -e
set -o pipefail

# Define log file and directories
DEPLOY_LOG="./deployment_$(date +%Y%m%d_%H%M%S).log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_SCRIPT="${SCRIPT_DIR}/deploy-backend.sh"
FRONTEND_SCRIPT="${SCRIPT_DIR}/deploy-frontend.sh"

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Process command line arguments
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

for arg in "$@"; do
    case $arg in
        --no-backend)
            DEPLOY_BACKEND=false
            shift
            ;;
        --no-frontend)
            DEPLOY_FRONTEND=false
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [--no-backend] [--no-frontend]"
            echo "  --no-backend    Skip backend deployment"
            echo "  --no-frontend   Skip frontend deployment"
            exit 0
            ;;
    esac
done

# Logging function
log() {
    local log_level=$1
    local message=$2
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} [${log_level}] ${message}" | tee -a "$DEPLOY_LOG"
}

# Error handler
handle_error() {
    log "ERROR" "${RED}Deployment failed at line $1. Check the log file for details: $DEPLOY_LOG${NC}"
    exit 1
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking deployment prerequisites..."
    
    # Check if deployment scripts exist and are executable
    if [ ! -f "$BACKEND_SCRIPT" ]; then
        log "ERROR" "${RED}Backend deployment script not found: $BACKEND_SCRIPT${NC}"
        exit 1
    fi
    
    if [ ! -f "$FRONTEND_SCRIPT" ]; then
        log "ERROR" "${RED}Frontend deployment script not found: $FRONTEND_SCRIPT${NC}"
        exit 1
    fi
    
    if [ ! -x "$BACKEND_SCRIPT" ]; then
        log "WARNING" "${YELLOW}Making backend script executable...${NC}"
        chmod +x "$BACKEND_SCRIPT"
    fi
    
    if [ ! -x "$FRONTEND_SCRIPT" ]; then
        log "WARNING" "${YELLOW}Making frontend script executable...${NC}"
        chmod +x "$FRONTEND_SCRIPT"
    fi
    
    # Check required tools
    required_tools=("ssh" "scp" "curl" "java")
    for tool in "${required_tools[@]}"; do
        if ! command_exists "$tool"; then
            log "ERROR" "${RED}Required tool not found: $tool${NC}"
            exit 1
        fi
    fi
    
    # Check environment variables
    required_vars=("JAVA_HOME")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log "WARNING" "${YELLOW}Environment variable not set: $var${NC}"
        fi
    fi
    
    log "INFO" "${GREEN}All prerequisites checked successfully.${NC}"
}

# Execute deployment scripts
execute_deployment() {
    local script=$1
    local name=$2
    local start_time=$(date +%s)
    
    log "INFO" "Starting $name deployment..."
    
    # Execute the deployment script
    if ! $script >> "$DEPLOY_LOG" 2>&1; then
        log "ERROR" "${RED}$name deployment failed. See log for details.${NC}"
        exit 1
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log "INFO" "${GREEN}$name deployment completed successfully in $duration seconds.${NC}"
}

# Verify deployment
verify_deployment() {
    log "INFO" "Verifying complete deployment status..."
    
    # Add verification steps here (e.g., check if services are running)
    local verification_errors=0
    
    # Backend verification
    if $DEPLOY_BACKEND; then
        log "INFO" "Verifying backend deployment..."
        # Example: Check if backend service is running
        if ! curl -s -f http://localhost:8080/api/health > /dev/null; then
            log "ERROR" "${RED}Backend service is not responding.${NC}"
            ((verification_errors++))
        else
            log "INFO" "${GREEN}Backend verification successful.${NC}"
        fi
    fi
    
    # Frontend verification
    if $DEPLOY_FRONTEND; then
        log "INFO" "Verifying frontend deployment..."
        # Example: Check if frontend is accessible
        if ! curl -s -f http://localhost:80 > /dev/null; then
            log "ERROR" "${RED}Frontend is not accessible.${NC}"
            ((verification_errors++))
        else
            log "INFO" "${GREEN}Frontend verification successful.${NC}"
        fi
    fi
    
    if [ $verification_errors -eq 0 ]; then
        log "INFO" "${GREEN}All deployment verifications passed!${NC}"
        return 0
    else
        log "ERROR" "${RED}Deployment verification found $verification_errors errors.${NC}"
        return 1
    fi
}

# Main execution
main() {
    log "INFO" "====== Starting deployment process ======"
    
    # Initialize log file
    echo "====== Deployment Log $(date) ======" > "$DEPLOY_LOG"
    
    # Check prerequisites
    check_prerequisites
    
    # Perform deployments
    if $DEPLOY_BACKEND; then
        execute_deployment "$BACKEND_SCRIPT" "Backend"
    else
        log "INFO" "${YELLOW}Skipping backend deployment as requested.${NC}"
    fi
    
    if $DEPLOY_FRONTEND; then
        execute_deployment "$FRONTEND_SCRIPT" "Frontend"
    else
        log "INFO" "${YELLOW}Skipping frontend deployment as requested.${NC}"
    fi
    
    # Verify full deployment
    if verify_deployment; then
        log "INFO" "${GREEN}====== Deployment completed successfully! ======${NC}"
        exit 0
    else
        log "ERROR" "${RED}====== Deployment completed with verification errors ======${NC}"
        exit 1
    fi
}

# Execute main function
main

