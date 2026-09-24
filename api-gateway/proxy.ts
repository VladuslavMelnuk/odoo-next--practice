import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  const startTime = Date.now();
  const apiKey = request.headers.get('x-api-key');
  const origin = request.nextUrl.origin;

  const dbResponse = await fetch(`${origin}/api/admin`);
  const db = await dbResponse.json();
  
  // Виправлено: замість any вказуємо точну структуру об'єкта
  const validKeyObj = db.keys.find((k: { key: string; role: string }) => k.key === apiKey);

  const logMetric = async (status: number) => {
    const duration = Date.now() - startTime;
    await fetch(`${origin}/api/admin`, {
      method: 'PUT',
      body: JSON.stringify({
        id: Date.now(),
        key: apiKey || 'unknown',
        endpoint: request.nextUrl.pathname,
        method: request.method,
        status: status,
        time: `${duration}ms`,
        date: new Date().toLocaleTimeString()
      })
    }).catch(() => {});
  };

  if (!apiKey || !validKeyObj) {
    await logMetric(401);
    return NextResponse.json({ success: false, error: 'Unauthorized: Недійсний ключ' }, { status: 401 });
  }

  if (validKeyObj.role === 'read-only' && request.method !== 'GET') {
    await logMetric(403);
    return NextResponse.json({ 
      success: false, 
      error: 'Forbidden: Для створення/редагування потрібен ключ з роллю admin' 
    }, { status: 403 });
  }

  const response = NextResponse.next();
  await logMetric(200);
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
