const MiniSearch = require('minisearch')
const {getDb} = require('../utils/database')
const diacritics = require('diacritics')

let areaMiniSearch

async function initAreaAutocomplete() {
  const db = getDb()
  const areasCollection = db.collection('areas')
  areaMiniSearch = new MiniSearch({
    fields: ['name', 'country', 'cc', 'wkd'], // fields to index for full-text search
    storeFields: ['name', 'country', 'cc', 'wkd', 'sid'], // fields to return with search results
    processTerm: term => diacritics.remove(term).toLowerCase()
  })

  const areas = await areasCollection.find(
    {}
  ).project({
    'names.name_en': 1,
    'country.name': 1,
    'country.ISO2': 1,
    'properties.wkd_id': 1,
    'sid': 1,
  }).toArray()

  const documents = areas.map(a => ({
    id: a.sid,
    name: a.names.name_en,
    country: a.country.name,
    cc: a.country.ISO2,
    wkd: a.properties.wkd_id,
    sid: a.sid
  }))

  areaMiniSearch.addAll(documents)
}

function searchAreas(query) {
  return areaMiniSearch.search(query, {
    prefix: true, fuzzy: 0.2,
    processTerm: term => diacritics.remove(term).toLowerCase()
  })
}

module.exports = {
  initAreaAutocomplete,
  searchAreas
}

