const fs = require('fs');

// Read GDP file to extract regime & other data
const gdpContent = fs.readFileSync('./du_lieu_quoc_gia_che_do_gdp.md', 'utf8');
const lines = gdpContent.split('\n');

const regimeTranslation = {
  'Dân chủ tự do': 'Liberal democracy',
  'Dân chủ bầu cử': 'Electoral democracy',
  'Chuyên chế bầu cử': 'Electoral autocracy',
  'Chuyên chế đóng': 'Closed autocracy',
  'Chế độ lai': 'Hybrid regime',
  'Chưa xác định': 'Unknown'
};

const gdpData = {};

for (const line of lines) {
  if (line.startsWith('|') && !line.includes('---') && !line.includes('Tên')) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 10) {
      const name = parts[1];
      const iso3 = parts[4];
      const gdp = parts[6];
      const gdpPerCapita = parts[7];
      const govSystem = parts[8];
      const vietnameseRegime = parts[9];

      if (iso3 && iso3.length === 3) {
        const englishRegime = regimeTranslation[vietnameseRegime] || 'Unknown';
        gdpData[iso3] = {
          countryName: name,
          gdp: gdp ? parseInt(gdp) : undefined,
          gdpPerCapita: gdpPerCapita ? parseInt(gdpPerCapita) : undefined,
          governmentSystem: govSystem || undefined,
          regimeCategory: englishRegime
        };
      }
    }
  }
}

console.log('Extracted GDP data for', Object.keys(gdpData).length, 'countries');

// Read sample.json
const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json', 'utf8'));

// Enrich with GDP data
const enriched = sample.map(country => {
  const data = gdpData[country.iso3];

  if (data) {
    return {
      ...country,
      gdp: data.gdp || country.gdp,
      gdpPerCapita: data.gdpPerCapita || country.gdpPerCapita,
      governmentSystem: data.governmentSystem || country.governmentSystem,
      regimeCategory: data.regimeCategory !== 'Unknown' ? data.regimeCategory : (country.regimeCategory || 'Unknown'),
      economicModel: data.regimeCategory ? `Based on regime: ${data.regimeCategory}` : undefined
    };
  }

  return country;
});

// Save enriched version
fs.writeFileSync('./data/countries.sample.json', JSON.stringify(enriched, null, 2));

const enrichedCount = enriched.filter(c => c.gdp || c.gdpPerCapita || c.governmentSystem).length;
const withRegime = enriched.filter(c => c.regimeCategory && c.regimeCategory !== 'Unknown').length;

console.log('Countries with GDP:', enriched.filter(c => c.gdp).length);
console.log('Countries with GDP per capita:', enriched.filter(c => c.gdpPerCapita).length);
console.log('Countries with regime:', withRegime);
console.log('✓ Enriched countries.sample.json');
