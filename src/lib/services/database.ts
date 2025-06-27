import { query } from '@/lib/database/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  User,
  Event,
  Category,
  UserPreferences,
  EventWithCategory,
  CreateEventRequest,
  UpdateEventRequest,
  UserStats
} from '../types/database'

export class DatabaseService {
  // ===== USUÁRIOS =====
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const result = await query(`
        INSERT INTO users (name, email, password_hash, avatar_url, timezone, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userData.name,
        userData.email,
        userData.password_hash,
        userData.avatar_url,
        userData.timezone,
        userData.is_active
      ])
      
      return result.rows[0]
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error)
      throw error
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND is_active = true',
        [id]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      throw error
    }
  }

  // ===== AUTENTICAÇÃO =====
  static async authenticateUser(email: string, password: string): Promise<{
    success: boolean
    user?: User
    token?: string
    message?: string
  }> {
    try {
      const user = await this.getUserByEmail(email)

      if (!user) {
        return { 
          success: false, 
          message: 'Usuário não encontrado' 
        }
      }

      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        return { 
          success: false, 
          message: 'Senha incorreta' 
        }
      }

      // ✅ Gerar token JWT real
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      }
    }
  }

  // ===== CATEGORIAS =====
  static async getCategories(): Promise<Category[]> {
    try {
      const result = await query(
        'SELECT * FROM categories ORDER BY is_default DESC, name ASC'
      )
      
      return result.rows
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }
  }

  static async createDefaultCategories(): Promise<void> {
    try {
      const defaultCategories = [
        { name: 'Trabalho', color_class: 'bg-blue-500', border_class: 'border-blue-500', hex_color: '#3B82F6', is_default: true },
        { name: 'Pessoal', color_class: 'bg-green-500', border_class: 'border-green-500', hex_color: '#10B981', is_default: true },
        { name: 'Saúde', color_class: 'bg-red-500', border_class: 'border-red-500', hex_color: '#EF4444', is_default: true },
        { name: 'Estudos', color_class: 'bg-purple-500', border_class: 'border-purple-500', hex_color: '#8B5CF6', is_default: true },
        { name: 'Casa', color_class: 'bg-orange-500', border_class: 'border-orange-500', hex_color: '#F97316', is_default: true },
        { name: 'Lazer', color_class: 'bg-pink-500', border_class: 'border-pink-500', hex_color: '#EC4899', is_default: true },
      ]

      for (const category of defaultCategories) {
        await query(`
          INSERT INTO categories (name, color_class, border_class, hex_color, is_default)
          SELECT $1, $2, $3, $4, $5
          WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = $1)
        `, [
          category.name,
          category.color_class,
          category.border_class,
          category.hex_color,
          category.is_default
        ])
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error)
      throw error
    }
  }

  // ===== EVENTOS =====
  static async createEvent(userId: string, eventData: CreateEventRequest): Promise<Event> {
    try {
      // Buscar categoria padrão se não fornecida
      let categoryId = eventData.category_id
      if (!categoryId) {
        const defaultCategory = await query(
          'SELECT id FROM categories WHERE is_default = true ORDER BY name LIMIT 1'
        )
        
        categoryId = defaultCategory.rows[0]?.id
      }

      const result = await query(`
        INSERT INTO events (user_id, category_id, title, description, event_date, event_time, event_type, priority, reminder_minutes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        userId,
        categoryId,
        eventData.title,
        eventData.description,
        eventData.event_date,
        eventData.event_time,
        eventData.event_type,
        eventData.priority || 2,
        eventData.reminder_minutes
      ])
      
      return result.rows[0]
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }
  }

  static async getUserEvents(userId: string, startDate?: string, endDate?: string): Promise<EventWithCategory[]> {
    try {
      let queryText = `
        SELECT 
          e.*,
          c.name as category_name,
          c.color_class as category_color_class,
          c.border_class as category_border_class,
          c.hex_color as category_hex_color,
          c.is_default as category_is_default,
          c.created_at as category_created_at
        FROM events e
        INNER JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1
      `
      
      const params = [userId]

      if (startDate) {
        queryText += ' AND e.event_date >= $' + (params.length + 1)
        params.push(startDate)
      }

      if (endDate) {
        queryText += ' AND e.event_date <= $' + (params.length + 1)
        params.push(endDate)
      }

      queryText += ' ORDER BY e.event_date ASC, e.event_time ASC'

      const result = await query(queryText, params)
      
      return result.rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        category_id: row.category_id,
        title: row.title,
        description: row.description,
        event_date: row.event_date,
        event_time: row.event_time,
        event_type: row.event_type,
        is_completed: row.is_completed,
        priority: row.priority,
        reminder_minutes: row.reminder_minutes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        completed_at: row.completed_at,
        category: {
          id: row.category_id,
          name: row.category_name,
          color_class: row.category_color_class,
          border_class: row.category_border_class,
          hex_color: row.category_hex_color,
          is_default: row.category_is_default,
          created_at: row.category_created_at
        }
      }))
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      throw error
    }
  }

  static async updateEvent(userId: string, eventData: UpdateEventRequest): Promise<Event> {
    try {
      const updates = []
      const params = [eventData.id, userId]
      let paramCounter = 2

      if (eventData.title !== undefined) {
        paramCounter++
        updates.push(`title = $${paramCounter}`)
        params.push(eventData.title)
      }

      if (eventData.description !== undefined) {
        paramCounter++
        updates.push(`description = $${paramCounter}`)
        params.push(eventData.description)
      }

      if (eventData.event_date !== undefined) {
        paramCounter++
        updates.push(`event_date = $${paramCounter}`)
        params.push(eventData.event_date)
      }

      if (eventData.event_time !== undefined) {
        paramCounter++
        updates.push(`event_time = $${paramCounter}`)
        params.push(eventData.event_time)
      }

      if (eventData.priority !== undefined) {
        paramCounter++
        updates.push(`priority = ${paramCounter}`)
        params.push(eventData.priority.toString())
      }

      if (eventData.is_completed !== undefined) {
        paramCounter++
        updates.push(`is_completed = ${paramCounter}`)
        params.push(eventData.is_completed.toString())
        
        paramCounter++
        updates.push(`completed_at = ${paramCounter}`)
        params.push(eventData.is_completed ? new Date().toISOString() : '')
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo para atualizar')
      }

      const result = await query(`
        UPDATE events 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, params)
      
      if (result.rows.length === 0) {
        throw new Error('Evento não encontrado ou não pertence ao usuário')
      }

      return result.rows[0]
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw error
    }
  }

  static async deleteEvent(userId: string, eventId: string): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2',
      [eventId, userId]
    )

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    throw error
  }
}


  // ===== ESTATÍSTICAS =====
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*)::integer as total_events,
          SUM(CASE WHEN event_type = 'task' AND is_completed = true THEN 1 ELSE 0 END)::integer as completed_tasks,
          SUM(CASE WHEN event_type = 'task' AND is_completed = false THEN 1 ELSE 0 END)::integer as pending_tasks,
          (SELECT COUNT(DISTINCT category_id)::integer FROM events WHERE user_id = $1) as total_categories
        FROM events 
        WHERE user_id = $1
      `, [userId])
      
      return result.rows[0] || {
        total_events: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        total_categories: 0
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  // ===== PREFERÊNCIAS =====
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const result = await query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Erro ao buscar preferências:', error)
      throw error
    }
  }

  static async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    try {
      const result = await query(`
        INSERT INTO user_preferences (user_id)
        VALUES ($1)
        RETURNING *
      `, [userId])
      
      return result.rows[0]
    } catch (error) {
      console.error('Erro ao criar preferências padrão:', error)
      throw error
    }
  }


