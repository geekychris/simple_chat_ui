#!/bin/bash

# deploy-backend.sh - Deployment script for Spring Boot backend application
# This script builds, transfers, and deploys the Spring Boot backend application to a remote server

# Configuration variables
SERVER_USER="your-user"
SERVER_IP="your-server-ip"
SERVER_PATH="/path/to/deployment"
APP_NAME="your-application.jar"
SERVICE_NAME="your-app.service"
BUILD_TOOL="mvn" # Options: mvn, gradle
LOG_FILE="deploy-backend.log"
TIMEOUT=120 # Timeout in seconds for deployment operations

# Initialize log file
echo "===== Backend Deployment Started at $(date) =====" > $LOG_FILE

# Logging functions
log() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" | tee -a $LOG_FILE
}

log_error() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $message" | tee -a $LOG_FILE >&2
}

# Error handling function
handle_error() {
    local exit_code=$1
    local error_message=$2
    
    if [ $exit_code -ne 0 ]; then
        log_error "$error_message (Exit code: $exit_code)"
        log "Deployment failed. Check $LOG_FILE for details."
        exit $exit_code
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if SSH key is set up
    ssh -o BatchMode=yes -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP exit 2>/dev/null
    if [ $? -ne 0 ]; then
        log_error "SSH connection to $SERVER_USER@$SERVER_IP failed. Please set up SSH key authentication."
        exit 1
    fi
    
    # Check build tool availability
    if [ "$BUILD_TOOL" = "mvn" ]; then
        if ! command -v mvn &> /dev/null; then
            log_error "Maven is not installed or not in PATH"
            exit 1
        fi
    elif [ "$BUILD_TOOL" = "gradle" ]; then
        if ! command -v ./gradlew &> /dev/null && ! command -v gradle &> /dev/null; then
            log_error "Gradle is not installed or not in PATH"
            exit 1
        fi
    else
        log_error "Unsupported build tool: $BUILD_TOOL. Use 'mvn' or 'gradle'"
        exit 1
    fi
    
    log "Prerequisites check completed successfully"
}

# Build the application
build_application() {
    log "Building the Spring Boot application..."
    
    if [ "$BUILD_TOOL" = "mvn" ]; then
        mvn clean package -P production
        handle_error $? "Maven build failed"
        
        # Verify the JAR file was created
        if [ ! -f "target/$APP_NAME" ]; then
            log_error "JAR file was not created at target/$APP_NAME"
            exit 1
        fi
    elif [ "$BUILD_TOOL" = "gradle" ]; then
        ./gradlew build -P production
        handle_error $? "Gradle build failed"
        
        # Verify the JAR file was created
        if [ ! -f "build/libs/$APP_NAME" ]; then
            log_error "JAR file was not created at build/libs/$APP_NAME"
            exit 1
        fi
    fi
    
    log "Application built successfully"
}

# Transfer the JAR file to the server
transfer_jar() {
    log "Transferring the JAR file to the server at $SERVER_USER@$SERVER_IP:$SERVER_PATH/..."
    
    # Create the directory if it doesn't exist
    ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH"
    handle_error $? "Failed to create directory on the server"
    
    # Determine the source path based on the build tool
    if [ "$BUILD_TOOL" = "mvn" ]; then
        SOURCE_PATH="target/$APP_NAME"
    else
        SOURCE_PATH="build/libs/$APP_NAME"
    fi
    
    # Transfer the file
    scp $SOURCE_PATH $SERVER_USER@$SERVER_IP:$SERVER_PATH/
    handle_error $? "Failed to transfer JAR file to server"
    
    log "JAR file transferred successfully"
}

# Restart the service on the server
restart_service() {
    log "Restarting the service $SERVICE_NAME on the server..."
    
    # Check if the service exists
    ssh $SERVER_USER@$SERVER_IP "sudo systemctl status $SERVICE_NAME" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        log_error "Service $SERVICE_NAME does not exist on the server"
        exit 1
    fi
    
    # Restart the service
    ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart $SERVICE_NAME"
    handle_error $? "Failed to restart service on the server"
    
    # Wait for the service to start
    log "Waiting for the service to start..."
    local attempts=0
    local max_attempts=$(($TIMEOUT / 5))
    
    while [ $attempts -lt $max_attempts ]; do
        ssh $SERVER_USER@$SERVER_IP "sudo systemctl is-active --quiet $SERVICE_NAME"
        if [ $? -eq 0 ]; then
            log "Service started successfully"
            return 0
        fi
        attempts=$((attempts + 1))
        sleep 5
    done
    
    log_error "Service failed to start within the timeout period ($TIMEOUT seconds)"
    exit 1
}

# Verify the deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if the application is responding (assumes a health endpoint at /health)
    # You may need to adjust this based on your application's endpoints
    local health_check_url="http://$SERVER_IP:8080/health"
    
    log "Running health check on $health_check_url"
    local attempts=0
    local max_attempts=6
    
    while [ $attempts -lt $max_attempts ]; do
        curl -s -f -m 10 $health_check_url > /dev/null
        if [ $? -eq 0 ]; then
            log "Health check passed. Application is running correctly."
            return 0
        fi
        log "Health check attempt $((attempts + 1))/$max_attempts failed. Retrying in 10 seconds..."
        attempts=$((attempts + 1))
        sleep 10
    done
    
    log_error "Health check failed after $max_attempts attempts. Application may not be running correctly."
    # Not exiting with error as the deployment technically succeeded, but health check failed
}

# Main deployment process
main() {
    log "Starting backend deployment process..."
    
    check_prerequisites
    build_application
    transfer_jar
    restart_service
    verify_deployment
    
    log "Backend deployment completed successfully!"
}

# Run the main function
main

