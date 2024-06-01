print('[Mongo DB Init] Start creating index and inserting data...');

conn = new Mongo();
db = conn.getDB('swapi_db');

db.resourceCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
db.resourceCollection.createIndex({ path: 1 }, { unique: true });

print('[Mongo DB Init] Data inserted successfully!');
