const fs = require('fs');

// Function to capitalize Vietnamese text (capitalize first letter of each word, except common words)
function capitalizeVietnamese(text) {
  if (!text) return text;

  // Words that should NOT be capitalized (articles, prepositions, etc.)
  const lowercase = ['và', 'hoặc', 'với', 'hay', 'theo', 'dưới', 'trên', 'trong', 'ngoài', 'cho'];

  return text
    .split(/(\s|\/|-)/)
    .map((word, index) => {
      if (!word || /[\s\/\-]/.test(word)) return word;

      // Always capitalize first word or after / or -
      if (index === 0 || (index > 0 && /[\/-]/.test(text.charAt(text.indexOf(word) - 1)))) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      if (lowercase.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
}

const sample = JSON.parse(fs.readFileSync('./data/countries.sample.json'));

let fixed = 0;
const updated = sample.map(country => {
  if (country.governmentSystem && country.governmentSystem !== 'Chưa xác định') {
    const oldValue = country.governmentSystem;
    country.governmentSystem = capitalizeVietnamese(country.governmentSystem);
    if (oldValue !== country.governmentSystem) {
      fixed++;
      console.log(`Fixed: "${oldValue}" → "${country.governmentSystem}"`);
    }
  }
  return country;
});

fs.writeFileSync('./data/countries.sample.json', JSON.stringify(updated, null, 2));
console.log(`\n✓ Fixed ${fixed} government system values`);
