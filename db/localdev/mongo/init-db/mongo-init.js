print('[Mongo DB Init] Start creating index and inserting data...');

conn = new Mongo();
db = conn.getDB('swapi_db');

// db.createCollectionIndex('refreshTokenExpireIndex', { expireAfterSeconds });
db.resourceCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
db.resourceCollection.createIndex({ path: 1 }, { unique: true });

// db.myCollectionName.createIndex({ 'address.zip': 1 }, { unique: false });

// db.myCollectionName.insert({ address: { city: 'Paris', zip: '123' }, name: 'Mike', phone: '1234' });
// db.myCollectionName.insert({ address: { city: 'Marsel', zip: '321' }, name: 'Helga', phone: '4321' });

print('[Mongo DB Init] Data inserted successfully!');
