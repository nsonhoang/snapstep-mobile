const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'assets', 'vn_iso_province.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);

const uniqueCodes = new Set();
const uniqueProvinces = [];

data.features.forEach(f => {
  const code = f.properties.ISO3166_2_CODE;
  const name_en = f.properties.Name_EN;
  const name_vi = f.properties.Name_VI;
  if (!uniqueCodes.has(code)) {
    uniqueCodes.add(code);
    uniqueProvinces.push({ code, name_en, name_vi });
  }
});

console.log('Unique codes count:', uniqueCodes.size);
console.log('Unique provinces list:', JSON.stringify(uniqueProvinces, null, 2));
