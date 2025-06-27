"use client"

import { useState } from "react"
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
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar solicitação")
      }

      setMessage(data.message)
      setIsSubmitted(true)
      
      // Em desenvolvimento, mostrar o link direto
      if (process.env.NODE_ENV === 'development' && data.resetLink) {
        console.log('🔗 Link de reset:', data.resetLink)
        setMessage(
          `${data.message}\n\n🔗 Link de desenvolvimento: ${data.resetLink}`
        )
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar solicitação"
      setError(errorMessage)
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
              Digite seu email para receber um link de redefinição de senha
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isSubmitted ? (
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
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Link
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="w-6 h-6 mr-2" />
                    <span className="font-medium">Email enviado!</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message}</p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail("")
                    setMessage("")
                  }}
                  className="w-full"
                >
                  Enviar novamente
                </Button>
              </div>
            )}

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