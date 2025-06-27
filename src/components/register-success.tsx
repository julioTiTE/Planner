"use client"

import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RegisterSuccessProps {
  userName: string
  onContinue: () => void
}

export function RegisterSuccess({ userName, onContinue }: RegisterSuccessProps) {
  return (
    <Card className="shadow-2xl border-green-300 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-900 mb-2">
          Bem-vindo, {userName}! 🎉
        </CardTitle>
        <CardDescription className="text-green-700">
          Sua conta foi criada com sucesso! Agora você pode começar a organizar suas tarefas.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="font-medium">✅ Conta criada com sucesso!</p>
            <p className="text-sm mt-2">
              Você já está logado e pode começar a usar o planner digital.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Próximos passos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📅 Adicione seus primeiros eventos</li>
              <li>📝 Crie suas tarefas</li>
              <li>🎨 Explore as categorias</li>
              <li>⚙️ Configure suas preferências</li>
            </ul>
          </div>
          
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <span className="flex items-center justify-center">
              <ArrowRight className="mr-2 h-5 w-5" />
              Começar a usar
            </span>
          </Button>
        </div>

        <div className="text-center pt-4 border-t border-green-100">
          <p className="text-xs text-green-500">🧿 Bem-vindo ao Planner Digital! 🧿</p>
        </div>
      </CardContent>
    </Card>
  )
}