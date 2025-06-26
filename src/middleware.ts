import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Permitir acesso aos arquivos internos do Next.js e páginas públicas
  if (
    pathname.startsWith("/_next") || // arquivos de build
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") || // API routes
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.includes(".") // arquivos estáticos: .js, .css, .ico, etc.
  ) {
    return NextResponse.next();
  }

  console.log("🔍 Middleware: Verificando acesso para:", pathname);
  
  // 🔒 Verificar autenticação através do cookie
  const sessionToken = request.cookies.get("sessionToken")?.value;
  
  console.log("🔍 Middleware: Todos os cookies:", request.cookies.getAll());
  console.log("🔍 Middleware: Token encontrado:", sessionToken ? "SIM" : "NÃO");
  
  if (!sessionToken) {
    console.log("🚫 Middleware: Token não encontrado, redirecionando para /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Token existe, permitir acesso
  // (Removemos a validação JWT para evitar erro do Edge Runtime)
  console.log("✅ Middleware: Token presente, permitindo acesso");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - cadastro (signup page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|cadastro|esqueci-senha).*)",
  ],
};