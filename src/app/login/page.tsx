import LoginForm from "@/components/login-form"
import { GreekEyeBackground } from "@/components/greek-eye-background"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GreekEyeBackground />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}