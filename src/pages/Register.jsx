import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Label, Input, Select } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { WARDS } from "../data/geography";
import { SECURITY_QUESTION_OPTIONS } from "../data/mockData";

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [wardId, setWardId] = useState("");
  const [securityQuestionId, setSecurityQuestionId] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(t("register.passwordShort"));
      return;
    }
    const result = await register({
      name: name.trim(),
      phone: phone.trim(),
      password,
      wardId: wardId || null,
      securityQuestionId,
      securityAnswer: securityAnswer.trim(),
    });
    if (!result.ok) return setError(result.error);
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthShell
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <>
          <span className="text-neutral-500">{t("register.haveAccount")} </span>
          <Link to="/login" className="font-semibold text-brand-red hover:underline">
            {t("register.loginLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" required>{t("register.fullName")}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="rphone" required>{t("login.phone")}</Label>
          <Input
            id="rphone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="ward">{t("register.wardOptional")}</Label>
          <Select id="ward" value={wardId} onChange={(e) => setWardId(e.target.value)}>
            <option value="">{t("register.selectWard")}</option>
            {WARDS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="rpassword" required>{t("login.password")}</Label>
          <div className="relative">
            <Input
              id="rpassword"
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
          <Label htmlFor="securityQuestion" required>{t("register.securityQuestion")}</Label>
          <Select
            id="securityQuestion"
            value={securityQuestionId}
            onChange={(e) => setSecurityQuestionId(e.target.value)}
            required
          >
            <option value="">{t("register.selectSecurityQuestion")}</option>
            {SECURITY_QUESTION_OPTIONS.map((id) => (
              <option key={id} value={id}>{t(`secq.${id}`)}</option>
            ))}
          </Select>
        </div>

        {securityQuestionId && (
          <div>
            <Label htmlFor="securityAnswer" required>{t("register.securityAnswer")}</Label>
            <Input
              id="securityAnswer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t("register.securityNote")}</p>
          </div>
        )}

        {error && <p className="text-sm font-medium text-brand-red" role="alert">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-red py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-red-dark"
        >
          {t("register.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
