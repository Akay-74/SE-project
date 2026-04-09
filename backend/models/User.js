import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            sparse: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include password in queries by default
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            default: function () {
                // Generate default avatar based on name
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random&color=fff&size=128`;
            },
        },
        authProvider: {
            type: String,
            enum: ['google', 'local'],
            required: true,
            default: 'local',
        },
        role: {
            type: String,
            enum: ['user', 'manager', 'admin'],
            default: 'user',
        },
        managedHotels: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Hotel',
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
userSchema.index({ role: 1 });

// Ensure avatar is set before saving
userSchema.pre('save', function (next) {
    // If avatar is empty or just whitespace, generate a default one
    if (!this.avatar || this.avatar.trim() === '') {
        this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random&color=fff&size=128`;
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    // Don't hash if there's no password (Google OAuth users)
    if (!this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is manager of a specific hotel
userSchema.methods.isManagerOf = function (hotelId) {
    return this.managedHotels.some(
        (id) => id.toString() === hotelId.toString()
    );
};

// Method to check if user has specific role
userSchema.methods.hasRole = function (role) {
    return this.role === role;
};

const User = mongoose.model('User', userSchema);

export default User;
