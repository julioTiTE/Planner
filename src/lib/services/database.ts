import { getDbConnection, sql } from '@/lib/database/config' // ✅ Ajustar o caminho
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' // ✅ Adicionar JWT
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
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('name', sql.VarChar(100), userData.name)
        .input('email', sql.VarChar(150), userData.email)
        .input('password_hash', sql.VarChar(255), userData.password_hash)
        .input('avatar_url', sql.VarChar(500), userData.avatar_url)
        .input('timezone', sql.VarChar(50), userData.timezone)
        .input('is_active', sql.Bit, userData.is_active)
        .query(`
          INSERT INTO users (name, email, password_hash, avatar_url, timezone, is_active)
          OUTPUT INSERTED.*
          VALUES (@name, @email, @password_hash, @avatar_url, @timezone, @is_active)
        `)
      
      return result.recordset[0]
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('email', sql.VarChar(150), email)
        .query('SELECT * FROM users WHERE email = @email AND is_active = 1')
      
      return result.recordset[0] || null
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error)
      throw error
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM users WHERE id = @id AND is_active = 1')
      
      return result.recordset[0] || null
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error)
      throw error
    }
  }

  // ===== AUTENTICAÇÃO ===== ✅ CORRIGIDO
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
      const pool = await getDbConnection()
      const result = await pool.request()
        .query('SELECT * FROM categories ORDER BY is_default DESC, name ASC')
      
      return result.recordset
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }
  }

  static async createDefaultCategories(): Promise<void> {
    try {
      const pool = await getDbConnection()
      
      const defaultCategories = [
        { name: 'Trabalho', color_class: 'bg-blue-500', border_class: 'border-blue-500', hex_color: '#3B82F6', is_default: true },
        { name: 'Pessoal', color_class: 'bg-green-500', border_class: 'border-green-500', hex_color: '#10B981', is_default: true },
        { name: 'Saúde', color_class: 'bg-red-500', border_class: 'border-red-500', hex_color: '#EF4444', is_default: true },
        { name: 'Estudos', color_class: 'bg-purple-500', border_class: 'border-purple-500', hex_color: '#8B5CF6', is_default: true },
        { name: 'Casa', color_class: 'bg-orange-500', border_class: 'border-orange-500', hex_color: '#F97316', is_default: true },
        { name: 'Lazer', color_class: 'bg-pink-500', border_class: 'border-pink-500', hex_color: '#EC4899', is_default: true },
      ]

      for (const category of defaultCategories) {
        await pool.request()
          .input('name', sql.VarChar(50), category.name)
          .input('color_class', sql.VarChar(50), category.color_class)
          .input('border_class', sql.VarChar(50), category.border_class)
          .input('hex_color', sql.Char(7), category.hex_color)
          .input('is_default', sql.Bit, category.is_default)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM categories WHERE name = @name)
            INSERT INTO categories (name, color_class, border_class, hex_color, is_default)
            VALUES (@name, @color_class, @border_class, @hex_color, @is_default)
          `)
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error)
      throw error
    }
  }

  // ===== EVENTOS =====
  static async createEvent(userId: string, eventData: CreateEventRequest): Promise<Event> {
    try {
      const pool = await getDbConnection()
      
      // Buscar categoria padrão se não fornecida
      let categoryId = eventData.category_id
      if (!categoryId) {
        const defaultCategory = await pool.request()
          .query('SELECT TOP 1 id FROM categories WHERE is_default = 1 ORDER BY name')
        
        categoryId = defaultCategory.recordset[0]?.id
      }

      const result = await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .input('category_id', sql.UniqueIdentifier, categoryId)
        .input('title', sql.VarChar(200), eventData.title)
        .input('description', sql.NVarChar(sql.MAX), eventData.description)
        .input('event_date', sql.Date, eventData.event_date)
        .input('event_time', sql.Time, eventData.event_time)
        .input('event_type', sql.VarChar(20), eventData.event_type)
        .input('priority', sql.Int, eventData.priority || 2)
        .input('reminder_minutes', sql.Int, eventData.reminder_minutes)
        .query(`
          INSERT INTO events (user_id, category_id, title, description, event_date, event_time, event_type, priority, reminder_minutes)
          OUTPUT INSERTED.*
          VALUES (@user_id, @category_id, @title, @description, @event_date, @event_time, @event_type, @priority, @reminder_minutes)
        `)
      
      return result.recordset[0]
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      throw error
    }
  }

  static async getUserEvents(userId: string, startDate?: string, endDate?: string): Promise<EventWithCategory[]> {
    try {
      const pool = await getDbConnection()
      
      let query = `
        SELECT 
          e.*,
          c.name as category_name,
          c.color_class as category_color_class,
          c.border_class as category_border_class,
          c.hex_color as category_hex_color
        FROM events e
        INNER JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = @user_id
      `
      
      const request = pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)

      if (startDate) {
        query += ' AND e.event_date >= @start_date'
        request.input('start_date', sql.Date, startDate)
      }

      if (endDate) {
        query += ' AND e.event_date <= @end_date'
        request.input('end_date', sql.Date, endDate)
      }

      query += ' ORDER BY e.event_date ASC, e.event_time ASC'

      const result = await request.query(query)
      
      return result.recordset.map(row => ({
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
          is_default: false,
          created_at: new Date()
        }
      }))
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      throw error
    }
  }

  static async updateEvent(userId: string, eventData: UpdateEventRequest): Promise<Event> {
    try {
      const pool = await getDbConnection()
      
      const updates = []
      const request = pool.request()
        .input('id', sql.UniqueIdentifier, eventData.id)
        .input('user_id', sql.UniqueIdentifier, userId)

      if (eventData.title !== undefined) {
        updates.push('title = @title')
        request.input('title', sql.VarChar(200), eventData.title)
      }

      if (eventData.description !== undefined) {
        updates.push('description = @description')
        request.input('description', sql.NVarChar(sql.MAX), eventData.description)
      }

      if (eventData.event_date !== undefined) {
        updates.push('event_date = @event_date')
        request.input('event_date', sql.Date, eventData.event_date)
      }

      if (eventData.event_time !== undefined) {
        updates.push('event_time = @event_time')
        request.input('event_time', sql.Time, eventData.event_time)
      }

      if (eventData.priority !== undefined) {
        updates.push('priority = @priority')
        request.input('priority', sql.Int, eventData.priority)
      }

      if (eventData.is_completed !== undefined) {
        updates.push('is_completed = @is_completed')
        updates.push('completed_at = @completed_at')
        request.input('is_completed', sql.Bit, eventData.is_completed)
        request.input('completed_at', sql.DateTimeOffset, eventData.is_completed ? new Date() : null)
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo para atualizar')
      }

      const result = await request.query(`
        UPDATE events 
        SET ${updates.join(', ')}, updated_at = SYSDATETIMEOFFSET()
        OUTPUT INSERTED.*
        WHERE id = @id AND user_id = @user_id
      `)
      
      if (result.recordset.length === 0) {
        throw new Error('Evento não encontrado ou não pertence ao usuário')
      }

      return result.recordset[0]
    } catch (error) {
      console.error('Erro ao atualizar evento:', error)
      throw error
    }
  }

  static async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('id', sql.UniqueIdentifier, eventId)
        .input('user_id', sql.UniqueIdentifier, userId)
        .query('DELETE FROM events WHERE id = @id AND user_id = @user_id')
      
      return result.rowsAffected[0] > 0
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
      throw error
    }
  }

  // ===== ESTATÍSTICAS =====
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .query(`
          SELECT 
            COUNT(*) as total_events,
            SUM(CASE WHEN event_type = 'task' AND is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
            SUM(CASE WHEN event_type = 'task' AND is_completed = 0 THEN 1 ELSE 0 END) as pending_tasks,
            (SELECT COUNT(DISTINCT category_id) FROM events WHERE user_id = @user_id) as total_categories
          FROM events 
          WHERE user_id = @user_id
        `)
      
      return result.recordset[0] || {
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
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .query('SELECT * FROM user_preferences WHERE user_id = @user_id')
      
      return result.recordset[0] || null
    } catch (error) {
      console.error('Erro ao buscar preferências:', error)
      throw error
    }
  }

  static async createDefaultPreferences(userId: string): Promise<UserPreferences> {
    try {
      const pool = await getDbConnection()
      const result = await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .query(`
          INSERT INTO user_preferences (user_id)
          OUTPUT INSERTED.*
          VALUES (@user_id)
        `)
      
      return result.recordset[0]
    } catch (error) {
      console.error('Erro ao criar preferências padrão:', error)
      throw error
    }
  }
}