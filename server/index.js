import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import './passport.js';
import authRouter from './routes/auth.js';
import connectDB from './database.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'app', 'views'));

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 10000 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '..', 'app', 'public')));

app.use(authRouter);


app.get('/users', async (req, res) => {
    try {
        const users = await User.find();

        res.render('users', { title: 'Користувачі', users });
    } catch (error) {
        res.status(500).send('Щось не так (users)');
    }
});

app.get('/', (req, res) => {
    res.render('index', { title: 'Головна', user: req.user });
});

app.get('/protected', (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('protected', { title: 'Захищена', user: req.user });
    }
    res.redirect('/signin');
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
