import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPreference } from '@/lib/mercadopago/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/mercadopago/utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();
    
    // Validar plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Crear preferencia de pago siguiendo la guía de Ignacio
    const redirectUrl = await createPreference(plan);

    return NextResponse.json({ 
      success: true, 
      redirectUrl
    });

  } catch (error) {
    console.error('Preference creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 