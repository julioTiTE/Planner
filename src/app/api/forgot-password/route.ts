export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    console.log('🔍 Forgot password attempt:', { email })
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await DatabaseService.getUserByEmail(email)
    
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá um link de redefinição de senha.'
      })
    }

    // Gerar token de reset (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco
    await DatabaseService.savePasswordResetToken(user.id, resetToken, resetTokenExpiry)

    // Aqui você enviaria o email (por enquanto só logamos)
    console.log('🔗 Reset link:', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`)
    
    // Em produção, você enviaria um email aqui
    // await sendResetPasswordEmail(email, resetToken)

    return NextResponse.json({
      success: true,
      message: 'Se o email existir, você receberá um link de redefinição de senha.',
      // Para desenvolvimento, incluir o token
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      })
    })

  } catch (error) {
    console.error('💥 Erro ao processar esqueci senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}