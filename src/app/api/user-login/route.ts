export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Login attempt:', { email, password }) // LOG 1
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('🔍 Calling DatabaseService.authenticateUser') // LOG 2
    
    // Usar o DatabaseService para autenticar
    const authResult = await DatabaseService.authenticateUser(email, password)
    
    console.log('🔍 Auth result:', authResult) // LOG 3

    if (!authResult.success) {
      return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token
    })
  } catch (error) {
    console.error('💥 Erro no login:', error) // LOG 4
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}