"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, ArrowLeft, User, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GreekEyeBackground } from "@/components/greek-eye-background"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      return "Email é obrigatório"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return "Email inválido"
    }

    if (formData.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      return "As senhas não coincidem"
    }

    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar formulário
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar conta")
      }

      // Salvar token
      document.cookie = `sessionToken=${data.token}; path=/; max-age=86400; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
      localStorage.setItem("sessionToken", data.token)
      
      console.log("🎉 Conta criada com sucesso:", data.user)

      // Redirecionar para o dashboard
      router.push("/")

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"
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
                <span className="text-4xl">🧿</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Criar Conta</CardTitle>
            <CardDescription className="text-blue-700">
              Crie sua conta para acessar o planner digital
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-900 font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
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
                <p className="text-xs text-gray-600">Mínimo de 6 caracteres</p>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Indicador de força da senha */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-2 flex-1 rounded ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  </div>
                  <p className="text-xs text-gray-600">
                    Força da senha: {
                      formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) 
                        ? "Forte" 
                        : formData.password.length >= 6 
                        ? "Média" 
                        : "Fraca"
                    }
                  </p>
                </div>
              )}

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
                    Criando conta...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Criar Conta
                  </span>
                )}
              </Button>
            </form>

            {/* Termos de uso */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a>
                {" "}e{" "}
                <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
              </p>
            </div>

            {/* Link para login */}
            <div className="text-center">
              <div className="text-sm text-blue-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-700 hover:text-blue-900 font-medium hover:underline">
                  Fazer login
                </Link>
              </div>
            </div>

            {/* Link para voltar */}
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