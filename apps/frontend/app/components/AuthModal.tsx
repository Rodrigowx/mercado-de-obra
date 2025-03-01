"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import { useMutation } from "@apollo/client";
import { AuthContext } from "./AuthContext";
import {
  LOGIN_USER,
  REGISTER_USER,
  REQUEST_PASSWORD_RESET,
  VALIDATE_RESET_CODE,
  RESET_PASSWORD,
} from "../graphql/mutations";

interface AuthModalProps {
  mode: "login" | "signup" | "forgotpassword";
  onClose: () => void;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valida apenas DDD + número (11 dígitos)
function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phoneNumber);
}

const AuthModal: React.FC<AuthModalProps> = ({ mode: initialMode, onClose }) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgotpassword">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<"CLIENT" | "PROFESSIONAL">("CLIENT");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([
    "Mínimo de 8 caracteres",
    "Uma letra maiúscula",
    "Uma letra minúscula",
    "Um número",
    "Um caractere especial",
  ]);
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);
  const [requestPasswordReset] = useMutation(REQUEST_PASSWORD_RESET);
  const [validateResetCode] = useMutation(VALIDATE_RESET_CODE);
  const [resetPasswordMutation] = useMutation(RESET_PASSWORD);
  
  const { login } = useContext(AuthContext);
  
  // Estados para o fluxo de redefinição de senha
  const [step, setStep] = useState<"sendEmail" | "validateCode" | "resetPassword">("sendEmail");
  const [codeInputs, setCodeInputs] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [resendTimeout, setResendTimeout] = useState(30);
  const [codeError, setCodeError] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  
  // Estado para controlar o loading
  const [loading, setLoading] = useState(false);
  
  // Referências para os inputs do código
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    // Resetar estados ao mudar de modo
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setRole("CLIENT");
    setShowPasswordErrors(false);
    setPasswordErrors([
      "Mínimo de 8 caracteres",
      "Uma letra maiúscula",
      "Uma letra minúscula",
      "Um número",
      "Um caractere especial",
    ]);
    setEmailError("");
    setPhoneError("");
    setStep("sendEmail");
    setCodeInputs(["", "", "", "", "", ""]);
    setNewPassword("");
    setCodeError("");
    setResetPasswordError("");
    setResendTimeout(30);
  }, [mode]);
  
  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setTimeout(() => setResendTimeout(resendTimeout - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimeout]);
  
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === "signup") {
      setShowPasswordErrors(true);
      const errors = [
        "Mínimo de 8 caracteres",
        "Uma letra maiúscula",
        "Uma letra minúscula",
        "Um número",
        "Um caractere especial",
      ];
      if (value.length >= 8) errors.splice(errors.indexOf("Mínimo de 8 caracteres"), 1);
      if (/[A-Z]/.test(value)) errors.splice(errors.indexOf("Uma letra maiúscula"), 1);
      if (/[a-z]/.test(value)) errors.splice(errors.indexOf("Uma letra minúscula"), 1);
      if (/[0-9]/.test(value)) errors.splice(errors.indexOf("Um número"), 1);
      if (/[@$!%*?&#]/.test(value)) errors.splice(errors.indexOf("Um caractere especial"), 1);
      setPasswordErrors(errors);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");
    setCodeError("");
    setResetPasswordError("");
    setLoading(true);
  
    if (
      (mode === "signup" ||
        mode === "login" ||
        (mode === "forgotpassword" && step === "sendEmail")) &&
      !validateEmail(email)
    ) {
      setEmailError("Email inválido. Verifique o formato.");
      setLoading(false);
      return;
    }
  
    // Cadastro com login automático
    if (mode === "signup") {
      if (!validatePhoneNumber(phone)) {
        setPhoneError("Número inválido. Digite DDD + número. Ex: 11998765432");
        setLoading(false);
        return;
      }
  
      if (passwordErrors.length > 0) {
        setLoading(false);
        return;
      }
  
      const formattedPhone = `+55${phone}`;
  
      try {
        const { data } = await registerMutation({
          variables: {
            registerUserDto: {
              name,
              email,
              password,
              phoneNumber: formattedPhone,
              role,
            },
          },
        });
  
        console.log("Usuário criado:", data.register.name);
  
        // Realiza login automático após cadastro
        const loginData = await loginMutation({
          variables: { email, password, role },
        });
        console.log("Token recebido:", loginData.data.login.accessToken);
        login(loginData.data.login.accessToken);
  
        onClose();
      } catch (error: any) {
        console.error("Erro ao enviar dados:", error);
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const validationMessage = error.graphQLErrors[0].message;
          if (validationMessage.includes("Número de telefone inválido")) {
            setPhoneError("Número de telefone inválido. Ex: 11998765432");
          }
          if (
            validationMessage.includes(
              "Já existe um usuário com este email e este tipo de conta (role)"
            )
          ) {
            setEmailError("Já existe um usuário cadastrado com este email para este tipo de conta.");
          }
        }
      }
      setLoading(false);
      return;
    }
  
    if (mode === "login") {
      try {
        const { data } = await loginMutation({ variables: { email, password, role } });
        console.log("Token recebido:", data.login.accessToken);
        login(data.login.accessToken);
        onClose();
      } catch (error: any) {
        console.error("Erro ao enviar dados:", error);
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const msg = error.graphQLErrors[0].message;
          if (msg.includes("Credenciais inválidas")) {
            setEmailError("Credenciais inválidas. Verifique email, senha e tipo de conta.");
          }
        }
      }
      setLoading(false);
      return;
    }
  
    if (mode === "forgotpassword" && step === "sendEmail") {
      try {
        await requestPasswordReset({ variables: { email, role } });
        console.log("Email de redefinição enviado");
        setStep("validateCode");
        setResendTimeout(30);
      } catch (error: any) {
        console.error("Erro ao solicitar redefinição de senha:", error);
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const msg = error.graphQLErrors[0].message;
          if (msg.includes("Usuário não encontrado")) {
            setEmailError("Usuário não encontrado para este tipo de conta.");
          }
        }
      }
      setLoading(false);
    }
  };
  
  const handleValidateCode = async () => {
    const fullCode = codeInputs.join("");
    if (fullCode.length !== 6) {
      setCodeError("Preencha todos os campos do código.");
      return;
    }
  
    setLoading(true);
    try {
      await validateResetCode({ variables: { email, role, code: fullCode } });
      setStep("resetPassword");
    } catch (error: any) {
      console.error("Erro ao validar o código:", error);
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const errorMessage =
          error.graphQLErrors[0].message || "Erro desconhecido.";
        setCodeError(errorMessage);
      } else {
        setCodeError("Código inválido ou expirado.");
      }
    }
    setLoading(false);
  };
  
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setResetPasswordError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
  
    setLoading(true);
    try {
      await resetPasswordMutation({ variables: { email, role, newPassword } });
      alert("Senha redefinida com sucesso!");
      setMode("login");
      setStep("sendEmail");
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      setRole("CLIENT");
      setShowPasswordErrors(false);
      setPasswordErrors([
        "Mínimo de 8 caracteres",
        "Uma letra maiúscula",
        "Uma letra minúscula",
        "Um número",
        "Um caractere especial",
      ]);
      setEmailError("");
      setPhoneError("");
      setCodeError("");
      setResetPasswordError("");
      setCodeInputs(["", "", "", "", "", ""]);
      setNewPassword("");
      setResendTimeout(30);
    } catch (error: any) {
      console.error("Erro ao redefinir a senha:", error);
      setResetPasswordError("Erro ao redefinir a senha.");
    }
    setLoading(false);
  };
  
  const handleResendCode = async () => {
    if (resendTimeout > 0) return;
  
    setLoading(true);
    try {
      await requestPasswordReset({ variables: { email, role } });
      console.log("Código de redefinição reenviado");
      setResendTimeout(30);
    } catch (error: any) {
      console.error("Erro ao reenviar código de redefinição:", error);
      setEmailError("Erro ao reenviar o código. Tente novamente.");
    }
    setLoading(false);
  };
  
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1 || isNaN(Number(value))) return;
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);
  
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative overflow-auto max-h-screen">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
          <b>X</b>
        </button>
  
        {mode !== "forgotpassword" ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-primary">
              {mode === "login" ? "Login" : "Cadastrar"}
            </h2>
  
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-primary rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Telefone (DDD + Número)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneError("");
                      }}
                      className="w-full border border-primary rounded-lg p-2"
                      required
                      placeholder="Ex: 11998765432"
                    />
                    {phoneError && <span className="text-red-500 text-sm">{phoneError}</span>}
                  </div>
                </>
              )}
  
              {(mode === "login" || mode === "signup") && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    className="w-full border border-primary rounded-lg p-2"
                    required
                  />
                  {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
                </div>
              )}
  
              {(mode === "signup" || mode === "login") && (
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Senha
                  </label>
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="w-full border border-primary rounded-lg p-2 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
                      tabIndex={-1}
                    >
                      {showPassword ? <FaEyeSlash className="text-primary" /> : <FaEye />}
                    </button>
                  </div>
                  {mode === "signup" && showPasswordErrors && passwordErrors.length > 0 && (
                    <ul className="text-sm mt-2">
                      {passwordErrors.map((error, index) => (
                        <li
                          key={index}
                          className={passwordErrors.includes(error) ? "text-red-500" : "text-green-500"}
                        >
                          - {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
  
              <div className="flex flex-col items-center mt-6">
                <span className="text-sm mb-2">Escolha o tipo de conta:</span>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${role === "CLIENT" ? "text-primary" : "text-gray-500"}`}>
                    Cliente
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={role === "PROFESSIONAL"}
                      onChange={() => setRole(role === "CLIENT" ? "PROFESSIONAL" : "CLIENT")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition duration-300 before:absolute before:top-1 before:left-1 before:bg-white before:rounded-full before:h-4 before:w-4 before:transition-transform peer-checked:before:translate-x-5"></div>
                  </label>
                  <span className={`text-sm ${role === "PROFESSIONAL" ? "text-primary" : "text-gray-500"}`}>
                    Profissional
                  </span>
                </div>
              </div>
  
              <button
                type="submit"
                className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary-dark"
              >
                {mode === "login" ? "Entrar" : "Cadastrar"}
              </button>
            </form>
          </>
        ) : (
          <>
            {step === "sendEmail" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                  Redefinir Senha
                </h2>
                <p className="text-sm mb-4 text-center">
                  Insira o email cadastrado para receber o código de redefinição.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="Insira seu email"
                  className="w-full border border-primary rounded-lg p-2 mb-2"
                  required
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
  
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-sm ${role === "CLIENT" ? "text-primary" : "text-gray-500"}`}>
                    Cliente
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={role === "PROFESSIONAL"}
                      onChange={() => setRole(role === "CLIENT" ? "PROFESSIONAL" : "CLIENT")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition duration-300 before:absolute before:top-1 before:left-1 before:bg-white before:rounded-full before:h-4 before:w-4 before:transition-transform peer-checked:before:translate-x-5"></div>
                  </label>
                  <span className={`text-sm ${role === "PROFESSIONAL" ? "text-primary" : "text-gray-500"}`}>
                    Profissional
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary-dark"
                >
                  Enviar Código
                </button>
              </form>
            )}
  
            {step === "validateCode" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                  Código de Verificação
                </h2>
                <p className="text-sm mb-4 text-center">
                  Insira o código de 6 dígitos enviado para o seu email.
                </p>
                <div className="flex justify-center space-x-2">
                  {codeInputs.map((value, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      value={value}
                      maxLength={1}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      ref={(el) => {
                        codeInputRefs.current[index] = el;
                      }}
                      className="w-12 h-12 text-center text-lg border border-primary rounded-lg"
                    />
                  ))}
                </div>
                {codeError && <p className="text-red-500 text-sm mt-2">{codeError}</p>}
                <button
                  onClick={handleValidateCode}
                  className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary-dark mt-4"
                >
                  Validar Código
                </button>
                <button
                  onClick={handleResendCode}
                  disabled={resendTimeout > 0}
                  className={`w-full mt-2 ${
                    resendTimeout > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-primary"
                  } text-white rounded-lg py-2 font-medium hover:bg-primary-dark`}
                >
                  {resendTimeout > 0 ? `Reenviar Código (${resendTimeout}s)` : "Reenviar Código"}
                </button>
              </div>
            )}
  
            {step === "resetPassword" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary">
                  Nova Senha
                </h2>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setResetPasswordError("");
                  }}
                  placeholder="Digite a nova senha"
                  className="w-full border border-primary rounded-lg p-2 mb-2"
                  required
                />
                {resetPasswordError && (
                  <p className="text-red-500 text-sm">{resetPasswordError}</p>
                )}
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary-dark"
                >
                  Redefinir Senha
                </button>
              </div>
            )}
          </>
        )}
  
        <div className="mt-4 text-center">
          {mode === "login" && (
            <>
              <p className="text-sm">
                Não tem conta?{" "}
                <span onClick={() => setMode("signup")} className="text-primary cursor-pointer hover:underline">
                  Cadastre-se
                </span>
              </p>
              <p className="text-sm mt-2">
                Esqueceu a senha?{" "}
                <span onClick={() => setMode("forgotpassword")} className="text-primary cursor-pointer hover:underline">
                  Redefinir
                </span>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p className="text-sm">
              Já tem conta?{" "}
              <span onClick={() => setMode("login")} className="text-primary cursor-pointer hover:underline">
                Entrar
              </span>
            </p>
          )}
          {mode === "forgotpassword" && (
            <p className="text-sm mt-2">
              Lembrou a senha?{" "}
              <span onClick={() => setMode("login")} className="text-primary cursor-pointer hover:underline">
                Entrar
              </span>
            </p>
          )}
        </div>
  
        {(mode === "login" || mode === "signup") && (
          <div className="mt-6 flex items-center justify-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-primary hover:text-white"
            >
              <FaGoogle /> <span>Google</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-primary hover:text-white"
            >
              <FaFacebook /> <span>Facebook</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
