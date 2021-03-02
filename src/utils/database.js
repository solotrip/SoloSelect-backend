/**
 * Init mongo datasource
 *
 */

// The mongoose instance.
const { MongoClient } = require('mongodb')
const config = require('config')

// Database variable
let db

async function initDb () {
  if (!db) {
    const client = new MongoClient(config.DB_URI, config.MONGO_OPTIONS)
    // Logger.setLevel('debug')
    await client.connect()
    db = client.db()
  }
}

/**
 * Gets db connection for the given URL.
 * @return {Object} Mongo DB connection for the given URL
 */
function getDb () {
  return db
}

// exports the functions
module.exports = {
  initDb,
  getDb
}
