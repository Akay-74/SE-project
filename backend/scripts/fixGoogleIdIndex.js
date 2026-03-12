import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixGoogleIdIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Drop the existing googleId index
        try {
            await usersCollection.dropIndex('googleId_1');
            console.log('Dropped old googleId_1 index');
        } catch (error) {
            console.log('Index googleId_1 does not exist or already dropped');
        }

        // Create a new sparse unique index for googleId
        await usersCollection.createIndex(
            { googleId: 1 },
            { unique: true, sparse: true }
        );
        console.log('Created new sparse unique index for googleId');

        // List all indexes to verify
        const indexes = await usersCollection.indexes();
        console.log('\nCurrent indexes:');
        indexes.forEach(index => {
            console.log(`- ${index.name}:`, index.key, index.sparse ? '(sparse)' : '');
        });

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

fixGoogleIdIndex();
