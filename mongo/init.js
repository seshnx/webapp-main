// MongoDB Initialization Script for AI Transparency System
// Author: seshnx
// Date: 2026-03-05

const { MongoClient } = require('mongodb');

async function initializeDB() {
    const client = new MongoClient('mongodb://localhost:27017'); // Update with your MongoDB connection string
    try {
        await client.connect();
        const db = client.db('AITransparencySystem');

        // Create collections
        const collections = ['requests', 'responses', 'logs'];
        for (const collection of collections) {
            await db.createCollection(collection);
        }

        // Create indexes
        await db.collection('requests').createIndex({ timestamp: 1 });
        await db.collection('responses').createIndex({ requestId: 1 });

        // Set validators for collections
        await db.command({
            collMod: 'requests',
            validator: { $jsonSchema: {
                bsonType: 'object',
                required: ['requestId', 'data'],
                properties: {
                    requestId: { bsonType: 'string' },
                    data: { bsonType: 'object' },
                    timestamp: { bsonType: 'date' }
                }
            } },
            validationAction: 'error'
        });

        await db.command({
            collMod: 'responses',
            validator: { $jsonSchema: {
                bsonType: 'object',
                required: ['requestId', 'responseData'],
                properties: {
                    requestId: { bsonType: 'string' },
                    responseData: { bsonType: 'object' },
                    timestamp: { bsonType: 'date' }
                }
            } },
            validationAction: 'error'
        });

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing the database:', error);
    } finally {
        await client.close();
    }
}

initializeDB();