#!/usr/bin/env node

// Simple HTTPS development server for AR testing
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

// Serve static files from current directory
app.use(express.static('.'));

// Create a self-signed certificate for testing
const selfSignedCert = {
  key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
wEiOfnJxowyQAQGElm89tKkRjxwT5VhRBBtMdl/7Q7VFKjErCXTwQU5QdDXVVApZ
YYF1fJRjVppqsUDV0c0Sf/Y2P5aoJsPlCILB2g17vBXbqd4fH+z8LnXCE4lc1HKi
CxQc5KqAGhNb9IYxgj+H7HUu7jj7J9PdFN3GKVQSPJtXxGbdB7cE4cKwP9V8jj7F
y6Qy8kH8gXkMqLq4F5e7a8q5fV8B8V0jd8tVYR7RK8JQnB3kX8uX2z8pCqA6eHb
LYdF8V9LvJ8Q7F7L0L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8
AgMBAAECggEAK8WmPjfBQVP8Ij/L7YrRRbV8C8CpF5ZF8VcZ5Y3mLX8nX8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3X8Y3
-----END PRIVATE KEY-----`,
  cert: `-----BEGIN CERTIFICATE-----
MIICpTCCAY0CAQAwDQYJKoZIhvcNAQELBQAwEjEQMA4GA1UEAwwHdGVzdC1hcjAe
Fw0yNDA3MTUwMDAwMDBaFw0yNTA3MTUwMDAwMDBaMBIxEDAOBgNVBAMMB3Rlc3Qt
YXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us8cKBwEiO
fnJxowyQAQGElm89tKkRjxwT5VhRBBtMdl/7Q7VFKjErCXTwQU5QdDXVVApZYYF1
fJRjVppqsUDV0c0Sf/Y2P5aoJsPlCILB2g17vBXbqd4fH+z8LnXCE4lc1HKiCxQc
5KqAGhNb9IYxgj+H7HUu7jj7J9PdFN3GKVQSPJtXxGbdB7cE4cKwP9V8jj7Fy6Qy
8kH8gXkMqLq4F5e7a8q5fV8B8V0jd8tVYR7RK8JQnB3kX8uX2z8pCqA6eHbLYdF8
V9LvJ8Q7F7L0L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8
wIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC7VJTUt9Us8cKBwEiOfnJxowyQAQGE
lm89tKkRjxwT5VhRBBtMdl/7Q7VFKjErCXTwQU5QdDXVVApZYYF1fJRjVppqsUDV
0c0Sf/Y2P5aoJsPlCILB2g17vBXbqd4fH+z8LnXCE4lc1HKiCxQc5KqAGhNb9IYx
gj+H7HUu7jj7J9PdFN3GKVQSPJtXxGbdB7cE4cKwP9V8jj7Fy6Qy8kH8gXkMqLq4
F5e7a8q5fV8B8V0jd8tVYR7RK8JQnB3kX8uX2z8pCqA6eHbLYdF8V9LvJ8Q7F7L0
L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8L2L8
-----END CERTIFICATE-----`
};

// Create HTTPS server
const server = https.createServer({
  key: selfSignedCert.key,
  cert: selfSignedCert.cert
}, app);

const PORT = 8443;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Server running at:`);
  console.log(`   Local:    https://localhost:${PORT}`);
  console.log(`   Network:  https://[YOUR_IP]:${PORT}`);
  console.log(`\n📱 For Android testing:`);
  console.log(`   1. Find your computer's IP address`);
  console.log(`   2. On Android Chrome, go to: https://[YOUR_IP]:${PORT}/ar-test.html`);
  console.log(`   3. Accept the security warning (self-signed certificate)`);
  console.log(`\n⚠️  Note: You'll see a security warning - click "Advanced" -> "Proceed"`);
});

// Get local IP address
const os = require('os');
const networkInterfaces = os.networkInterfaces();
console.log(`\n🔍 Detected IP addresses:`);
Object.keys(networkInterfaces).forEach(interfaceName => {
  networkInterfaces[interfaceName].forEach(interface => {
    if (interface.family === 'IPv4' && !interface.internal) {
      console.log(`   ${interfaceName}: https://${interface.address}:${PORT}`);
    }
  });
});
