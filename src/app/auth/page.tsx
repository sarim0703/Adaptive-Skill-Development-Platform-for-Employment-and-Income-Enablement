"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser, checkUserState } from "../actions";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AuthPage() {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError("Invalid email or password. Please try again.");
        } else {
          // Route returning users to the correct page
          const destination = await checkUserState();
          router.push(destination);
        }
      } else {
        await registerUser(formData);
        // Automatically sign in the user right after registration
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError("Account created, but auto-login failed. Please sign in manually.");
          setIsLogin(true);
        } else {
          const destination = await checkUserState();
          router.push(destination);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // NextAuth v5 often throws confusing internal errors (like "An unexpected response was received from the server") when credentials fail.
        if (err.message.includes("Unexpected") || err.message.includes("Credentials") || err.message.includes("Configuration")) {
          setError("Invalid email or password. Please try again.");
        } else {
          // Fallback for network issues or actual crashes
          setError("Invalid email or password. Please try again."); 
        }
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
      {/* Top Switcher */}
      <div className="fixed top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isLogin ? t("auth.welcome") : t("auth.join")}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isLogin
              ? t("auth.sub")
              : t("auth.joinsub")}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("auth.name")}
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Your full name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("auth.email")}
              </label>
              <input
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("auth.password")}
              </label>
              <input
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('successfully')
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? t("auth.signin") : t("auth.signupBtn")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              {isLogin
                ? t("auth.signup")
                : t("auth.haveAccount")}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {t("footer.text2")}
        </p>
      </div>
    </div>
  );
}
