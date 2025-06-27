export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json()
    
    console.log('🔍 Register attempt:', { name, email })
    
    // Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'As senhas não coincidem' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await DatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar usuário
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      avatar_url: null,
      timezone: 'America/Sao_Paulo',
      is_active: true
    }

    const newUser = await DatabaseService.createUser(userData)

    // Criar preferências padrão
    await DatabaseService.createDefaultPreferences(newUser.id)

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('💥 Erro ao criar conta:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}