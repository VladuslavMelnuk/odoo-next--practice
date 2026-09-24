// api-gateway/src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { callOdoo } from '../../../lib/odoo';

// POST: Створення замовлення
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Створюємо клієнта
    const partnerId = await callOdoo('res.partner', 'create', [[{
      name: body.customer_name,
    }]]);

    // 2. Створюємо замовлення
    const orderId = await callOdoo('sale.order', 'create', [[{
      partner_id: partnerId[0],
      order_line: [
        [0, 0, {
          product_id: body.product_id, // Передаємо ID існуючого товару
          product_uom_qty: body.quantity,
          price_unit: body.price
        }]
      ]
    }]]);

    return NextResponse.json({ success: true, orderId: orderId[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// PUT: Зміна статусу замовлення
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'confirm') {
      await callOdoo('sale.order', 'action_confirm', [[body.order_id]]);
    }

    return NextResponse.json({ success: true, message: 'Статус замовлення оновлено' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
