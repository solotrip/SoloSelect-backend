const axios = require('axios')
const config = require('config')
const {v4:uuid} = require('uuid')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const client = new S3Client(config.S3)

function createObjectKey(prefix='') {
  return prefix + uuid()
}

async function uploadFromUrl(url, key) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  })

  return client.send(new PutObjectCommand({
    Body: response.data,
    Key: key,
    Bucket: config.S3_MEDIA_BUCKET_NAME
  }))
}

module.exports = {
  createObjectKey,
  uploadFromUrl
}
