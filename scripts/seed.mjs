#!/usr/bin/env node
/**
 * Seed script for Vitaway Employer Dashboard
 *
 * Generates and POSTs large volumes of random test data (employees, programs,
 * program assignments) via the real /api/organization API.
 *
 * Usage:
 *   npm run seed                       # seed everything (default counts)
 *   npm run seed:employees             # seed employees only
 *   npm run seed:programs              # seed programs only
 *   npm run seed -- --count 200        # override default employee count
 *   npm run seed -- --programs 30      # override default program count
 *   npm run seed -- --dry-run          # preview without making requests
 *   npm run seed -- --concurrency 10   # parallel requests (default 5)
 *
 * Required env vars (loaded from .env automatically):
 *   NEXT_PUBLIC_API_BASE_URL           - e.g. http://127.0.0.1:8000/api/organization
 *   SEED_ADMIN_EMAIL                   - org admin email
 *   SEED_ADMIN_PASSWORD                - org admin password
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const COMMAND     = args.find((a) => !a.startsWith('--')) ?? 'all';

function getFlag(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] !== undefined ? Number(args[i + 1]) : def;
}

const EMP_COUNT   = getFlag('count', 80);
const PROG_COUNT  = getFlag('programs', 20);
const CONCURRENCY = getFlag('concurrency', 5);

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = value;
    }
  } catch { /* rely on process.env */ }
}

loadEnv();

const API_BASE       = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/organization').replace(/\/$/, '');
const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    ?? '';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

// ─── Random helpers ───────────────────────────────────────────────────────────
function rand(arr)            { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max)    { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randBool(pct = 0.5)  { return Math.random() < pct; }
function randPhone()          {
  const pfx = ['+250781','+250788','+250722','+250733','+250790','+250791','+250792'];
  return `${rand(pfx)}${String(randInt(100000, 999999))}`;
}
function randEmail(first, last) {
  const domains = ['vitaway-seed.com','testcorp.rw','dev-employee.io','seedtest.org','corp-test.rw'];
  const sep     = rand(['.','_','']);
  const suffix  = rand(['', String(randInt(1, 99)), String(randInt(100, 999))]);
  return `${first.toLowerCase()}${sep}${last.toLowerCase()}${suffix}@${rand(domains)}`;
}

// ─── Name pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Amara','Amina','Ange','Axel','Beatrice','Boris','Brigitte','Bruno','Celestine','Claude',
  'Daniel','Diana','Diane','Didier','Emmanuel','Esther','Fabrice','Fiona','Florent','Francine',
  'Gabriel','Giselle','Grace','Gregoire','Hassan','Henriette','Ingrid','Isabelle','Jacques','Jean',
  'Jerome','Joelle','Jonathan','Josiane','Jules','Julien','Kamila','Kevin','Laetitia','Laurent',
  'Leila','Lionel','Lucia','Luc','Marie','Martin','Maxime','Mireille','Mohamed','Monique',
  'Nadine','Nathan','Nicolas','Noel','Olive','Pascal','Patrick','Paul','Pauline','Peter',
  'Pierre','Rachel','Raissa','Rebecca','Richard','Rose','Samuel','Sandra','Sarah','Simone',
  'Sophie','Steve','Sylvie','Thomas','Tina','Valerie','Victor','Vincent','Wycliffe','Yvette',
  'Aigerim','Aryan','Bongani','Chiamaka','Dipika','Elias','Fatou','Gareth','Hamid','Inaya',
  'Jana','Kwame','Lila','Mila','Nora','Omar','Priya','Qais','Rania','Soren',
  'Aaliya','Aaron','Abby','Abel','Abena','Abigail','Abram','Adaeze','Adaora','Adar',
  'Adele','Aden','Adina','Aditi','Adnan','Adom','Adwoa','Afia','Afra','Afua',
  'Agnes','Agnieszka','Ailsa','Aisha','Aissata','Aito','Akemi','Akiye','Ako','Akua',
  'Alana','Alara','Alec','Alejandro','Alena','Alethea','Alex','Alexa','Alexandra','Alexei',
  'Alexia','Alexis','Alfonse','Alfred','Alfredo','Alice','Alicia','Alina','Alinta','Alisa',
];

