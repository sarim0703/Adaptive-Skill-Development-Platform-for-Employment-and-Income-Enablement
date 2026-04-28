"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser, checkUserState } from "@/app/actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Sparkles, X, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthSidePanel({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(false);
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
          setError("Invalid email or password.");
        } else {
          const destination = await checkUserState();
          router.push(destination);
        }
      } else {
        await registerUser(formData);
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error) {
          setError("Account created, but auto-login failed.");
          setIsLogin(true);
        } else {
          const destination = await checkUserState();
          router.push(destination);
        }
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col p-8 md:p-12 text-foreground">
      <div className="flex justify-between items-center mb-12">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-background border border-border relative">
          <Image src="/logo.png" alt="CareerOrbit Logo" fill className="object-cover" />
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-card flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1">
        <h2 className="text-4xl font-black text-foreground mb-2 tracking-tight">
          {isLogin ? t("auth.welcome") : t("auth.join")}
        </h2>
        <p className="text-text-secondary font-normal mb-10">
          {isLogin ? t("auth.sub") : t("auth.joinsub")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-text-tertiary">{t("auth.name")}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground outline-none focus:border-blue-500/50 focus:bg-foreground/5 transition-all font-normal"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-tertiary">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground outline-none focus:border-blue-500/50 focus:bg-foreground/5 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-tertiary">{t("auth.password")}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                name="password"
                type="password"
                required
                className="w-full bg-card border border-border rounded-xl py-3.5 pl-12 pr-4 text-foreground outline-none focus:border-blue-500/50 focus:bg-foreground/5 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-semibold rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (isLogin ? t("auth.signin") : t("auth.signupBtn"))}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            {isLogin ? t("auth.signup") : t("auth.haveAccount")}
          </button>
        </div>
      </div>

      <div className="text-center text-xs font-medium text-text-muted">
        CareerOrbit Security Layer © 2026
      </div>
    </div>
  );
}
