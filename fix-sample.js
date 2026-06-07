const fs = require('fs');

const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json', 'utf8'));

console.log('Validating sample.json...');
console.log('Total countries:', sample.length);

// Find and fix invalid entries
const filtered = sample.filter((c, idx) => {
  // Check iso3 is exactly 3 chars
  if (!c.iso3 || c.iso3.length !== 3) {
    console.log(`Invalid iso3 at index ${idx}: "${c.iso3}" (country: ${c.countryName})`);
    return false; // Remove invalid entries
  }
  return true;
});

console.log('After filtering:', filtered.length);
console.log('Removed:', sample.length - filtered.length);

// Ensure required fields
const validated = filtered.map(c => ({
  id: c.id || c.iso3.toLowerCase(),
  iso2: c.iso2 || '',
  iso3: c.iso3,
  numericCode: c.numericCode || '',
  countryName: c.countryName || 'Unknown',
  officialName: c.officialName || c.countryName || 'Unknown',
  englishName: c.englishName || c.countryName || 'Unknown',
  flagEmoji: c.flagEmoji || '🏳️',
  region: c.region || 'Unknown',
  regimeCategory: c.regimeCategory || 'Unknown',
  sources: c.sources || [],
  dataUpdatedAt: c.dataUpdatedAt || new Date().toISOString(),
  confidenceLevel: c.confidenceLevel || 'low',
  ...(c.gdp && { gdp: c.gdp }),
  ...(c.gdpPerCapita && { gdpPerCapita: c.gdpPerCapita })
}));

// Save fixed version
fs.writeFileSync('./data/countries.sample.json', JSON.stringify(validated, null, 2));
console.log('✓ Fixed and validated countries.sample.json');
console.log('Final count:', validated.length);
