const fs = require('fs');
const { feature } = require('topojson-client');
const worldAtlas = require('world-atlas/countries-110m.json');

// Extract all countries and IDs from world-atlas
console.log('Extracting countries from world-atlas...');
const collection = feature(worldAtlas, worldAtlas.objects.countries);

const atlasCountries = {};
const idToName = {};

collection.features.forEach(f => {
  const numericId = String(f.id).padStart(3, '0');
  const name = f.properties?.name;

  if (name) {
    atlasCountries[name] = numericId;
    idToName[numericId] = name;
  }
});

console.log('Found', Object.keys(atlasCountries).length, 'countries in world-atlas');
console.log('Numeric codes:', Math.min(...Object.values(atlasCountries).map(Number)), 'to', Math.max(...Object.values(atlasCountries).map(Number)));

// Manual mappings for countries that might have different names in different databases
const nameOverrides = {
  'Åland Islands': '248',  // ALA
  'Antarctica': '010',     // ATA
  'Aland Islands': '248',
  'Australia': '036',
  'Austria': '040',
  'Bahamas': '044',
  'Bahrain': '048',
  'Bangladesh': '050',
  'Barbados': '052',
  'Belarus': '112',
  'Belgium': '056',
  'Belize': '084',
  'Benin': '204',
  'Bermuda': '060',
  'Bhutan': '064',
  'Bolivia': '068',
  'Bosnia and Herzegovina': '070',
  'Botswana': '072',
  'Brazil': '076',
  'Brunei': '096',
  'Bulgaria': '100',
  'Burkina Faso': '854',
  'Burundi': '108',
  'Cabo Verde': '132',
  'Cambodia': '116',
  'Cameroon': '120',
  'Canada': '124',
  'Cape Verde': '132',
  'Central African Republic': '140',
  'Chad': '148',
  'Chile': '152',
  'China': '156',
  'Colombia': '170',
  'Comoros': '174',
  'Congo': '178',
  'Costa Rica': '188',
  'Côte d\'Ivoire': '384',
  'Croatia': '191',
  'Cuba': '192',
  'Cyprus': '196',
  'Czechia': '203',
  'Czech Republic': '203',
  'DR Congo': '180',
  'Denmark': '208',
  'Djibouti': '262',
  'Dominica': '212',
  'Dominican Republic': '214',
  'Ecuador': '218',
  'Egypt': '818',
  'El Salvador': '222',
  'Equatorial Guinea': '226',
  'Eritrea': '232',
  'Estonia': '233',
  'Eswatini': '748',
  'Ethiopia': '231',
  'Fiji': '242',
  'Finland': '246',
  'France': '250',
  'Gabon': '266',
  'Gambia': '270',
  'Georgia': '268',
  'Germany': '276',
  'Ghana': '288',
  'Greece': '300',
  'Grenada': '308',
  'Guatemala': '320',
  'Guinea': '324',
  'Guinea-Bissau': '624',
  'Guyana': '328',
  'Haiti': '332',
  'Honduras': '340',
  'Hungary': '348',
  'Iceland': '352',
  'India': '356',
  'Indonesia': '360',
  'Iran': '364',
  'Iraq': '368',
  'Ireland': '372',
  'Israel': '376',
  'Italy': '380',
  'Jamaica': '388',
  'Japan': '392',
  'Jordan': '400',
  'Kazakhstan': '398',
  'Kenya': '404',
  'Kosovo': '383',
  'Kuwait': '414',
  'Kyrgyzstan': '417',
  'Laos': '418',
  'Latvia': '428',
  'Lebanon': '422',
  'Lesotho': '426',
  'Liberia': '430',
  'Libya': '434',
  'Lithuania': '440',
  'Luxembourg': '442',
  'Madagascar': '450',
  'Malawi': '454',
  'Malaysia': '458',
  'Maldives': '462',
  'Mali': '466',
  'Malta': '470',
  'Mauritania': '478',
  'Mauritius': '480',
  'Mexico': '484',
  'Moldova': '498',
  'Monaco': '492',
  'Mongolia': '496',
  'Montenegro': '499',
  'Morocco': '504',
  'Mozambique': '508',
  'Myanmar': '104',
  'Namibia': '516',
  'Nepal': '524',
  'Netherlands': '528',
  'New Zealand': '554',
  'Nicaragua': '558',
  'Niger': '562',
  'Nigeria': '566',
  'North Korea': '408',
  'North Macedonia': '807',
  'Norway': '578',
  'Oman': '512',
  'Pakistan': '586',
  'Palestine': '275',
  'Panama': '591',
  'Papua New Guinea': '598',
  'Paraguay': '600',
  'Peru': '604',
  'Philippines': '608',
  'Poland': '616',
  'Portugal': '620',
  'Qatar': '634',
  'Romania': '642',
  'Russia': '643',
  'Rwanda': '646',
  'Samoa': '882',
  'San Marino': '674',
  'Sao Tome and Principe': '678',
  'Saudi Arabia': '682',
  'Senegal': '686',
  'Serbia': '688',
  'Seychelles': '690',
  'Sierra Leone': '694',
  'Singapore': '702',
  'Slovakia': '703',
  'Slovenia': '705',
  'Solomon Islands': '090',
  'Somalia': '706',
  'South Africa': '710',
  'South Korea': '410',
  'South Sudan': '728',
  'Spain': '724',
  'Sri Lanka': '144',
  'Sudan': '729',
  'Suriname': '740',
  'Sweden': '752',
  'Switzerland': '756',
  'Syria': '760',
  'Taiwan': '158',
  'Tajikistan': '762',
  'Tanzania': '834',
  'Thailand': '764',
  'Timor-Leste': '626',
  'Togo': '768',
  'Tonga': '776',
  'Trinidad and Tobago': '780',
  'Tunisia': '788',
  'Turkey': '792',
  'Turkmenistan': '795',
  'Uganda': '800',
  'Ukraine': '804',
  'United Arab Emirates': '784',
  'United Kingdom': '826',
  'United States': '840',
  'Uruguay': '858',
  'Uzbekistan': '860',
  'Vanuatu': '548',
  'Vatican City': '336',
  'Venezuela': '862',
  'Vietnam': '704',
  'Yemen': '887',
  'Zambia': '894',
  'Zimbabwe': '716'
};

// Merge mappings
const allMappings = { ...atlasCountries, ...nameOverrides };

// Read sample.json
const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json', 'utf8'));

console.log('\nMatching countries...');
let matched = 0;
let unmatched = [];

const updated = sample.map(country => {
  // Try to find numeric code
  let numericCode = country.numericCode;

  if (!numericCode || numericCode.length !== 3) {
    // Try matching by country name
    if (allMappings[country.countryName]) {
      numericCode = allMappings[country.countryName];
      matched++;
    } else {
      unmatched.push(`${country.iso3} (${country.countryName})`);
    }
  } else {
    matched++;
  }

  return {
    ...country,
    numericCode: numericCode || ''
  };
});

console.log('Matched:', matched);
console.log('Unmatched:', unmatched.length);
if (unmatched.length > 0 && unmatched.length <= 20) {
  console.log('Unmatched countries:');
  unmatched.forEach(c => console.log('  -', c));
}

// Save updated
fs.writeFileSync('./data/countries.sample.json', JSON.stringify(updated, null, 2));
console.log('\n✓ Updated countries.sample.json with numeric codes');
console.log('Countries with numeric codes:', updated.filter(c => c.numericCode && c.numericCode.length === 3).length);