const LAST_NAMES = [
  'Bizimana','Hakizimana','Habimana','Ndayisaba','Nshimiyimana','Uwimana','Mukamana','Uwase',
  'Ntirushekwa','Murenzi','Gahire','Kaberuka','Kayitare','Mugabe','Rutaganda','Gasana',
  'Nkurunziza','Cyusa','Ingabire','Ndagijimana','Mutabazi','Uzabakiriho','Mutuyimana',
  'Johnson','Williams','Brown','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White',
  'Harris','Martin','Garcia','Martinez','Robinson','Clark','Lewis','Lee','Walker','Hall',
  'Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams',
  'Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell',
  'Patel','Shah','Kumar','Singh','Sharma','Gupta','Ali','Khan','Hussain','Ahmed',
  'Okafor','Osei','Mensah','Asante','Owusu','Boateng','Acheampong','Antwi','Adjei','Amoah',
  'Kimura','Tanaka','Suzuki','Watanabe','Inoue','Yamamoto','Nakamura','Kobayashi',
  'Dupont','Durand','Bernard','Lambert','Simon','Michel','Lefebvre','Leroy','Moreau','David',
  'Mueller','Schmidt','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch',
  'Rossi','Ferrari','Russo','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo',
  'Silva','Santos','Oliveira','Costa','Ferreira','Alves','Lopes','Martins','Rodrigues','Pereira',
  'Ito','Sato','Kudo','Hayashi','Yamaguchi','Matsumoto','Fujiwara','Ogawa','Nishimura','Kato',
];

// ─── Employee generator ───────────────────────────────────────────────────────
const usedEmails = new Set();

function generateEmployee(idx) {
  const first = rand(FIRST_NAMES);
  const last  = rand(LAST_NAMES);

  let email;
  let attempt = 0;
  do {
    email = `${first.toLowerCase()}${attempt > 0 ? attempt : ''}.${last.toLowerCase()}${randInt(1, 9999)}@vitaway-seed.com`;
    attempt++;
  } while (usedEmails.has(email));
  usedEmails.add(email);

  return {
    firstname:           first,
    lastname:            last,
    email,
    phone:               randPhone(),
    employee_identifier: `SEED-${String(idx + 1).padStart(5, '0')}`,
    password:            'Seed@Pass2024!',
  };
}

// ─── Program templates ────────────────────────────────────────────────────────
const PROGRAM_TEMPLATES = [
  ['Wellness Fundamentals','Building daily habits for holistic employee wellbeing','wellness',4],
  ['Work-Life Balance Mastery','Strategies to achieve sustainable balance between professional and personal life','wellness',6],
  ['Burnout Prevention','Recognising early burnout signals and practical recovery techniques','wellness',4],
  ['Energy Management','Optimising physical and mental energy throughout the workday','wellness',3],
  ['Resilience & Emotional Strength','Developing mental resilience to cope with workplace pressures','wellness',8],
  ['Nutrition Essentials','Science-backed foundations of healthy eating for productivity','nutrition',4],
  ['Healthy Eating on a Budget','Practical nutritional strategies without breaking your budget','nutrition',4],
  ['Meal Prep for Busy Professionals','Time-efficient meal preparation to sustain focus at work','nutrition',3],
  ['Sugar & Processed Food Reset','30-day plan to break dependence on sugar and ultra-processed foods','nutrition',4],
  ['Gut Health & Performance','Understanding the gut-brain axis and nutrition for peak performance','nutrition',6],
  ['Mental Health & Mindfulness','Stress management and mindfulness practices tailored for employees','mental_health',8],
  ['Managing Anxiety at Work','Practical CBT-based techniques to manage workplace anxiety','mental_health',6],
  ['Grief & Loss Support','Compassionate support program for employees experiencing loss','mental_health',4],
  ['Sleep Science & Recovery','Evidence-based sleep hygiene for sustained cognitive performance','mental_health',6],
  ['Mindful Leadership','Applying mindfulness principles in leadership and decision-making','mental_health',8],
  ['Physical Fitness Starter','Beginner-friendly exercise program for office-based workers','fitness',12],
  ['Desk & Chair Yoga','15-minute daily yoga routines without leaving your workstation','fitness',4],
  ['HIIT for Busy Schedules','High-intensity interval training in 20 minutes or less per session','fitness',8],
  ['Posture & Back Pain Relief','Corrective exercises to alleviate chronic desk-related back pain','fitness',6],
  ['Step & Walk Challenge','Gamified step counting to increase daily movement','fitness',4],
  ['Diabetes Prevention','Lifestyle modification program targeting type-2 diabetes risk factors','chronic_disease',12],
  ['Heart Health Program','Cardiovascular risk reduction through diet, exercise, and stress management','chronic_disease',16],
  ['Blood Pressure Management','Holistic approach to controlling hypertension in the workplace','chronic_disease',8],
  ['Weight Management','Medically supervised weight management combining nutrition and activity','weight_management',16],
  ['Smoking Cessation','Evidence-based plan to help employees quit smoking permanently','lifestyle',8],
  ['Financial Wellness Basics','Understanding personal finance to reduce money-related stress','financial_wellness',4],
  ['Team Cohesion & Connection','Structured activities to strengthen team bonds and reduce social isolation','wellness',3],
  ['Digital Detox & Screen Health','Reducing digital fatigue and managing screen time effectively at work','wellness',4],
  ['Hydration & Micronutrients','Daily hydration habits and micronutrient awareness for energy','nutrition',2],
  ['Strength Training Fundamentals','Progressive resistance training for beginners in the workplace','fitness',10],
];

