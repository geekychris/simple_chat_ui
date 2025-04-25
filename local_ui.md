# Frontend Application Guide

This document provides instructions for running and modifying the Chat UI frontend application.

## Running the Frontend Locally

Follow these steps to run the frontend application on your laptop:

1. **Prerequisites**
   - Make sure you have Node.js installed on your laptop
   - You can check by running `node -v` in your terminal

2. **Installation**
   - Open a terminal and navigate to the project directory:
     ```
     cd /Users/chris/code/warp_experiments/in_git/chat_ui
     ```
   - Install the required dependencies:
     ```
     npm install
     ```

3. **Starting the Development Server**
   - Run the following command to start the development server:
     ```
     npm start
     ```
   - The application will automatically open in your default browser at http://localhost:3000
   - If it doesn't open automatically, you can manually navigate to http://localhost:3000 in your browser

4. **Building for Production**
   - If you need a production build, run:
     ```
     npm run build
     ```
   - This will create a `build` directory with optimized production files

## Modifying the API URL

The application currently connects to a backend API at `http://localhost:8080/ai/chatjson`. To change this URL:

1. Open the file `src/App.js` in your code editor
2. Locate the API call in the `sendMessage` function (around line 37):
   ```javascript
   const response = await axios.get(`http://localhost:8080/ai/chatjson`, {
     params: { message: userMessage.text }
   });
   ```
3. Modify the URL to point to your desired endpoint
   ```javascript
   // Example: Changing to a different server
   const response = await axios.get(`https://api.example.com/chat`, {
     params: { message: userMessage.text }
   });
   ```

## Modifying the Request Format

The current implementation uses a GET request with query parameters. You can modify this to use different HTTP methods or data formats:

### Changing to a POST Request

```javascript
const response = await axios.post(`http://localhost:8080/ai/chatjson`, {
  message: userMessage.text
  // Add any additional fields needed by your API
});
```

### Adding Headers

```javascript
const response = await axios.post(`http://localhost:8080/ai/chatjson`, {
  message: userMessage.text
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    // Add any other required headers
  }
});
```

### Using a Different Request Structure

If your API expects a different data structure:

```javascript
const response = await axios.post(`http://localhost:8080/ai/chatjson`, {
  query: {
    text: userMessage.text,
    timestamp: new Date().toISOString()
  },
  user: {
    id: 'user123',
    session: 'session456'
  }
  // Any other required fields
});
```

### Processing Different Response Formats

If the API returns data in a different format, you'll also need to update how you handle the response:

```javascript
// Example: If the API returns { data: { message: "response text" } }
setMessages((prevMessages) => [
  ...prevMessages,
  {
    text: response.data.data.message, // Access nested properties
    sender: 'bot',
    timestamp: new Date().toISOString()
  }
]);
```

## Troubleshooting

If you encounter CORS issues when connecting to an external API:
- Ensure your API server has CORS enabled
- Consider using a proxy in your development environment by adding a "proxy" field in package.json:
  ```json
  {
    "name": "react-chat-app",
    "version": "0.1.0",
    "private": true,
    "proxy": "https://api.example.com",
    ...
  }
  ```
  Then use relative URLs in your code: `axios.get('/ai/chatjson')`

