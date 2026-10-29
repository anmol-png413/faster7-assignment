require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { signToken, requireAuth } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Employee auth ----------

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `insert into employees (name, email, password_hash)
       values ($1, lower($2), $3)
       on conflict (email) do nothing
       returning id, name, email`,
      [name, email, hash]
    );
    if (!rows.length) return res.status(409).json({ error: 'Email already registered' });

    res.status(201).json({ employee: rows[0], token: signToken(rows[0]) });
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const { rows } = await pool.query('select * from employees where email = lower($1)', [email]);
    const emp = rows[0];
    if (!emp || !(await bcrypt.compare(password, emp.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      employee: { id: emp.id, name: emp.name, email: emp.email },
      token: signToken(emp),
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Public enquiry form (no auth) ----------

app.post('/api/enquiries', async (req, res, next) => {
  try {
    const { name, email, phone, course_interest, message } = req.body;
    if (!name || !email || !course_interest) {
      return res.status(400).json({ error: 'name, email and course_interest are required' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const { rows } = await pool.query(
      `insert into enquiries (name, email, phone, course_interest, message)
       values ($1, $2, $3, $4, $5)
       returning id, name, email, phone, course_interest, message, created_at`,
      [name, email, phone || null, course_interest, message || null]
    );
    res.status(201).json({ enquiry: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- Leads (auth required) ----------

// Public / unclaimed leads, visible to every employee
app.get('/api/leads/unclaimed', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select id, name, email, phone, course_interest, message, created_at
       from enquiries where claimed_by is null order by created_at desc`
    );
    res.json({ leads: rows });
  } catch (err) {
    next(err);
  }
});

// Leads claimed by the logged-in employee
app.get('/api/leads/mine', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select id, name, email, phone, course_interest, message, created_at, claimed_at
       from enquiries where claimed_by = $1 order by claimed_at desc`,
      [req.user.id]
    );
    res.json({ leads: rows });
  } catch (err) {
    next(err);
  }
});

// Claim a lead. The "claimed_by is null" check makes this atomic, so two
// counselors claiming at the same moment can't both win.
app.post('/api/leads/:id/claim', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid lead id' });

    const { rows } = await pool.query(
      `update enquiries set claimed_by = $1, claimed_at = now()
       where id = $2 and claimed_by is null
       returning id, name, email, phone, course_interest, message, claimed_at`,
      [req.user.id, id]
    );
    if (rows.length) return res.json({ lead: rows[0] });

    const exists = await pool.query('select 1 from enquiries where id = $1', [id]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Lead not found' });
    res.status(409).json({ error: 'Lead already claimed' });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Vercel imports the app as a serverless function; locally we start a normal server.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`CRM API running on http://localhost:${port}`));
}

module.exports = app;
