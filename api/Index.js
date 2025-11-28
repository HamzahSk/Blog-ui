require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// --- KONEKSI DATABASE (MongoDB Atlas) ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// --- SKEMA DATABASE (Disederhanakan) ---
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String, // Hanya menyimpan URL sebagai string
    videoUrl: String, // Hanya menyimpan URL sebagai string
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- PENGATURAN ---
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '../public'))); // Ubah rute statis

// --- RUTE ---
app.get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('index', { posts });
});

app.get('/new', (req, res) => {
    res.render('new-post');
});

// --- RUTE POST (Disederhanakan) ---
app.post('/new', async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl, // Ambil URL dari form
            videoUrl: req.body.videoUrl  // Ambil URL dari form
        });
        await newPost.save();
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.send('Terjadi error saat membuat post.');
    }
});

// Export aplikasi untuk Vercel
module.exports = app;
