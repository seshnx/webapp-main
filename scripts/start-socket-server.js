/**
 * Socket.io Server Starter Script
 *
 * Starts the Socket.io server for real-time updates
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, '..', 'server.js');

console.log('🚀 Starting Socket.io server...');

const socketServer = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env, SOCKET_PORT: process.env.SOCKET_PORT || '3001' }
});

socketServer.on('error', (error) => {
  console.error('❌ Failed to start Socket.io server:', error);
  process.exit(1);
});

socketServer.on('exit', (code) => {
  console.log(`Socket.io server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down Socket.io server...');
  socketServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down Socket.io server...');
  socketServer.kill('SIGINT');
});