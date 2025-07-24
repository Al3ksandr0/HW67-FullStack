import bcrypt from 'bcrypt';
import { Router } from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = Router();


router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/signin' }),
    (req, res) => {
        res.redirect('/protected');
    }
);




router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Реєстрація', error: null });
});


router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('signup', {
            title: 'Реєстрація',
            error: 'Усі поля обов’язкові'
        });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.render('signup', {
            title: 'Реєстрація',
            error: 'Користувач вже існує'
        });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, hash });
    await newUser.save();

    res.redirect('/signin');
});


router.get('/signin', (req, res) => {
    const showError = Boolean(req.query.error);
    res.render('signin', {
        title: 'Вхід',
        error: showError ? 'Невірний email або пароль' : null
    });
});

// google
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('signin', {
            title: 'Вхід',
            error: 'Усі поля обов’язкові'
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.render('signin', {
            title: 'Вхід',
            error: 'Невірний email або пароль'
        });
    }

    const isMatch = await bcrypt.compare(password, user.hash);
    if (!isMatch) {
        return res.render('signin', {
            title: 'Вхід',
            error: 'Невірний email або пароль'
        });
    }

    req.login(user, (err) => {
        if (err) {
            return res.render('signin', {
                title: 'Вхід',
                error: 'Помилка при авторизації'
            });
        }
        res.redirect('/protected');
    });
});



router.get('/logout', (req, res, next) => {
    req.logout(err => (err ? next(err) : res.redirect('/')));
});

export default router;
