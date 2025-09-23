// scripts/make_city_population.js
// Usage: node scripts/make_city_population.js <input_csv> <output_csv>
// Example: node scripts/make_city_population.js python/sub-est2014_all.csv public/data/city_population.csv

const fs = require('fs');
const d3 = require('d3-dsv');

const IN = process.argv[2] || 'python/sub-est2014_all.csv';
const OUT = process.argv[3] || 'public/data/city_population.csv';

const STATE_ABBR = {
  Alabama:'AL', Alaska:'AK', Arizona:'AZ', Arkansas:'AR', California:'CA',
  Colorado:'CO', Connecticut:'CT', Delaware:'DE', 'District of Columbia':'DC',
  Florida:'FL', Georgia:'GA', Hawaii:'HI', Idaho:'ID', Illinois:'IL',
  Indiana:'IN', Iowa:'IA', Kansas:'KS', Kentucky:'KY', Louisiana:'LA',
  Maine:'ME', Maryland:'MD', Massachusetts:'MA', Michigan:'MI', Minnesota:'MN',
  Mississippi:'MS', Missouri:'MO', Montana:'MT', Nebraska:'NE', Nevada:'NV',
  'New Hampshire':'NH', 'New Jersey':'NJ', 'New Mexico':'NM', 'New York':'NY',
  'North Carolina':'NC', 'North Dakota':'ND', Ohio:'OH', Oklahoma:'OK',
  Oregon:'OR', Pennsylvania:'PA', 'Rhode Island':'RI', 'South Carolina':'SC',
  'South Dakota':'SD', Tennessee:'TN', Texas:'TX', Utah:'UT', Vermont:'VT',
  Virginia:'VA', Washington:'WA', 'West Virginia':'WV', Wisconsin:'WI', Wyoming:'WY'
};

if (!fs.existsSync(IN)) {
  console.error('Input not found:', IN);
  process.exit(1);
}

const raw = fs.readFileSync(IN, 'utf8');
const rows = d3.csvParse(raw);

// keep active places only
const cleaned = rows
  .filter(r => r.SUMLEV === '162' && r.FUNCSTAT === 'A')
  .map(r => {
    const state = STATE_ABBR[r.STNAME];
    let city = r.NAME || '';
    city = city
      .replace(/\b(city|town|village|CDP|municipality|borough)\b/gi, '')
      .replace(/metropolitan.*$/i, '')   // Nashville-Davidson…
      .replace(/county.*$/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return { city, state, population: +r.POPESTIMATE2014 };
  })
  .filter(r => r.city && r.state && Number.isFinite(r.population));

fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, d3.csvFormat(cleaned), 'utf8');
console.log(`Wrote ${OUT} with ${cleaned.length} rows`);
