const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
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
