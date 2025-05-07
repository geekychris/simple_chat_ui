# React and Spring Boot Integration

## Overview

This document explains how the React frontend is built and served by the Spring Boot application. The integration allows for a single deployable JAR file that contains both the frontend and backend components.

The key benefits of this approach include:
- Simplified deployment with a single artifact
- Consistent runtime environment
- Shared authentication and session management
- Optimized production build process

## Build Process

The integration is handled through Maven using the `frontend-maven-plugin` and follows these steps:

1. **Node.js and npm Installation:**
   - `frontend-maven-plugin` installs Node.js and npm locally
   - Versions are specified in pom.xml properties:
     ```xml
     <properties>
         <node.version>v20.11.0</node.version>
         <npm.version>10.2.4</npm.version>
     </properties>
     ```

2. **React Build:**
   - npm dependencies are installed
   - React app is built using `npm run build`
   - Build output goes to the `build` directory

3. **Resource Integration:**
   - Built files are copied to `target/classes/static`
   - Spring Boot serves these files as static content
   - Client-side routing is preserved

## Configuration

### Maven Configuration

```xml
<!-- frontend-maven-plugin -->
<plugin>
    <groupId>com.github.eirslett</groupId>
    <artifactId>frontend-maven-plugin</artifactId>
    <version>${frontend-maven-plugin.version}</version>
    
    <configuration>
        <nodeVersion>${node.version}</nodeVersion>
        <npmVersion>${npm.version}</npmVersion>
        <workingDirectory>${project.basedir}</workingDirectory>
    </configuration>
    
    <executions>
        <!-- Install Node and NPM -->
        <execution>
            <id>install-node-and-npm</id>
            <goals>
                <goal>install-node-and-npm</goal>
            </goals>
        </execution>
        
        <!-- Install dependencies -->
        <execution>
            <id>npm-install</id>
            <goals>
                <goal>npm</goal>
            </goals>
        </execution>
        
        <!-- Build React app -->
        <execution>
            <id>npm-build</id>
            <goals>
                <goal>npm</goal>
            </goals>
            <configuration>
                <arguments>run build</arguments>
            </configuration>
        </execution>
    </executions>
</plugin>

<!-- Resource copying -->
<plugin>
    <artifactId>maven-resources-plugin</artifactId>
    <executions>
        <execution>
            <id>copy-react-build</id>
            <phase>process-resources</phase>
            <goals>
                <goal>copy-resources</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.directory}/classes/static</outputDirectory>
                <resources>
                    <resource>
                        <directory>${project.basedir}/build</directory>
                        <filtering>false</filtering>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### Spring Boot Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, 
                            Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // For API paths, return null to allow controller handling
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        
                        // Serve index.html for client-side routing
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}
```

### React Configuration

```json
{
  "name": "react-chat-app",
  "version": "0.1.0",
  "private": true,
  "homepage": ".",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Environment Setup

### Development Environment

1. **React Development Server:**
   ```bash
   npm start  # Runs on port 3000
   ```

2. **Spring Boot Development:**
   ```bash
   ./mvnw spring-boot:run
   ```

### Production Environment

1. **Build:**
   ```bash
   ./mvnw clean install
   ```

2. **Run:**
   ```bash
   java -jar target/chat-service-0.0.1-SNAPSHOT.jar
   ```

## Directory Structure

```
chat_ui/
├── src/
│   ├── main/
│   │   ├── java/        # Spring Boot backend
│   │   └── resources/   # Spring Boot resources
│   └── ...             # React source files
├── public/             # React public assets
├── build/              # React build output
├── target/            # Spring Boot build output
│   └── classes/
│       └── static/    # React files deployed here
├── pom.xml           # Maven configuration
└── package.json      # npm configuration
```

## Important Notes

1. **Client-Side Routing:**
   - Spring Boot forwards unknown paths to index.html
   - React Router handles client-side routing
   - API paths (/api/*) are handled by controllers

2. **Static Content:**
   - React build files are served as static content
   - Proper caching headers are set
   - Resources are served efficiently

3. **Development vs Production:**
   - Development uses separate servers
   - Production combines everything into one JAR
   - Build process optimizes for production

## Troubleshooting

1. **404 Errors:**
   - Check static content in target/classes/static
   - Verify WebConfig.java configuration
   - Check Spring Boot resource mapping logs

2. **Build Issues:**
   ```bash
   # Clean and rebuild
   rm -rf node/ node_modules/
   ./mvnw clean install
   ```

3. **Port Conflicts:**
   ```bash
   # Find and kill process on port 8080
   lsof -i :8080
   kill -9 <PID>
   ```

## Development Tips

1. **Fast Development Cycle:**
   - Use React dev server for frontend work
   - Run Spring Boot in IDE for backend
   - Build combined JAR for testing production

2. **Debugging:**
   - Enable source maps in production
   - Use Chrome DevTools for React debugging
   - Use IDE debugger for Spring Boot

3. **Best Practices:**
   - Keep React and Spring Boot code separate
   - Use proper API versioning
   - Follow REST conventions
   - Implement proper error handling
