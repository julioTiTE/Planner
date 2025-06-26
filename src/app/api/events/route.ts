import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import { CreateEventRequest } from '@/lib/types/database'

// GET /api/events - Buscar eventos do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const events = await DatabaseService.getUserEvents(userId, startDate || undefined, endDate || undefined)
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Erro na API de eventos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/events - Criar novo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...eventData }: { userId: string } & CreateEventRequest = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    if (!eventData.title || !eventData.event_date || !eventData.event_type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: title, event_date, event_type' },
        { status: 400 }
      )
    }

    const event = await DatabaseService.createEvent(userId, eventData)
    
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}