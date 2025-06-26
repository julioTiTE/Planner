import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/database'
import { UpdateEventRequest } from '@/lib/types/database'

// PUT /api/events/[id] - Atualizar evento
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const { userId, ...eventData }: { userId: string } & Partial<UpdateEventRequest> = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }
    
    const updateData: UpdateEventRequest = {
      id: params.id,
      ...eventData
    }
    
    const event = await DatabaseService.updateEvent(userId, updateData)
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Deletar evento
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }
    
    const deleted = await DatabaseService.deleteEvent(userId, params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}