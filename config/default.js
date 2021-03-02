module.exports = {
  PORT: 5001,
  DB_URI: 'mongodb://localhost:27017/st_knowledgebase',
  MONGO_OPTIONS: { useNewUrlParser: true, useUnifiedTopology: true },
  S3: {
    regions: 'eu-central-1',
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    }
  },
  S3_MEDIA_BUCKET_NAME: 'media-st'
}
