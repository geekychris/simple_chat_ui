
# AI Chat Application

A modern chat application with AI capabilities, file upload support, and Markdown rendering.

## Customizing the Application Icon

To change the application icon, you'll need to replace the following files in the `public` directory:

1. `favicon.ico` - The main favicon file that appears in browser tabs and bookmarks
   - Should contain both 16x16 and 32x32 sizes
   - Can be created using tools like [Favicon.ico Generator](https://www.favicon.ico-generator.org/)

2. `logo192.png` - Used for:
   - Progressive Web App (PWA) icons
   - Apple Touch Icon
   - Size: 192x192 pixels
   - Format: PNG with transparency

3. `logo512.png` - Used for:
   - Progressive Web App (PWA) icons on high-resolution devices
   - Size: 512x512 pixels
   - Format: PNG with transparency

### Creating Icons

1. Start with a high-resolution image (at least 512x512 pixels)
2. Create different sizes using an image editor or online tool:
   - [Favicon Generator](https://realfavicongenerator.net/) - Comprehensive favicon generator
   - [Adobe Express](https://www.adobe.com/express/create/logo) - Create and resize icons
   - [Figma](https://www.figma.com/) - Design and export icons

### Testing Icons

After replacing the icon files:
1. Clear your browser cache
2. Run `npm run build` to create a production build
3. Test in different browsers and devices
4. Verify the icon appears correctly in:
   - Browser tabs
   - Bookmarks
   - Mobile device home screens (if added to home screen)
   - Progressive Web App installations

# Project Name

## 1. Project Overview

This project consists of a Spring Boot backend application and a frontend application that communicate through an API. The backend handles business logic and data persistence, while the frontend provides the user interface.

### Technologies Used

- **Backend**: Spring Boot, Java
- **Frontend**: [Frontend Technology - e.g., React, Angular, Vue]
- **Database**: [Database - e.g., MySQL, PostgreSQL, MongoDB]
- **Deployment**: Nginx (as reverse proxy), Docker (optional)

## 2. Local Development Setup

### Prerequisites

- Java JDK 11 or higher
- Maven or Gradle (depending on your Spring Boot setup)
- [Frontend requirements - e.g., Node.js, npm/yarn]
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/your-repo.git
   cd your-repo/backend
   ```

2. Build the Spring Boot application:
   ```bash
   # If using Maven
   mvn clean install
   
   # If using Gradle
   ./gradlew build
   ```

3. Run the application locally:
   ```bash
   # If using Maven
   mvn spring-boot:run
   
   # If using Gradle
   ./gradlew bootRun
   ```

4. The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   # If using npm
   npm install
   
   # If using yarn
   yarn install
   ```

3. Start the development server:
   ```bash
   # If using npm
   npm start
   
   # If using yarn
   yarn start
   ```

4. The frontend will be available at `http://localhost:3000`

### Local Development with Nginx (Optional)

If you want to simulate the production environment locally with nginx as a reverse proxy:

1. Install nginx on your local machine.

2. Create a local nginx configuration file (e.g., `local-nginx.conf`):
   ```nginx
   server {
       listen 80;
       server_name localhost;

       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Start nginx with the custom configuration:
   ```bash
   nginx -c /path/to/local-nginx.conf
   ```

4. Access the application at `http://localhost`

## 3. Production Deployment

### Backend Deployment

1. Build the Spring Boot application for production:
   ```bash
   # If using Maven
   mvn clean package -P production
   
   # If using Gradle
   ./gradlew build -P production
   ```

2. The JAR file will be created in the `target` directory (Maven) or `build/libs` directory (Gradle).

3. Transfer the JAR file to the production server:
   ```bash
   scp target/your-application.jar user@your-server:/path/to/deployment/
   ```

4. Create a systemd service file on the production server (e.g., `/etc/systemd/system/your-app.service`):
   ```
   [Unit]
   Description=Your Spring Boot Application
   After=network.target

   [Service]
   User=your-user
   WorkingDirectory=/path/to/deployment
   ExecStart=/usr/bin/java -jar your-application.jar
   SuccessExitStatus=143
   TimeoutStopSec=10
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

5. Enable and start the service:
   ```bash
   sudo systemctl enable your-app.service
   sudo systemctl start your-app.service
   ```

### Frontend Deployment

1. Build the frontend for production:
   ```bash
   # If using npm
   npm run build
   
   # If using yarn
   yarn build
   ```

2. Transfer the built files (usually in the `build` or `dist` directory) to the production server:
   ```bash
   scp -r build/* user@your-server:/path/to/nginx/html/
   ```

### Nginx Configuration on Production

1. Install nginx on your production server:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create a site configuration file (e.g., `/etc/nginx/sites-available/your-app`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Redirect HTTP to HTTPS
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-domain.com;

       # SSL configuration
       ssl_certificate /path/to/your/certificate.crt;
       ssl_certificate_key /path/to/your/private.key;
       
       # SSL settings
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
       ssl_session_timeout 1d;
       ssl_session_cache shared:SSL:10m;
       ssl_session_tickets off;

       # Frontend
       location / {
           root /path/to/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://backend-server-ip:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. Enable the site and restart nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
   sudo nginx -t  # Test nginx configuration
   sudo systemctl restart nginx
   ```

## 4. Architecture Overview

### System Components

1. **Frontend Application**
   - Provides the user interface
   - Makes API calls to the backend

2. **Nginx Reverse Proxy**
   - Serves static frontend files
   - Routes API requests to the backend server
   - Handles SSL termination
   - Load balancing (if multiple backend instances)

3. **Spring Boot Backend**
   - Implements business logic
   - Handles database operations
   - Provides REST API endpoints

4. **Database**
   - Stores application data

### Communication Flow

```
User → Nginx → Frontend Static Files
     ↓
     → Nginx → Backend API → Database
```

### Nginx as a Reverse Proxy

Nginx serves as a reverse proxy in this architecture, which provides several benefits:

1. **Unified Entry Point**: All requests (frontend and API) go through a single domain/port.
2. **Security**: The backend server is not directly exposed to the internet.
3. **SSL Termination**: Nginx handles SSL, simplifying backend configuration.
4. **Load Balancing**: If needed, Nginx can distribute requests across multiple backend instances.
5. **Static File Serving**: Efficiently serves frontend files.

## 5. Deployment Scripts

### Deployment Script for Backend

Create a file named `deploy-backend.sh`:

```bash
#!/bin/bash

# Configuration
SERVER_USER="your-user"
SERVER_IP="your-server-ip"
SERVER_PATH="/path/to/deployment"
APP_NAME="your-application.jar"
SERVICE_NAME="your-app.service"

# Build the application
echo "Building the Spring Boot application..."
./mvnw clean package -P production

# Transfer the JAR file
echo "Transferring the JAR file to the server..."
scp target/$APP_NAME $SERVER_USER@$SERVER_IP:$SERVER_PATH/

# Restart the service
echo "Restarting the service..."
ssh $SERVER_USER@$SERVER_IP "sudo systemctl restart $SERVICE_NAME"

echo "Deployment completed successfully!"
```

Make the script executable:
```bash
chmod +x deploy-backend.sh
```

### Deployment Script for Frontend

Create a file named `deploy-frontend.sh`:

```bash
#!/bin/bash

# Configuration
SERVER_USER="your-user"
SERVER_IP="your-server-ip"
SERVER_PATH="/path/to/nginx/html"

# Build the frontend
echo "Building the frontend application..."
npm run build

# Transfer the built files
echo "Transferring files to the server..."
scp -r build/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "Frontend deployment completed successfully!"
```

Make the script executable:
```bash
chmod +x deploy-frontend.sh
```

### Full Deployment Script

Create a file named `deploy.sh` that handles both frontend and backend deployment:

```bash
#!/bin/bash

echo "Starting full deployment process..."

# Deploy backend
echo "Deploying backend..."
./deploy-backend.sh

# Deploy frontend
echo "Deploying frontend..."
./deploy-frontend.sh

echo "Full deployment completed successfully!"
```

Make the script executable:
```bash
chmod +x deploy.sh
```

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Frontend Framework Documentation]

## Contributing

[Add contribution guidelines here]

## License

[Add license information here]

