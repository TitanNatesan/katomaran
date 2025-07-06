const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.githubId;
        }
    },
    githubId: {
        type: String,
        sparse: true
    },
    username: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true,
        required: function () {
            return !this.githubId;
        }
    },
    avatar: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create indices for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ githubId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