// ===== VERIFICAÇÕES ADICIONAIS =====
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email)
      return !!user
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      throw error
    }
  }

  static async validateUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    // Validações básicas
    if (!userData.name?.trim()) {
      return 'Nome é obrigatório'
    }

    if (!userData.email?.trim()) {
      return 'Email é obrigatório'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return 'Email inválido'
    }

    if (!userData.password_hash) {
      return 'Senha é obrigatória'
    }

    // Verificar se email já existe
    const existingUser = await this.getUserByEmail(userData.email)
    if (existingUser) {
      return 'Este email já está cadastrado'
    }

    return null // Sem erros
  }


// ===== RESET DE SENHA =====
  static async savePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      await query(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) 
        DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()
      `, [userId, token, expiresAt])
    } catch (error) {
      console.error('Erro ao salvar token de reset:', error)
      throw error
    }
  }

  static async getPasswordResetToken(token: string): Promise<{ user_id: string; expires_at: Date } | null> {
    try {
      const result = await query(
        'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1',
        [token]
      )
      
      return result.rows[0] || null
    } catch (error) {
      console.error('Erro ao buscar token de reset:', error)
      throw error
    }
  }

  static async deletePasswordResetToken(token: string): Promise<void> {
    try {
      await query(
        'DELETE FROM password_reset_tokens WHERE token = $1',
        [token]
      )
    } catch (error) {
      console.error('Erro ao deletar token de reset:', error)
      throw error
    }
  }

  static async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await query(`
        UPDATE users 
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
      `, [hashedPassword, userId])
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      throw error
    }
  }


}