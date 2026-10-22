import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageSquareText } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Label, Input } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

// OTP delivery isn't configured yet (MSG91 is still in mock mode) — hide the
// OTP login tab until that's set up. Flip this back on when it's ready; the
// OTP form/logic below is untouched.
const OTP_LOGIN_ENABLED = false;

export default function Login() {
  const { t } = useLang();
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [mode, setMode] = useState("password"); // "password" | "otp"

  // Password mode
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  // OTP mode
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMsg, setOtpMsg] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(phone.trim(), password, rememberMe);
    if (!result.ok) return setError(result.error);
    navigate(from, { replace: true });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpMsg("");
    setOtpSending(true);
    const result = await sendOtp(otpPhone.trim(), "login");
    setOtpSending(false);
    if (!result.ok) return setOtpError(result.error);
    setOtpSent(true);
    setOtpMsg(result.message);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpVerifying(true);
    const result = await verifyOtp(otpPhone.trim(), otpCode.trim(), "login", rememberMe);
    setOtpVerifying(false);
    if (!result.ok) return setOtpError(result.error);
    navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      footer={
        <>
          <span className="text-neutral-500">{t("login.newHere")} </span>
          <Link to="/register" className="font-semibold text-brand-red hover:underline">
            {t("login.createAccount")}
          </Link>
          <span className="mx-2 text-neutral-300">•</span>
          <Link to="/admin-login" className="font-semibold text-neutral-500 hover:underline">
            {t("login.adminLoginLink")}
          </Link>
        </>
      }
    >
      {OTP_LOGIN_ENABLED && (
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-md py-2 text-sm font-semibold transition ${
              mode === "password" ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white" : "text-neutral-500"
            }`}
          >
            {t("login.tab.password")}
          </button>
          <button
            type="button"
            onClick={() => setMode("otp")}
            className={`rounded-md py-2 text-sm font-semibold transition ${
              mode === "otp" ? "bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white" : "text-neutral-500"
            }`}
          >
            {t("login.tab.otp")}
          </button>
        </div>
      )}

      {!OTP_LOGIN_ENABLED || mode === "password" ? (
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <Label htmlFor="phone" required>{t("login.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              data-testid="login-phone-input"
            />
          </div>

          <div>
            <Label htmlFor="password" required>{t("login.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
                data-testid="login-password-input"
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-brand-red focus:ring-brand-red"
              />
              {t("login.rememberMe")}
            </label>
            <Link to="/forgot-password" className="font-semibold text-brand-red hover:underline">
              {t("login.forgot")}
            </Link>
          </div>

          {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark"
          >
            {t("login.submit")}
          </button>
        </form>
      ) : (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4" data-testid="otp-login-form">
          <div>
            <Label htmlFor="otpPhone" required>{t("login.phone")}</Label>
            <Input
              id="otpPhone"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={otpPhone}
              onChange={(e) => {
                setOtpPhone(e.target.value);
                setOtpSent(false);
                setOtpMsg("");
              }}
              required
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div>
              <Label htmlFor="otpCode" required>{t("login.otpCode")}</Label>
              <Input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending}
                className="mt-2 text-xs font-semibold text-brand-red hover:underline disabled:opacity-50"
              >
                {otpSending ? t("login.resending") : t("login.resend")}
              </button>
            </div>
          )}

          {otpError && <p className="text-sm font-medium text-brand-red" role="alert">{otpError}</p>}
          {otpMsg && <p className="text-sm font-medium text-emerald-600">{otpMsg}</p>}

          <button
            type="submit"
            disabled={otpSending || otpVerifying}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            <MessageSquareText size={16} />
            {otpSent ? (otpVerifying ? t("login.verifying") : t("login.verifyAndLogin")) : otpSending ? t("login.sending") : t("login.sendCode")}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
