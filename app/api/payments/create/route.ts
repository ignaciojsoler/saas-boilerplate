import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayment } from '@/lib/mercadopago/utils';
import { CreatePaymentRequest } from '@/lib/mercadopago/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreatePaymentRequest = await request.json();
    
    // Validar datos requeridos
    if (!body.transaction_amount || !body.token || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Agregar referencia externa con el ID del usuario
    const paymentData = {
      ...body,
      external_reference: `user_${user.id}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
      payer: {
        ...body.payer,
        email: user.email || body.payer.email
      }
    };

    const payment = await createPayment(paymentData);

    // Guardar información del pago en Supabase
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        amount: payment.transaction_amount,
        status: payment.status,
        external_reference: payment.external_reference,
        plan_id: body.items[0]?.id || 'unknown'
      });

    if (dbError) {
      console.error('Error saving payment to database:', dbError);
    }

    return NextResponse.json({ 
      success: true, 
      payment,
      redirect_url: payment.status === 'approved' 
        ? '/protected/billing?status=success' 
        : '/protected/billing?status=pending'
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 