function generateProgram(idx) {
  const [name, description, category, duration_weeks] = PROGRAM_TEMPLATES[idx % PROGRAM_TEMPLATES.length];
  const variant = idx >= PROGRAM_TEMPLATES.length
    ? ` — Cohort ${Math.floor(idx / PROGRAM_TEMPLATES.length) + 1}`
    : '';
  return {
    name: `${name}${variant}`,
    description,
    category,
    duration_weeks,
    is_active: randBool(0.85),
    status:    randBool(0.85) ? 'active' : 'draft',
  };
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function apiPost(endpoint, body, token = null) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  return { ok: res.ok, status: res.status, data };
}

// ─── Concurrency pool ─────────────────────────────────────────────────────────
async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

// ─── Progress display ─────────────────────────────────────────────────────────
function progress(current, total, label) {
  const pct  = Math.round((current / total) * 100);
  const bar  = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  const text = `  [${bar}] ${String(current).padStart(String(total).length)}/${total}  ${String(pct).padStart(3)}%  ${label.slice(0, 40).padEnd(40)}`;
  process.stdout.write(`\r${text}`);
}

// ─── Logger ───────────────────────────────────────────────────────────────────
const c = { reset:'\x1b[0m', green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m', cyan:'\x1b[36m', bold:'\x1b[1m', dim:'\x1b[2m' };

const stats = { created: 0, skipped: 0, failed: 0 };

function ok(msg)    { stats.created++; process.stdout.write(`${c.green}✓${c.reset} ${msg}\n`); }
function warn(msg)  { stats.skipped++; process.stdout.write(`${c.yellow}⚠${c.reset} ${msg}\n`); }
function fail(msg)  { stats.failed++;  process.stdout.write(`${c.red}✗${c.reset} ${msg}\n`); }
function info(msg)  {                  process.stdout.write(`${c.cyan}→${c.reset} ${msg}\n`); }
function section(t) {                  process.stdout.write(`\n${c.bold}${t}${c.reset}\n`); }

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function authenticate() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    process.stderr.write(`${c.red}✗${c.reset} Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env\n`);
    process.exit(1);
  }
  info(`Authenticating as ${ADMIN_EMAIL} …`);
  if (DRY_RUN) { process.stdout.write(`${c.green}✓${c.reset} [dry-run] skipped\n`); return '__dry_run__'; }

  const { ok: success, status, data } = await apiPost('/auth/login', {
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
  });
  if (!success) {
    process.stderr.write(`${c.red}✗${c.reset} Login failed (${status}): ${data?.message ?? 'unknown'}\n`);
    process.exit(1);
  }
  const token = data?.data?.token ?? data?.token ?? data?.access_token;
  if (!token) {
    process.stderr.write(`${c.red}✗${c.reset} Login OK but no token in response\n`);
    process.exit(1);
  }
  process.stdout.write(`${c.green}✓${c.reset} Authenticated\n`);
  return token;
}

// ─── Seed employees ───────────────────────────────────────────────────────────
async function seedEmployees(token) {
  section(`Seeding ${EMP_COUNT} Employees  (concurrency=${CONCURRENCY})`);

  const employees = Array.from({ length: EMP_COUNT }, (_, i) => generateEmployee(i));
  let done = 0;
  const created = [];

  const tasks = employees.map((emp) => async () => {
    const label = `${emp.firstname} ${emp.lastname}`;
    progress(++done, EMP_COUNT, label);

    if (DRY_RUN) return emp;

    const { ok: success, status, data } = await apiPost('/employees', emp, token);
    if (success) {
      const id = data?.data?.id ?? data?.id ?? '?';
      created.push({ ...emp, id });
      return { ...emp, id };
    }
    if (status === 422) return null;   // already exists — skip silently
    process.stdout.write(`\n`);
    fail(`${emp.email} (${status}): ${data?.message ?? 'unknown'}`);
    return null;
  });

  await runPool(tasks, CONCURRENCY);
  process.stdout.write('\n');
  info(`Employees: ${created.length} created`);
  return created;
}

// ─── Seed programs ────────────────────────────────────────────────────────────
async function seedPrograms(token) {
  section(`Seeding ${PROG_COUNT} Programs  (concurrency=${CONCURRENCY})`);

  const programs = Array.from({ length: PROG_COUNT }, (_, i) => generateProgram(i));
  let done = 0;
  const created = [];

  const tasks = programs.map((prog) => async () => {
    progress(++done, PROG_COUNT, prog.name);

    if (DRY_RUN) return prog;

    const { ok: success, status, data } = await apiPost('/programs', prog, token);
    if (success) {
      const id = data?.data?.id ?? data?.id ?? '?';
      created.push({ ...prog, id });
      return { ...prog, id };
    }
    if (status === 422) return null;
    process.stdout.write('\n');
    fail(`${prog.name} (${status}): ${data?.message ?? 'unknown'}`);
    return null;
  });

  await runPool(tasks, CONCURRENCY);
  process.stdout.write('\n');
  info(`Programs: ${created.length} created`);
  return created;
}

// ─── Seed program assignments ─────────────────────────────────────────────────
async function seedAssignments(employees, programs, token) {
  if (!employees.length || !programs.length) return;
  section('Assigning Programs to Employees');

  // Every employee gets 1–3 random programs
  const pairs = employees
    .filter((e) => e?.id)
    .map((emp) => {
      const n        = randInt(1, Math.min(3, programs.length));
      const assigned = [...programs].sort(() => Math.random() - 0.5).slice(0, n);
      return { empId: String(emp.id), programIds: assigned.map((p) => String(p.id)), name: `${emp.firstname} ${emp.lastname}` };
    });

  let done = 0;
  const tasks = pairs.map((pair) => async () => {
    progress(++done, pairs.length, pair.name);
    if (DRY_RUN) return;
    await apiPost(`/employees/${pair.empId}/programs`, { programs: pair.programIds }, token);
  });

  await runPool(tasks, CONCURRENCY);
  process.stdout.write('\n');
  info(`Assigned programs to ${pairs.length} employees`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  process.stdout.write(`\n${c.bold}${c.cyan}Vitaway Employer Seed Script${c.reset}\n`);
  process.stdout.write(`${c.dim}API      : ${API_BASE}${c.reset}\n`);
  process.stdout.write(`${c.dim}Employees: ${EMP_COUNT}  Programs: ${PROG_COUNT}  Concurrency: ${CONCURRENCY}${c.reset}\n`);
  if (DRY_RUN) process.stdout.write(`${c.yellow}Mode: DRY RUN — no data will be written${c.reset}\n`);

  const token = await authenticate();
  let emp = [], prog = [];

  switch (COMMAND) {
    case 'employees':
      await seedEmployees(token);
      break;
    case 'programs':
      await seedPrograms(token);
      break;
    case 'all':
    default:
      emp  = await seedEmployees(token);
      prog = await seedPrograms(token);
      await seedAssignments(emp, prog, token);
  }

  process.stdout.write(`\n${c.green}${c.bold}Done.${c.reset}\n\n`);
}

main().catch((err) => {
  process.stderr.write(`\n${c.red}✗ Unexpected error: ${err.message}${c.reset}\n`);
  process.exit(1);
});
