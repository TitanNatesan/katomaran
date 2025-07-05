const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const logger = require('./logger');

module.exports = function (passport) {
    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? 'https://katomaran-yy6g.onrender.com/api/auth/github/callback'
            : 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                logger.info('GitHub OAuth callback received', {
                    profileId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0]?.value
                });

                // Check if user already exists with this GitHub ID
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    logger.info('Existing GitHub user found', { userId: user._id });
                    return done(null, user);
                }

                // Check if user exists with the same email
                const email = profile.emails?.[0]?.value;
                if (email) {
                    user = await User.findOne({ email: email.toLowerCase() });
                    if (user) {
                        // Link GitHub account to existing user
                        user.githubId = profile.id;
                        user.username = profile.username;
                        if (profile.photos?.[0]?.value && !user.avatar) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                        logger.info('Linked GitHub account to existing user', { userId: user._id });
                        return done(null, user);
                    }
                }

                // Create new user
                user = new User({
                    githubId: profile.id,
                    username: profile.username,
                    name: profile.displayName || profile.username,
                    email: email ? email.toLowerCase() : `${profile.username}@github.local`,
                    avatar: profile.photos?.[0]?.value || null
                });

                await user.save();
                logger.info('New GitHub user created', { userId: user._id });
                return done(null, user);

            } catch (error) {
                logger.error('GitHub OAuth error', { error: error.message, stack: error.stack });
                return done(error, null);
            }
        }));

    // Serialize user for the session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

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
