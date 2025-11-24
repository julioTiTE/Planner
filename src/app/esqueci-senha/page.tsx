"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GreekEyeBackground } from "@/components/greek-eye-background"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Verificar se o email existe no localStorage
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const userExists = existingUsers.some((user: any) => user.email === email)

      if (!userExists) {
        setError("Email não encontrado. Verifique o email digitado.")
        setIsLoading(false)
        return
      }

      // Se o email existe, gerar um token de redefinição
      const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Salvar o token com o email associado
      const resetData = {
        email: email,
        token: resetToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // Expira em 1 hora
      }

      // Armazenar no localStorage
      localStorage.setItem("resetToken", JSON.stringify(resetData))

      // Aguardar um pouco para simular processamento
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirecionar para a página de redefinição com o token
      router.push(`/reset-password?token=${resetToken}`)

    } catch (error: unknown) {
      console.error("Erro ao processar solicitação:", error)
      setError("Erro ao processar solicitação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GreekEyeBackground />
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-blue-300 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900 mb-2">
              Esqueceu sua senha?
            </CardTitle>
            <CardDescription className="text-blue-700">
              Digite seu email para redefinir sua senha
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 text-lg font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="mr-2 h-5 w-5" />
                    Continuar
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar para o login
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-blue-100">
              <p className="text-xs text-blue-500">🧿 Protegido pelos olhos gregos 🧿</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}