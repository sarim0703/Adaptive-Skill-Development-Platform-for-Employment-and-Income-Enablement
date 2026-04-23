import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedRoutes = ["/learn", "/onboarding", "/path-selection", "/profile", "/pre-test", "/analytics"];
  const apiProtectedRoutes = ["/api/chat", "/api/quiz", "/api/pre-test"];

  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isApiProtectedRoute = apiProtectedRoutes.some((route) => nextUrl.pathname.startsWith(route));

  if (isProtectedRoute || isApiProtectedRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/auth", nextUrl));
    }
  }

  if (nextUrl.pathname === "/auth" && isLoggedIn) {
    return Response.redirect(new URL("/learn", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
