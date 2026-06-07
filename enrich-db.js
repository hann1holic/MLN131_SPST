const fs = require('fs');
const { feature } = require('topojson-client');
const worldAtlas = require('world-atlas/countries-110m.json');
const { DatabaseSync } = require('node:sqlite');

// Extract numeric codes from world-atlas
const collection = feature(worldAtlas, worldAtlas.objects.countries);
const numericMap = {}; // numericId -> name

console.log('Extracting numeric codes from world-atlas...');
collection.features.forEach(f => {
  const numericId = String(f.id).padStart(3, '0');
  const name = f.properties?.name;
  if (name) {
    numericMap[numericId] = name;
  }
});

console.log('Found', Object.keys(numericMap).length, 'countries in world-atlas');

// Read sample.json to get ISO3 -> numericCode mapping
const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json', 'utf8'));
const iso3ToNumeric = {};

sample.forEach(c => {
  if (c.numericCode) {
    iso3ToNumeric[c.iso3] = c.numericCode;
  }
});

console.log('Found', Object.keys(iso3ToNumeric).length, 'ISO3->numeric mappings in sample');

// Open database and update
const db = new DatabaseSync('./data/world-ideology-atlas.db');

const updateStmt = db.prepare(
  'UPDATE country_profiles SET profile_json = json_set(profile_json, "$.numericCode", ?) WHERE iso3 = ?'
);

let updated = 0;
for (const [iso3, numericCode] of Object.entries(iso3ToNumeric)) {
  const result = updateStmt.run(numericCode, iso3);
  if (result.changes > 0) updated++;
}

console.log('Updated', updated, 'countries with numericCode');

// Verify
const countries = db.prepare('SELECT COUNT(*) as count FROM country_profiles').get();
const withNumeric = db.prepare(
  'SELECT COUNT(*) as count FROM country_profiles WHERE json_extract(profile_json, "$.numericCode") IS NOT NULL'
).get();

console.log('Total countries:', countries.count);
console.log('With numericCode:', withNumeric.count);

db.close();
console.log('✓ Database enriched!');
