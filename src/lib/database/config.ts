import sql from 'mssql'

// Configuração do banco de dados para autenticação SQL
const dbConfig: sql.config = {
  server: process.env.DB_SERVER || 'AR-PDBITP2-0007',
  database: process.env.DB_NAME || 'planner_system', // ✅ Nome correto do banco
  user: process.env.DB_USER || 'meuapp_user',        // ✅ Usuário SQL
  password: process.env.DB_PASSWORD || 'MeuPlanner123', // ✅ Senha SQL
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
    requestTimeout: 30000,
    connectTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool) return pool
    
    pool = await new sql.ConnectionPool(dbConfig).connect()
    console.log('✅ Conectado ao banco de dados SQL Server')
    return pool
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('✅ Conexão com banco fechada')
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error)
    throw error
  }
}

export { sql }