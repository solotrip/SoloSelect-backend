const {getDb} = require('../utils/database')
const {uploadFromUrl, createObjectKey} = require('../utils/s3')

async function createImages(images, prefix) {
  const db = getDb()
  const imagesCollection = db.collection('images')
  const options = {ordered: true};
  // Do not override the key if it already exists
  const docs = images.map(i => ({key: createObjectKey(prefix), ...i}))
  const results = await Promise.allSettled(docs.map(d => uploadFromUrl(d.url, d.key)))
  results.forEach((r, i) => {
    if (r.status !== 'fulfilled') {
      docs[i].error = true
    }
  })
  return imagesCollection.insertMany(docs, options)
}

module.exports = {
  createImages
}
