import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const updateAvatars = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users with empty or missing avatars
        const usersWithoutAvatars = await User.find({
            $or: [
                { avatar: { $exists: false } },
                { avatar: '' },
                { avatar: null }
            ]
        });

        console.log(`Found ${usersWithoutAvatars.length} users without avatars`);

        // Update each user
        let updatedCount = 0;
        for (const user of usersWithoutAvatars) {
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`;
            await user.save();
            updatedCount++;
            console.log(`Updated avatar for user: ${user.name} (${user.email})`);
        }

        console.log(`\nSuccessfully updated ${updatedCount} users`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error updating avatars:', error);
        process.exit(1);
    }
};

// Run the update
updateAvatars();
