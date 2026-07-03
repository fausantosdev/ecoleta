import { createCookieSessionStorage } from "react-router"

const sessionSecret = 'secret'

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set")
}

// Define os tipos para os dados da sessão e os dados de flash
type SessionDataTypes = {
  token: string
}

// Define os tipos para os dados de flash, que são usados para mensagens temporárias, como erros ou sucessos
type SessionFlashDataTypes = {
  info: string
  success: string
  warning: string
  error: any
}

// Define os tipos para os dados que podem ser obtidos da sessão
type SessionGetTypes = 'token' | 'error' | 'success'

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionDataTypes, SessionFlashDataTypes>(
    {
      cookie: {
        name: "__session",// Nome do cookie
        httpOnly: true,// Impede acesso ao cookie via JavaScript
        maxAge: 60 * 60 * 24, // 24 horas em segundos
        path: "/",// Disponível em todo o site
        sameSite: "lax",// Protege contra CSRF
        secrets: [sessionSecret],// Chave para assinar o cookie
        secure: false,// Defina como true em produção para usar apenas HTTPS
      },
    },
  )

export {
  getSession,
  commitSession,
  destroySession,
  SessionDataTypes,
  SessionFlashDataTypes,
  SessionGetTypes
}
