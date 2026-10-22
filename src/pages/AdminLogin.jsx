import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Label, Input } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function AdminLogin() {
  const { t } = useLang();
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await adminLogin(phone.trim(), password);
    if (!result.ok) return setError(result.error);
    navigate("/admin", { replace: true });
  };

  return (
    <AuthShell
      title={
        <span className="flex items-center justify-center gap-2">
          <ShieldCheck size={22} className="text-brand-red" /> {t("adminLogin.title")}
        </span>
      }
      subtitle={t("adminLogin.subtitle")}
      footer={
        <Link to="/login" className="font-semibold text-neutral-500 hover:underline">
          {t("adminLogin.residentLink")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="aphone" required>{t("adminLogin.phone")}</Label>
          <Input
            id="aphone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="apassword" required>{t("login.password")}</Label>
          <div className="relative">
            <Input
              id="apassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 dark:bg-brand-red dark:hover:bg-brand-red-dark"
        >
          {t("adminLogin.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
