const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { getLyrics } = require('./services/youtubeService');
const { getImageUrl } = require('./services/imageService');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create a new Lyric-Image Post
app.post('/api/posts', async (req, res) => {
  const { title, youtubeUrl, concept } = req.body;
  try {
    const lyrics = await getLyrics(youtubeUrl);
    const imageUrl = getImageUrl(concept);
    
    const post = await prisma.post.create({
      data: { title, lyrics, imageUrl }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    include: { comments: true, reactions: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(posts);
});

// Add a reaction
app.post('/api/posts/:id/react', async (req, res) => {
  const { type } = req.body;
  const postId = parseInt(req.params.id);
  const reaction = await prisma.reaction.create({
    data: { type, postId }
  });
  res.json(reaction);
});

// Add a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const postId = parseInt(req.params.id);
  const comment = await prisma.comment.create({
    data: { content, postId }
  });
  res.json(comment);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));