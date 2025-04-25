#!/bin/bash

# Frontend Deployment Script
# This script builds and deploys the frontend application

# Set script to exit immediately if a command fails
set -e

# Configuration variables
FRONTEND_DIR="./frontend"
BUILD_DIR="./frontend/build"
DEPLOY_DIR="/var/www/html"
LOG_FILE="frontend-deployment.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
BACKUP_DIR="/var/www/backups/frontend"
BACKUP_NAME="frontend-$(date +"%Y%m%d%H%M%S").tar.gz"

# Function for logging
log() {
    local message="$1"
    echo "[$TIMESTAMP] $message" | tee -a "$LOG_FILE"
}

# Function for error handling
handle_error() {
    log "ERROR: Deployment failed at step: $1"
    log "See log file for details: $LOG_FILE"
    exit 1
}

# Check if running with correct permissions
if [ "$EUID" -ne 0 ]; then 
    log "Please run as root or with sudo privileges"
    exit 1
fi

# Create log file if it doesn't exist
touch "$LOG_FILE"
log "Starting frontend deployment..."

# Backup existing deployment
log "Creating backup of current deployment..."
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$DEPLOY_DIR" . || handle_error "Backup creation"
    log "Backup created at $BACKUP_DIR/$BACKUP_NAME"
else
    log "No existing deployment to backup."
fi

# Navigate to frontend directory
log "Navigating to frontend directory..."
cd "$FRONTEND_DIR" || handle_error "Navigation to frontend directory"

# Install dependencies
log "Installing dependencies..."
npm install --production || handle_error "NPM dependencies installation"

# Build frontend application
log "Building frontend application..."
npm run build || handle_error "Frontend build"

# Verify build
log "Verifying build..."
if [ ! -d "$BUILD_DIR" ]; then
    handle_error "Build verification - build directory not found"
fi

# Count files in build directory to ensure it's not empty
BUILD_FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
if [ "$BUILD_FILE_COUNT" -lt 1 ]; then
    handle_error "Build verification - build directory is empty"
fi

log "Build verification successful. $BUILD_FILE_COUNT files generated."

# Deploy to web server
log "Deploying to web server..."
mkdir -p "$DEPLOY_DIR"
rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/" || handle_error "Deployment to web server"

# Set proper permissions
log "Setting proper permissions..."
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
chown -R www-data:www-data "$DEPLOY_DIR" || handle_error "Setting permissions"

# Verify deployment
log "Verifying deployment..."
DEPLOYED_FILE_COUNT=$(find "$DEPLOY_DIR" -type f | wc -l)
if [ "$DEPLOYED_FILE_COUNT" -lt 1 ]; then
    handle_error "Deployment verification - deployment directory is empty"
fi

log "Deployment verification successful. $DEPLOYED_FILE_COUNT files deployed."

# Restart web server if needed
log "Restarting web server..."
systemctl restart nginx || handle_error "Restarting web server"

# Test accessibility
log "Testing website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$HTTP_STATUS" != "200" ]; then
    log "Warning: Website returned HTTP status $HTTP_STATUS"
    log "Deployment completed but site may not be functioning correctly."
else
    log "Website is accessible and returning 200 OK."
fi

log "Frontend deployment completed successfully!"
exit 0

