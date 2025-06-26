// Types baseados no banco de dados SQL Server

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  avatar_url?: string
  timezone: string
  created_at: Date
  updated_at: Date
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  color_class: string
  border_class: string
  hex_color: string
  is_default: boolean
  created_at: Date
}

export interface Event {
  id: string
  user_id: string
  category_id: string
  title: string
  description?: string
  event_date: Date
  event_time?: string
  event_type: 'event' | 'task'
  is_completed: boolean
  priority: number
  reminder_minutes?: number
  created_at: Date
  updated_at: Date
  completed_at?: Date
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: Date
  created_at: Date
  last_accessed: Date
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  default_view: 'calendar' | 'planner'
  notifications_enabled: boolean
  email_reminders: boolean
  start_week_on: 'sunday' | 'monday'
  created_at: Date
  updated_at: Date
}

// Types para a API
export interface CreateEventRequest {
  title: string
  description?: string
  event_date: string
  event_time?: string
  event_type: 'event' | 'task'
  priority?: number
  reminder_minutes?: number
  category_id?: string
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string
  is_completed?: boolean
}

export interface EventWithCategory extends Event {
  category: Category
}

export interface UserStats {
  total_events: number
  completed_tasks: number
  pending_tasks: number
  total_categories: number
}

// Types para o frontend (compatibilidade com código atual)
export interface LegacyEvent {
  id: string
  date: Date
  title: string
  description: string
  color: string
}

export interface LegacyTask {
  id: string
  title: string
  description: string
  category: string
  priority: "baixa" | "média" | "alta"
  completed: boolean
}

// Mappers para conversão
export const mapEventToLegacy = (event: EventWithCategory): LegacyEvent => ({
  id: event.id,
  date: event.event_date,
  title: event.title,
  description: event.description || '',
  color: event.category.hex_color
})

export const mapTaskToLegacy = (event: EventWithCategory): LegacyTask => ({
  id: event.id,
  title: event.title,
  description: event.description || '',
  category: event.category.name,
  priority: event.priority === 1 ? 'baixa' : event.priority === 3 ? 'alta' : 'média',
  completed: event.is_completed
})

export const priorityMap = {
  'baixa': 1,
  'média': 2,
  'alta': 3
} as const