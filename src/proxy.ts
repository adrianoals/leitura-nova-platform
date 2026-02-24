import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
    // Atualiza sessão e reaproveita o usuário retornado para evitar chamada duplicada.
    const { response, user } = await updateSession(request)

    const path = request.nextUrl.pathname

    // Proteção das rotas /app (Morador), /admin (Administrador) e /sindico
    if ((path.startsWith('/app') || path.startsWith('/admin') || path.startsWith('/sindico')) && !user) {
        const url = request.nextUrl.clone()
        url.pathname = path.startsWith('/sindico') ? '/login/sindico' : '/login'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        '/app/:path*',
        '/admin/:path*',
        '/sindico/:path*',
    ],
}
