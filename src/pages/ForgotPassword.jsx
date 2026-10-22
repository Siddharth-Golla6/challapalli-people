import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Label, Input } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

// Three steps, one piece of state each carries forward to the next:
// "phone" -> resetId + questionId -> "answer" -> resetToken -> "reset" -> "done"
export default function ForgotPassword() {
  const { t } = useLang();
  const { startForgotPassword, verifySecurityAnswer, resetPasswordWithToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("phone"); // phone | answer | reset | done
  const [phone, setPhone] = useState("");
  const [resetId, setResetId] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await startForgotPassword(phone.trim());
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setResetId(result.resetId);
    setQuestionId(result.questionId);
    setStep("answer");
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await verifySecurityAnswer(resetId, answer.trim());
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setResetToken(result.resetToken);
    setStep("reset");
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError(t("register.passwordShort"));
    if (password !== confirmPassword) return setError(t("forgotPw.passwordMismatch"));
    setBusy(true);
    const result = await resetPasswordWithToken(resetId, resetToken, password);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setStep("done");
  };

  const subtitle =
    step === "phone"
      ? t("forgotPw.subtitleStart")
      : step === "answer"
      ? t("forgotPw.subtitleAnswer")
      : step === "reset"
      ? t("forgotPw.subtitleReset")
      : undefined;

  return (
    <AuthShell
      title={t("forgotPw.title")}
      subtitle={subtitle}
      footer={
        step !== "done" && (
          <Link to="/login" className="font-semibold text-neutral-500 hover:underline">
            {t("forgotPw.backToLogin")}
          </Link>
        )
      }
    >
      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fpPhone" required>{t("login.phone")}</Label>
            <Input
              id="fpPhone"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {t("forgotPw.continue")}
          </button>
        </form>
      )}

      {step === "answer" && (
        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fpAnswer" required>{t(`secq.${questionId}`)}</Label>
            <Input
              id="fpAnswer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {t("forgotPw.verify")}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fpPassword" required>{t("forgotPw.newPassword")}</Label>
            <div className="relative">
              <Input
                id="fpPassword"
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
          <div>
            <Label htmlFor="fpConfirmPassword" required>{t("forgotPw.confirmPassword")}</Label>
            <Input
              id="fpConfirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {t("forgotPw.resetSubmit")}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{t("forgotPw.success")}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-5 w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark"
          >
            {t("forgotPw.goToLogin")}
          </button>
        </div>
      )}
    </AuthShell>
  );
}
