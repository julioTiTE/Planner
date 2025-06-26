import { Pool, PoolClient, QueryResult } from 'pg'

// Configuração do banco PostgreSQL (Supabase)
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

let pool: Pool | null = null

export async function getDbConnection(): Promise<Pool> {
  try {
    if (pool) return pool
    
    pool = new Pool(dbConfig)
    
    // Testa a conexão
    const client = await pool.connect()
    console.log('✅ Conectado ao banco PostgreSQL (Supabase)')
    client.release()
    
    return pool
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco PostgreSQL:', error)
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  const connection = await getDbConnection()
  return connection.connect()
}

export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.end()
      pool = null
      console.log('✅ Conexão com PostgreSQL fechada')
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error)
    throw error
  }
}

// Helper para executar queries simples
export async function query(
  text: string,
  params?: unknown[]
): Promise<QueryResult<any>> {
  const client = await getClient()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}