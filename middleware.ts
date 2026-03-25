import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isDemoMode } from '@/lib/supabase';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase-server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/auth/callback', '/register', '/api'];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/')
  );
  
  // Static assets
  if (pathname.match(/\.(?:ico|png|jpg|jpeg|svg|css|js|woff2?)$/)) {
    return NextResponse.next();
  }
  
  // Demo mode: skip auth checks but add demo header
  if (isDemoMode) {
    const response = NextResponse.next();
    response.headers.set('X-Demo-Mode', 'true');
    return response;
  }

  let response = NextResponse.next({ request });
  
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    // Validate JWT and get user with timeout protection
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase connection timeout')), 8000)
    );
    
    const { data: { user }, error: userError } = await Promise.race([
      userPromise,
      timeoutPromise
    ]) as any;
    
    const isLoggedIn = !!user && !userError;

    // Redirect unauthenticated users to login
    if (!isLoggedIn && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Skip further checks for public routes
    if (isPublicRoute) {
      return response;
    }

    // Get user profile for role-based checks with timeout
    const profilePromise = supabase
      .from('profiles')
      .select('role, stage')
      .eq('id', user!.id)
      .single();
      
    const { data: profile } = await Promise.race([
      profilePromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
    ]) as any;

    const userRole = profile?.role;
    const userStage = profile?.stage;

    // Teacher routes protection
    if (pathname.startsWith('/teacher')) {
      if (userRole !== 'teacher' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Student stage content protection
    // Redirect to stage selection if student has no stage assigned
    if (userRole === 'student' && !userStage && pathname !== '/stage/select') {
      return NextResponse.redirect(new URL('/stage/select', request.url));
    }

    // Prevent students from accessing other stages
    if (userRole === 'student' && userStage) {
      // Check if trying to access a different stage
      const stageMatch = pathname.match(/^\/(stage|lesson|quiz|scenario|results)\/([^\/]+)/);
      if (stageMatch) {
        const targetStage = stageMatch[2];
        const validStages = ['primary', 'middle', 'high'];
        
        if (validStages.includes(targetStage) && targetStage !== userStage) {
          // Redirect to their assigned stage
          return NextResponse.redirect(new URL(`/stage/${userStage}`, request.url));
        }
      }
    }

    // Redirect logged-in users from login page to appropriate dashboard
    if (pathname === '/login' && isLoggedIn) {
      if (userRole === 'teacher' || userRole === 'admin') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      }
      if (userRole === 'student' && userStage) {
        return NextResponse.redirect(new URL(`/stage/${userStage}`, request.url));
      }
      return NextResponse.redirect(new URL('/stage/select', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On connection error, allow public routes, redirect others to login
    if (!isPublicRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
