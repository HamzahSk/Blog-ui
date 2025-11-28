require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// --- KONEKSI DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// --- SKEMA DATABASE ---
// Skema untuk Postingan
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String,
    videoUrl: String,
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Skema BARU untuk Penghitung Pengunjung
const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    count: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// --- PENGATURAN & MIDDLEWARE ---
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '../public')));

// Middleware BARU untuk menghitung pengunjung dan menyediakannya secara global
app.use(async (req, res, next) => {
    // Hanya increment jika mengakses halaman utama
    if (req.path === '/') {
        const visitors = await Counter.findOneAndUpdate(
            { name: 'visitors' },
            { $inc: { count: 1 } },
            { new: true, upsert: true } // Opsi ini akan membuat dokumen jika belum ada
        );
        res.locals.visitorCount = visitors.count;
    } else {
        // Untuk halaman lain, cukup ambil datanya tanpa increment
        const visitors = await Counter.findOne({ name: 'visitors' });
        res.locals.visitorCount = visitors ? visitors.count : 0;
    }
    next();
});

// --- RUTE ---
app.get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('index', { posts }); // Tidak perlu passing visitorCount lagi, sudah ada di res.locals
});

app.get('/new', (req, res) => {
    res.render('new-post');
});

app.post('/new', async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            imageUrl: req.body.imageUrl,
            videoUrl: req.body.videoUrl
        });
        await newPost.save();
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.send('Terjadi error saat membuat post.');
    }
});

module.exports = app;
