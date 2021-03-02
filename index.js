const express = require('express')
const config = require('config')
const bodyParser = require('body-parser')
const cors = require('cors')
const areaRoutes = require('./src/routes/area.js')
const { initDb } = require('./src/utils/database')
const { initAreaAutocomplete } = require('./src/utils/autocomplete')

initDb()
.then(() => {
  initAreaAutocomplete().catch(e => {
    console.error(e)
  })
  const app = express()
  app.use(bodyParser.json())
  app.use(cors())
  app.use('/areas', areaRoutes)
  app.listen(config.PORT, () => console.log(`Server running on port: ${config.PORT}`))

})
.catch((error) => {
  console.log(error.message)
})

