import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const configurePassport = () => {
    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    // Google OAuth Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ googleId: profile.id });
                    let isNewUser = false;

                    if (user) {
                        // User exists, return user
                        return done(null, { user, isNewUser: false });
                    }

                    // Create new user with default role (will be updated after role selection)
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        avatar: profile.photos[0]?.value || '',
                        authProvider: 'google',
                        role: 'user', // Default role, can be changed
                    });

                    isNewUser = true;
                    done(null, { user, isNewUser });
                } catch (error) {
                    console.error('Error in Google OAuth strategy:', error);
                    done(error, null);
                }
            }
        )
    );
};

export default configurePassport;
