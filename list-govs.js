const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/countries.sample.json'));
const govSystems = [...new Set(data.map(c => c.governmentSystem).filter(g => g))].sort();
console.log(govSystems.length + ' unique government systems:\n');
govSystems.forEach(g => console.log('"' + g + '": "' + g + '",'));
