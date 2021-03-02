const express = require('express')
const _ = require('lodash')
const { asyncMiddleware } = require('../utils/async')
const { getDb } = require('../utils/database')
const { searchAreas } = require('../utils/autocomplete')
const { createObjectKey } = require('../utils/s3')
const { createImages } = require('../services/image')

const router = express.Router()

let areaCursor

function resetCursor () {
  const db = getDb()
  const areasCollection = db.collection('areas')
  areaCursor = areasCollection.find({ $or: [{ 'images.card': null }, { 'images.header': null }] }).project({ sid: 1 })
}

router.get('/autocomplete', asyncMiddleware(async (req, res) => {
  const { q } = req.query
  return res.json(_.take(searchAreas(q), 10))
}))

router.post('/reset-cursor', asyncMiddleware(async (req, res) => {
  resetCursor()
  return res.status(204).json()
}))

router.get('/next', asyncMiddleware(async (req, res) => {
  if (!areaCursor || areaCursor.isClosed()) {
    resetCursor()
  }
  if (await areaCursor.hasNext()) {
    return res.json(await areaCursor.next())
  }
}))

router.get('/:sid', asyncMiddleware(async (req, res) => {
  const db = getDb()
  const areasCollection = db.collection('areas')
  const { sid } = req.params
  const area = await areasCollection.findOne({ sid })
  if (!area) {
    return res.json({ error: `Area with sid:${sid} not found` }, 404)
  }
  return res.json(area)
}))

function prepareAreaImage (area, image) {
  const prefix = `${area.names.name_en}-${area.country.ISO2}-`
  return {
    key: createObjectKey(prefix),
    width: image.width,
    height: image.height
  }
}

router.patch('/:sid', asyncMiddleware(async (req, res) => {
  const db = getDb()
  const areasCollection = db.collection('areas')
  const data = req.body
  const { sid } = req.params
  const area = await areasCollection.findOne({ sid: sid }, {
    projection: {
      'names.name_en': 1,
      'country.ISO2': 1,
      'images': 1,
    }
  })
  const setUpdates = {}
  const pushUpdates = {}
  const imagesToCreate = []

  if (_.get(data, 'images.card')) {
    setUpdates['images.card'] = prepareAreaImage(area, data.images.card)
    imagesToCreate.push({ ...data.images.card, key: setUpdates['images.card'].key, areaSid: sid })
  }
  if (_.get(data, 'images.header')) {
    setUpdates['images.header'] = prepareAreaImage(area, data.images.header)
    imagesToCreate.push({ ...data.images.header, key: setUpdates['images.header'].key, areaSid: sid })
  }
  const galleryImages = _.get(data, 'images.gallery')
  if (galleryImages) {
    const newGalleryImages = galleryImages.map(image => prepareAreaImage(area, image))
    if (_.get(area, 'images.gallery')) {
      pushUpdates['images.gallery'] = newGalleryImages
    } else {
      setUpdates['images.gallery'] = newGalleryImages
    }
    imagesToCreate.push(...galleryImages.map((image, index) => ({
      ...image,
      key: newGalleryImages[index].key,
      areaSid: sid
    })))
  }
  const updateDocument = {}

  if (!_.isEmpty(setUpdates)) {
    updateDocument['$set'] = setUpdates
  }
  if (!_.isEmpty(pushUpdates)) {
    updateDocument['$push'] = pushUpdates
  }
  createImages(imagesToCreate).catch(e => console.error(e))
  await areasCollection.findOneAndUpdate({ sid }, updateDocument)
  return res.status(204).json()
}))

router.get('/:sid/images', asyncMiddleware(async (req, res) => {
  const db = getDb()
  const imagesCollection = db.collection('images')
  const { sid } = req.params
  const images = await imagesCollection.find({ areaSid: sid }).project({ url: 1, key: 1, areaSid: 1 }).toArray()
  return res.json(images)
}))

router.delete('/:sid/images/:type/:key', asyncMiddleware(async (req, res) => {
  const db = getDb()
  const areasCollection = db.collection('areas')
  const imagesCollection = db.collection('images')
  const { sid, type, key } = req.params
  const supportedTypes = ['gallery', 'header', 'card']
  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      error: true,
      message: `Invalid request. Type should be one of ${supportedTypes.join(', ')}`
    })
  }
  const path = `images.${type}`
  const area = await areasCollection.findOne({ sid: sid }, {
    projection: {
      [path]: 1,
    }
  })
  let deletePath
  if (type === 'gallery') {
    const images = _.get(area, path)
    const index = _.findIndex(images, (image) => image.key === key)
    if (index === -1) {

    }
    deletePath = `${path}[${index}]`
  } else {
    const image = _.get(area, path)
    if (image.key !== key) {
      return res.status(404).json()
    }
    deletePath = path
  }

  const updateDocument = {
    $unset: {
      [deletePath]: ''
    }
  }
  await areasCollection.findOneAndUpdate({ sid }, updateDocument)
  const imageUpdate = {
    $set: {
      'deletedAt': new Date()
    }
  }
  await imagesCollection.findOneAndUpdate({ key, areaSid: sid }, imageUpdate)
  return res.status(204).json()
}))

module.exports = router
