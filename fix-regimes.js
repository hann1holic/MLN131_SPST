const fs = require('fs');

const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json', 'utf8'));

const regimeMap = {
  'Dân chủ tự do': 'Liberal democracy',
  'Dân chủ bầu cử': 'Electoral democracy',
  'Chuyên chế bầu cử': 'Electoral autocracy',
  'Chuyên chế đóng': 'Closed autocracy',
  'Chế độ lai': 'Hybrid regime',
  'Chưa xác định': 'Unknown'
};

let fixed = 0;

const updated = sample.map(country => {
  if (country.regimeCategory && regimeMap[country.regimeCategory]) {
    const oldValue = country.regimeCategory;
    country.regimeCategory = regimeMap[country.regimeCategory];
    if (oldValue !== country.regimeCategory) {
      fixed++;
    }
  }
  return country;
});

fs.writeFileSync('./data/countries.sample.json', JSON.stringify(updated, null, 2));
console.log(`✓ Fixed ${fixed} regime values`);
console.log(`Total countries: ${updated.length}`);
