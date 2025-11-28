require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// --- KONEKSI DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// --- SKEMA DATABASE (Tetap sama) ---
const postSchema = new mongoose.Schema({ title: String, content: String, imageUrl: String, videoUrl: String, createdAt: { type: Date, default: Date.now } });
const Post = mongoose.model('Post', postSchema);
const counterSchema = new mongoose.Schema({ name: { type: String, required: true }, count: { type: Number, default: 0 } });
const Counter = mongoose.model('Counter', counterSchema);

// --- KOLAM KONTEN ACAK ---
const randomContentPool = [
    // Fakta Menarik
    { type: 'Fakta Menarik', text: 'Bug komputer pertama benar-benar seekor serangga (ngengat) yang terjebak di dalam relay komputer Mark II Aiken Relay Calculator.' },
    { type: 'Fakta Menarik', text: 'Bahasa pemrograman Python tidak dinamai dari ular, melainkan dari grup komedi Inggris, Monty Python.' },
    { type: 'Fakta Menarik', text: 'Kata "robot" berasal dari kata Ceko "robota", yang berarti "kerja paksa" atau "perbudakan".' },
    { type: 'Fakta Menarik', text: 'Email spam dinamai dari sketsa komedi Monty Python tentang sekaleng daging Spam yang tidak diinginkan namun ada di mana-mana.' },
    { type: 'Fakta Menarik', text: 'Domain .com pertama yang terdaftar adalah Symbolics.com pada 15 Maret 1985.' },
    { type: 'Fakta Menarik', text: 'Hard drive pertama, IBM 350, berukuran sebesar dua kulkas dan hanya bisa menyimpan data sekitar 3.75 MB.' },
    { type: 'Fakta Menarik', text: 'Webcam pertama di dunia diciptakan di Universitas Cambridge untuk memantau sebuah teko kopi agar para peneliti tidak perlu berjalan jauh hanya untuk menemukan teko kosong.' },

    // Pantun Ngoding
    { type: 'Pantun Ngoding', text: 'Jalan-jalan ke kota Blitar,\nJangan lupa membeli paku.\nKalau kamu ingin jadi pintar,\nJangan lupa baca blog-ku.' },
    { type: 'Pantun Ngoding', text: 'Ada server di tengah lautan,\nDiakses client dari kejauhan.\nJangan menyerah wahai kawan,\nError satu pasti ada jalan.' },
    { type: 'Pantun Ngoding', text: 'Beli pisang di pasar baru,\nDitaruh di atas nampan.\nJangan pusing dengan error-mu,\nCoba tanya teman sebelah kanan.' },
    { type: 'Pantun Ngoding', text: 'Langit biru banyak awannya,\nDi bawahnya pohon kelapa.\nWebsite ini saya yang punya,\nKalau jelek jangan dicela ya.' },

    // Kutipan/Cerita Inspiratif
    { type: 'Kutipan Inspiratif', text: '"Talk is cheap. Show me the code." - Linus Torvalds' },
    { type: 'Kutipan Inspiratif', text: '"Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya." - Alan Kay' },
    { type: 'Cerita Singkat', text: 'Seorang programmer senior pernah berkata: "Kode pertamaku jelek. Kode keduaku juga. Tapi kode ke-100-ku... sedikit lebih baik." Intinya adalah terus mencoba dan jangan pernah berhenti belajar.' },
    { type: 'Kutipan Inspiratif', text: '"Setiap orang bodoh bisa menulis kode yang dimengerti komputer. Programmer yang baik menulis kode yang dimengerti manusia." - Martin Fowler' },
];

// --- PENGATURAN & MIDDLEWARE ---
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '../public')));

// Middleware untuk pengunjung & konten acak
app.use(async (req, res, next) => {
    // Logika Penghitung Pengunjung (tetap sama)
    if (req.path === '/') {
        const visitors = await Counter.findOneAndUpdate({ name: 'visitors' }, { $inc: { count: 1 } }, { new: true, upsert: true });
        res.locals.visitorCount = visitors.count;
    } else {
        const visitors = await Counter.findOne({ name: 'visitors' });
        res.locals.visitorCount = visitors ? visitors.count : 0;
    }
    
    // Logika BARU untuk Konten Acak
    const randomIndex = Math.floor(Math.random() * randomContentPool.length);
    res.locals.randomContent = randomContentPool[randomIndex];

    next();
});

// --- RUTE (Tidak ada perubahan) ---
app.get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: 'desc' });
    res.render('index', { posts });
});

app.get('/new', (req, res) => {
    res.render('new-post');
});

app.post('/new', async (req, res) => {
    try {
        const newPost = new Post({ title: req.body.title, content: req.body.content, imageUrl: req.body.imageUrl, videoUrl: req.body.videoUrl });
        await newPost.save();
        res.redirect('/');
    } catch (e) {
        console.error(e);
        res.send('Terjadi error saat membuat post.');
    }
});

module.exports = app;
