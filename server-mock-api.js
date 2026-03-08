/**
 * Simple Mock API Server for Development
 *
 * This provides mock data for social features in local development.
 * In production, Vercel serverless functions handle the real API.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/social/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev API server running (mock data)' });
});

// Mock posts endpoint
app.get('/api/social/posts', (req, res) => {
  res.json({
    success: true,
    posts: [
      {
        _id: 'mock-1',
        author_id: 'mock-user',
        author_name: 'Demo User',
        author_photo: null,
        content: 'Welcome to SeshNx! This is mock data for development. The social feed will work with real data on Vercel deployment.',
        category: 'General',
        created_at: new Date().toISOString(),
        likes: 0,
        comments: 0,
        reposts: 0
      }
    ],
    total: 1
  });
});

// Mock comments endpoint
app.get('/api/social/comments', (req, res) => {
  res.json({ success: true, comments: [] });
});

// Mock reactions endpoint
app.get('/api/social/reactions', (req, res) => {
  res.json({ success: true, reactions: [] });
});

// Mock follows endpoint
app.get('/api/social/follows', (req, res) => {
  res.json({ success: true, follows: [] });
});

// Mock saved endpoint
app.get('/api/social/saved', (req, res) => {
  res.json({ success: true, saved: [] });
});

// Handle POST requests with mock responses
app.post('/api/social/posts', (req, res) => {
  res.json({
    success: true,
    post: {
      _id: 'new-mock-post',
      ...req.body,
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/social/comments', (req, res) => {
  res.json({ success: true, comment: { _id: 'new-mock-comment', ...req.body } });
});

app.post('/api/social/reactions', (req, res) => {
  res.json({ success: true, reaction: { ...req.body } });
});

app.post('/api/social/follows', (req, res) => {
  res.json({ success: true, follow: { ...req.body } });
});

app.post('/api/social/saved', (req, res) => {
  res.json({ success: true, saved: { ...req.body } });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Mock Dev API Server running on http://localhost:${PORT}`);
  console.log(`📡 Providing mock data for social features`);
  console.log(`💡 Real API endpoints work on Vercel deployment\n`);
});
