const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'job_sources.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_SOURCES = [
  // General Job Boards
  { name: 'LinkedIn Jobs',   url: 'https://www.linkedin.com/jobs/',         category: 'General Job Board',      tier: 1, check_frequency_days: 3  },
  { name: 'Indeed',          url: 'https://www.indeed.com',                 category: 'General Job Board',      tier: 2, check_frequency_days: 7  },
  { name: 'Glassdoor',       url: 'https://www.glassdoor.com/Job/index.htm',category: 'General Job Board',      tier: 3, check_frequency_days: 14 },
  // Sector Job Boards
  { name: 'EdSurge Jobs',                    url: 'https://edsurge.com/jobs',                category: 'Sector Job Board', tier: 1, check_frequency_days: 7  },
  { name: 'Idealist',                        url: 'https://www.idealist.org/en/jobs',        category: 'Sector Job Board', tier: 1, check_frequency_days: 7  },
  { name: 'Philanthropy News Digest (PND)',  url: 'https://pndjobs.com',                     category: 'Sector Job Board', tier: 1, check_frequency_days: 7  },
  { name: 'WorkforGood',                     url: 'https://www.workforgood.org',             category: 'Sector Job Board', tier: 2, check_frequency_days: 7  },
  { name: 'Chronicle of Philanthropy Jobs',  url: 'https://jobs.philanthropy.com',           category: 'Sector Job Board', tier: 2, check_frequency_days: 7  },
  { name: 'Nonprofit HR Jobs',               url: 'https://www.nonprofithr.com/jobs',        category: 'Sector Job Board', tier: 2, check_frequency_days: 14 },
  { name: 'Education Week Career Center',    url: 'https://careers.edweek.org',              category: 'Sector Job Board', tier: 2, check_frequency_days: 14 },
  // Professional Communities
  { name: 'AEA Job Board',  url: 'https://www.eval.org/page/job-postings',       category: 'Professional Community', tier: 1, check_frequency_days: 14 },
  { name: 'SREE Jobs',      url: 'https://www.sree.org/careers',                 category: 'Professional Community', tier: 2, check_frequency_days: 14 },
  { name: 'AERA Job Board', url: 'https://www.aera.net/Professional-Opportunities', category: 'Professional Community', tier: 2, check_frequency_days: 14 },
  // Research & Consulting Firms
  { name: 'Education Northwest',              url: 'https://educationnorthwest.org/about/careers',            category: 'Research/Consulting Firm', tier: 1, check_frequency_days: 14 },
  { name: 'WestEd',                           url: 'https://www.wested.org/careers',                         category: 'Research/Consulting Firm', tier: 1, check_frequency_days: 14 },
  { name: 'AIR (American Institutes)',        url: 'https://www.air.org/careers',                            category: 'Research/Consulting Firm', tier: 1, check_frequency_days: 14 },
  { name: 'Bellwether Education Partners',    url: 'https://bellwether.org/about/careers',                   category: 'Research/Consulting Firm', tier: 1, check_frequency_days: 14 },
  { name: 'Mathematica',                      url: 'https://www.mathematica.org/career-opportunities',       category: 'Research/Consulting Firm', tier: 2, check_frequency_days: 14 },
  { name: 'MDRC',                             url: 'https://www.mdrc.org/careers',                           category: 'Research/Consulting Firm', tier: 2, check_frequency_days: 14 },
  { name: 'SRI Education',                    url: 'https://www.sri.com/careers',                            category: 'Research/Consulting Firm', tier: 2, check_frequency_days: 14 },
  { name: 'RAND Education & Labor',           url: 'https://www.rand.org/jobs.html',                         category: 'Research/Consulting Firm', tier: 2, check_frequency_days: 14 },
  { name: 'Jobs for the Future (JFF)',        url: 'https://www.jff.org/who-we-are/careers',                 category: 'Research/Consulting Firm', tier: 2, check_frequency_days: 14 },
  { name: 'TNTP',                             url: 'https://tntp.org/careers',                               category: 'Research/Consulting Firm', tier: 3, check_frequency_days: 30 },
  { name: 'New Classrooms',                   url: 'https://www.newclassrooms.org/careers',                  category: 'Research/Consulting Firm', tier: 3, check_frequency_days: 30 },
  // Foundations
  { name: 'Meyer Memorial Trust',         url: 'https://mmt.org/careers',                           category: 'Foundation', tier: 1, check_frequency_days: 14 },
  { name: 'Murdock Trust',                url: 'https://murdocktrust.org/about/careers',             category: 'Foundation', tier: 1, check_frequency_days: 14 },
  { name: 'Oregon Community Foundation',  url: 'https://oregoncf.org/about/careers',                 category: 'Foundation', tier: 1, check_frequency_days: 14 },
  { name: 'Overdeck Family Foundation',   url: 'https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=04bec9b7-ccb5-4dd2-947d-4c34fc061de3', category: 'Foundation', tier: 1, check_frequency_days: 14 },
  { name: 'Raikes Foundation',            url: 'https://raikesfoundation.org/about/careers',         category: 'Foundation', tier: 2, check_frequency_days: 30 },
  { name: 'Ballmer Group',                url: 'https://www.ballmergroup.org/about/careers',          category: 'Foundation', tier: 2, check_frequency_days: 30 },
  { name: 'Paul G. Allen Family Foundation', url: 'https://pgafamilyfoundation.org/careers',         category: 'Foundation', tier: 2, check_frequency_days: 30 },
  { name: 'William T. Grant Foundation',  url: 'https://wtgrantfoundation.org/about/careers',        category: 'Foundation', tier: 2, check_frequency_days: 30 },
  { name: 'Spencer Foundation',           url: 'https://www.spencer.org/careers',                    category: 'Foundation', tier: 2, check_frequency_days: 30 },
  { name: 'Gates Foundation',             url: 'https://careers.gatesfoundation.org',                category: 'Foundation', tier: 3, check_frequency_days: 30 },
  { name: 'Walton Family Foundation',     url: 'https://www.waltonfamilyfoundation.org/about-us/careers', category: 'Foundation', tier: 3, check_frequency_days: 30 },
  // Edtech Companies
  { name: 'Khan Academy',          url: 'https://www.khanacademy.org/careers',                   category: 'Edtech Company', tier: 1, check_frequency_days: 14 },
  { name: 'Curriculum Associates',  url: 'https://www.curriculumassociates.com/about/careers',    category: 'Edtech Company', tier: 1, check_frequency_days: 14 },
  { name: 'Amplify',               url: 'https://amplify.com/careers',                            category: 'Edtech Company', tier: 2, check_frequency_days: 14 },
  { name: 'Carnegie Learning',     url: 'https://www.carnegielearning.com/careers',               category: 'Edtech Company', tier: 2, check_frequency_days: 14 },
  { name: 'DreamBox Learning',     url: 'https://www.dreambox.com/careers',                       category: 'Edtech Company', tier: 2, check_frequency_days: 30 },
  { name: 'Age of Learning',       url: 'https://www.ageoflearning.com/careers',                  category: 'Edtech Company', tier: 3, check_frequency_days: 30 },
  { name: 'Newsela',               url: 'https://newsela.com/about/careers',                      category: 'Edtech Company', tier: 3, check_frequency_days: 30 },
  { name: 'BrightBytes',           url: 'https://www.brightbytes.net/careers',                    category: 'Edtech Company', tier: 3, check_frequency_days: 30 },
  // AI in Education
  { name: 'Digital Promise',                url: 'https://digitalpromise.org/careers',      category: 'AI in Education', tier: 1, check_frequency_days: 7  },
  { name: 'Aurora Institute (iNACOL)',       url: 'https://aurora-institute.org/careers',    category: 'AI in Education', tier: 2, check_frequency_days: 14 },
  { name: 'CoSN',                            url: 'https://www.cosn.org/careers',            category: 'AI in Education', tier: 2, check_frequency_days: 14 },
  { name: 'ETS (Educational Testing Svc.)', url: 'https://www.ets.org/careers',             category: 'AI in Education', tier: 2, check_frequency_days: 14 },
  // PNW / Oregon Specific
  { name: 'Oregon Nonprofit Association Jobs', url: 'https://oregonnonprofits.org/jobs', category: 'PNW/Oregon Specific', tier: 1, check_frequency_days: 14 },
  { name: 'WorkSource Oregon',                 url: 'https://worksourceoregon.org',       category: 'PNW/Oregon Specific', tier: 2, check_frequency_days: 14 },
  { name: 'Oregon Employment Dept',            url: 'https://jobs.oregon.gov',            category: 'PNW/Oregon Specific', tier: 3, check_frequency_days: 30 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const sources = SEED_SOURCES.map(s => ({
      id: generateId(),
      ...s,
      last_checked: null,
      last_notes: '',
      active: true,
      snooze_until: null,
    }));
    writeData({ sources, checkins: [] });
    console.log(`Created job_sources.json with ${sources.length} seed sources.`);
  }
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// List all sources
app.get('/api/sources', (req, res) => {
  res.json(readData().sources);
});

