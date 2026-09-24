// api-gateway/app/api-docs/page.tsx
'use client';

import Script from 'next/script';

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Контейнер, де ReDoc намалює нашу документацію */}
      <div id="redoc-container" className="pt-8 px-4"></div>
      
      {/* Підключаємо скрипт ReDoc через CDN */}
      <Script
        src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"
        onLoad={() => {
          // @ts-expect-error - Redoc is loaded globally from CDN
          window.Redoc.init('/swagger.json', {
            theme: { colors: { primary: { main: '#2563eb' } } } // Синій колір під стиль Tailwind
          }, document.getElementById('redoc-container'));
        }}
      />
    </div>
  );
}