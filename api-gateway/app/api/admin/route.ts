// api-gateway/app/api/admin/route.ts
import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db'; 

export async function GET() {
  const db = getDB();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = getDB();

  const newKey = {
    key: 'pk_' + Math.random().toString(36).substr(2, 9),
    role: body.role || 'read-only'
  };

  db.keys.push(newKey);
  saveDB(db);

  return NextResponse.json(newKey);
}

export async function PUT(request: Request) {
  const metric = await request.json();
  const db = getDB();

  db.metrics.unshift(metric);

  if (db.metrics.length > 5000) db.metrics.pop();

  saveDB(db);
  return NextResponse.json({ success: true });
}