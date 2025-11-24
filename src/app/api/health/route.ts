import { NextResponse } from 'next/server';
import { query } from '@/lib/database/config';

export async function GET() {
  try {
    // Faz uma query simples para manter conexão ativa
    await query('SELECT 1');
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}