import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';

// GoogleStrategy: email + пароль 
passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                hash: '',
            });

            await newUser.save();
            done(null, newUser);
        } catch (error) {
            done(error);
        }
    }
));

// запихиваем id в сессию
passport.serializeUser((user, done) => done(null, user.id));

// вытаскиваем пользователя из id в сессии
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
