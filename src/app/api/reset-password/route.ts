export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()
    
    console.log('🔍 Reset password attempt:', { token })
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar token e se ainda é válido
    const resetRequest = await DatabaseService.getPasswordResetToken(token)
    
    if (!resetRequest || resetRequest.expires_at < new Date()) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar senha do usuário
    await DatabaseService.updateUserPassword(resetRequest.user_id, hashedPassword)

    // Remover token usado
    await DatabaseService.deletePasswordResetToken(token)

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    })

  } catch (error) {
    console.error('💥 Erro ao redefinir senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}