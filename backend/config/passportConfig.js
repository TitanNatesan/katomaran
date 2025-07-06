const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('./logger');

module.exports = function (passport) {
    // GitHub Strategy - only initialize if credentials are available
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET &&
        process.env.GITHUB_CLIENT_ID !== 'your_github_client_id_here' &&
        process.env.GITHUB_CLIENT_SECRET !== 'your_github_client_secret_here') {

        passport.use('github', new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === 'production'
                ? 'https://katomaran-yy6g.onrender.com/api/auth/github/callback'
                : 'http://localhost:5000/api/auth/github/callback',
            scope: ['user:email']
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    logger.info('GitHub OAuth callback received', { profileId: profile.id });

                    const email = (profile.emails && profile.emails[0] && profile.emails[0].value)
                        ? profile.emails[0].value
                        : `${profile.username || profile.id}@users.noreply.github.com`;

                    if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
                        logger.warn('No email found in GitHub profile', { profileId: profile.id, username: profile.username });
                    }

                    let user = await User.findOne({ githubId: profile.id });
                    if (!user) {
                        user = await User.create({
                            githubId: profile.id,
                            email: email,
                            username: profile.username,
                            name: profile.displayName || profile.username,
                        });
                        logger.info('New GitHub user created', { userId: user._id, email: email });
                    } else {
                        logger.info('Existing GitHub user found', { userId: user._id, email: user.email });
                    }
                    return done(null, user);
                } catch (err) {
                    logger.error('GitHub OAuth error', { error: err.message, stack: err.stack });
                    return done(err, null);
                }
            }));
    } else {
        logger.warn('GitHub OAuth not configured - missing or default credentials');
    }

    // Google Strategy - only initialize if credentials are available
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
        process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {

        passport.use('google', new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === 'production'
                ? 'https://katomaran-yy6g.onrender.com/api/auth/google/callback'
                : 'http://localhost:5000/api/auth/google/callback'
        },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    logger.info('Google OAuth callback received', {
                        profileId: profile.id,
                        email: profile.emails?.[0]?.value,
                        name: profile.displayName
                    });

                    // Check if user already exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        logger.info('Existing Google user found', { userId: user._id });
                        return done(null, user);
                    }

                    // Check if user exists with the same email
                    const email = profile.emails?.[0]?.value;
                    if (email) {
                        user = await User.findOne({ email: email.toLowerCase() });
                        if (user) {
                            // Link Google account to existing user
                            user.googleId = profile.id;
                            if (profile.photos?.[0]?.value && !user.avatar) {
                                user.avatar = profile.photos[0].value;
                            }
                            await user.save();
                            logger.info('Linked Google account to existing user', { userId: user._id });
                            return done(null, user);
                        }
                    }

                    // Create new user
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
                        email: email ? email.toLowerCase() : `${profile.id}@google.local`,
                        avatar: profile.photos?.[0]?.value || null
                    });
                    await user.save();
                    logger.info('New Google user created', { userId: user._id });
                    return done(null, user);

                } catch (error) {
                    logger.error('Google OAuth error', { error: error.message, stack: error.stack });
                    return done(error, null);
                }
            }));
    } else {
        logger.warn('Google OAuth not configured - missing or default credentials');
    }

    // Serialize user for the session
    passport.serializeUser((user, done) => done(null, user._id));

    // Deserialize user from the session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
