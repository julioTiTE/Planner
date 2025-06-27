"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

           
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Falha no login")
      }

      const data = await response.json()

      // ✅ Armazena o token como cookie (funciona no servidor e cliente)
      document.cookie = `sessionToken=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
      
      // ✅ Também mantém no localStorage como backup
      localStorage.setItem("sessionToken", data.token)
      
      console.log("🔍 Token salvo nos cookies e localStorage:", data.token)

      // Redireciona para o planner
      router.push("/")
    } catch (error: unknown) { // ✅ MUDANÇA: any → unknown
      const errorMessage = error instanceof Error ? error.message : "Falha no login. Tente novamente."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-blue-300 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <span className="text-4xl">🧿</span>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-blue-700">
          Entre com suas credenciais para acessar seu planner digital
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-blue-900 font-medium">
                Senha
              </Label>
              <a href="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
                Entrando...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5" />
                Entrar
              </span>
            )}
          </Button>
        </form>

        <div className="text-center">
          <div className="text-sm text-blue-600">
            Não tem uma conta?{" "}
            <a href="/cadastro" className="text-blue-700 hover:text-blue-900 font-medium hover:underline">
              Criar conta
            </a>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-blue-100">
          <p className="text-xs text-blue-500">🧿 Protegido pelos olhos gregos 🧿</p>
        </div>
      </CardContent>
    </Card>
  )
}