// Add source
app.post('/api/sources', (req, res) => {
  const { name, url, category, tier, check_frequency_days, active } = req.body;
  if (!name || !url || !category) {
    return res.status(400).json({ error: 'name, url, and category are required' });
  }
  const data = readData();
  const source = {
    id: generateId(),
    name: name.trim(),
    url: url.trim(),
    category,
    tier: parseInt(tier) || 2,
    check_frequency_days: parseInt(check_frequency_days) || 14,
    last_checked: null,
    last_notes: '',
    active: active !== false,
    snooze_until: null,
  };
  data.sources.push(source);
  writeData(data);
  res.json(source);
});

// Update source
app.put('/api/sources/:id', (req, res) => {
  const data = readData();
  const idx = data.sources.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.sources[idx] = { ...data.sources[idx], ...req.body, id: req.params.id };
  writeData(data);
  res.json(data.sources[idx]);
});

// Delete source
app.delete('/api/sources/:id', (req, res) => {
  const data = readData();
  const idx = data.sources.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.sources.splice(idx, 1);
  writeData(data);
  res.json({ ok: true });
});

// Log a check-in
app.post('/api/sources/:id/checkin', (req, res) => {
  const data = readData();
  const source = data.sources.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Not found' });

  const today = new Date().toISOString().split('T')[0];
  const checkin = {
    id: generateId(),
    source_id: req.params.id,
    date_checked: today,
    notes: (req.body.notes || '').trim(),
  };
  data.checkins.push(checkin);
  source.last_checked = today;
  source.last_notes = checkin.notes;
  source.snooze_until = null;
  writeData(data);
  res.json({ source, checkin });
});

