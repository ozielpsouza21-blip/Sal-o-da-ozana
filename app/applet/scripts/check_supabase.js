const https = require('https');

const url = process.env.VITE_SUPABASE_URL || 'https://mgxcguiqjncopdvowoae.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Connecting to URL:', url);
console.log('Key available:', key ? key.substring(0, 15) + '...' : 'NO KEY');

const tables = [
  'profiles', 'configuracoes_salao', 'profissionais', 'clientes',
  'servicos', 'produtos', 'agendamentos', 'caixa_status',
  'transacoes_caixa', 'conversas', 'mensagens', 'historico_formulas'
];

async function checkTables() {
  console.log('\n--- CHECKING TABLES ON SUPABASE (Espaçobelamulher) ---');
  for (const table of tables) {
    await new Promise((resolve) => {
      const u = new URL(`${url}/rest/v1/${table}?select=*&limit=1`);
      const req = https.request(u, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`Table '${table}': HTTP ${res.statusCode} | Output: ${body.substring(0, 120)}`);
          resolve();
        });
      });
      req.on('error', (err) => {
        console.log(`Table '${table}': ERROR ${err.message}`);
        resolve();
      });
      req.end();
    });
  }
}

async function checkUser() {
  console.log('\n--- CHECKING FOR USER oficial.belamulher@gmail.com IN PROFILES ---');
  await new Promise((resolve) => {
    const u = new URL(`${url}/rest/v1/profiles?email=eq.oficial.belamulher@gmail.com`);
    const req = https.request(u, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`User query in profiles: HTTP ${res.statusCode} | Output: ${body}`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.log(`User query error: ${err.message}`);
      resolve();
    });
    req.end();
  });
}

async function checkAuthHealth() {
  console.log('\n--- CHECKING AUTH SYSTEM HEALTH ---');
  await new Promise((resolve) => {
    const u = new URL(`${url}/auth/v1/health`);
    const req = https.request(u, {
      method: 'GET',
      headers: {
        'apikey': key
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`Auth Health: HTTP ${res.statusCode} | Output: ${body}`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.log(`Auth Health error: ${err.message}`);
      resolve();
    });
    req.end();
  });
}

async function run() {
  await checkAuthHealth();
  await checkTables();
  await checkUser();
}

run();
