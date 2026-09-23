// api-gateway/src/lib/odoo.ts
const ODOO_URL = process.env.ODOO_URL || 'http://odoo:8069';
const ODOO_DB = 'practice_db';
const ODOO_USER = 'api@bot.com';
const ODOO_PASS = 'apipassword123';

export async function getOdooSession() {
  const response = await fetch(`${ODOO_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      params: { db: ODOO_DB, login: ODOO_USER, password: ODOO_PASS }
    })
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error.data.message);
  
  const cookie = response.headers.get('set-cookie');
  return { cookie };
}

export async function callOdoo(
  model: string, 
  method: string, 
  args: unknown[], 
  kwargs: Record<string, unknown> = {}
) {
  const { cookie } = await getOdooSession();
  const response = await fetch(`${ODOO_URL}/web/dataset/call_kw/${model}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie || ''
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      params: { model, method, args, kwargs }
    })
  });
  
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error.data));
  return data.result;
}