// Snooze a source
app.post('/api/sources/:id/snooze', (req, res) => {
  const data = readData();
  const source = data.sources.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Not found' });

  const days = Math.max(1, parseInt(req.body.days) || 7);
  const d = new Date();
  d.setDate(d.getDate() + days);
  source.snooze_until = d.toISOString().split('T')[0];
  writeData(data);
  res.json(source);
});

// Check-in history for a source
app.get('/api/sources/:id/history', (req, res) => {
  const { checkins } = readData();
  const history = checkins
    .filter(c => c.source_id === req.params.id)
    .sort((a, b) => new Date(b.date_checked) - new Date(a.date_checked));
  res.json(history);
});

// Export all check-ins as CSV
app.get('/api/export/csv', (req, res) => {
  const data = readData();
  const sourceMap = {};
  data.sources.forEach(s => { sourceMap[s.id] = { name: s.name, url: s.url }; });

  const rows = ['Source Name,URL,Date Checked,Notes'];
  data.checkins
    .sort((a, b) => new Date(b.date_checked) - new Date(a.date_checked))
    .forEach(c => {
      const source = sourceMap[c.source_id] || {};
      const name  = (source.name || c.source_id).replace(/"/g, '""');
      const url   = (source.url  || '').replace(/"/g, '""');
      const notes = (c.notes     || '').replace(/"/g, '""');
      rows.push(`"${name}","${url}","${c.date_checked}","${notes}"`);
    });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="checkin_log.csv"');
  res.send(rows.join('\n'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

initData();
app.listen(PORT, () => {
  console.log(`Job Board Monitor → http://localhost:${PORT}`);
});
