import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Shield, Users, AlertCircle } from "lucide-react";
import logoMirante from "../assets/logo_mirante.png";
import { signInWithGoogle } from "../firebaseClient/auth";
import { toast } from "sonner";

const features = [
  {
    icon: Zap,
    title: "Prompts otimizados",
    description:
      "Biblioteca curada com os melhores prompts para cada contexto profissional.",
  },
  {
    icon: Shield,
    title: "Por setor",
    description:
      "Organizado por áreas: Jornalismo, Marketing, RH, Jurídico e muito mais.",
  },
  {
    icon: Users,
    title: "Para equipes",
    description:
      "Compartilhe conhecimento e eleve a produtividade de toda a empresa.",
  },
];

const aiLogos = [
  { name: "ChatGPT", color: "#10a37f", initial: "G" },
  { name: "Claude", color: "#d97706", initial: "C" },
  { name: "Gemini", color: "#4285f4", initial: "G" },
  { name: "Perplexity", color: "#7c3aed", initial: "P" },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [domainBlocked, setDomainBlocked] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setDomainBlocked(false);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code === "auth/unauthorized-domain") {
        setDomainBlocked(true);
      } else if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-[#0a0a0b] overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-violet-500/15 blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo Mirante */}
          <div className="flex items-center gap-3">
            <img
              src={logoMirante}
              alt="TV Mirante"
              className="h-8 w-auto object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <div className="w-px h-5 bg-white/20" />
            <span className="text-white/60 text-sm font-medium tracking-wide">
              Banco de Prompts
            </span>
          </div>

          {/* Main copy */}
          <div className="space-y-10">
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                  Prompts de IA
                  <br />
                  <span className="text-white/50">para toda a equipe.</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base text-white/40 max-w-sm leading-relaxed"
              >
                Uma plataforma centralizada de prompts inteligentes, organizada
                por setor e otimizada para elevar a produtividade da sua equipe.
              </motion.p>
            </div>

            {/* Feature list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{title}</p>
                    <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* AI badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-white/25 uppercase tracking-widest">
                Compatível com
              </span>
              <div className="flex gap-2">
                {aiLogos.map((ai) => (
                  <div
                    key={ai.name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{
                      backgroundColor: ai.color + "33",
                      border: `1px solid ${ai.color}40`,
                    }}
                    title={ai.name}
                  >
                    {ai.initial}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} TV Mirante · Todos os direitos
            reservados
          </p>
        </div>
      </div>

      {/* Right panel — Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Logo (mobile + desktop right panel) */}
          <div className="flex items-center gap-3">
            <img
              src={logoMirante}
              alt="TV Mirante"
              className="h-8 w-auto object-contain"
            />
            <div className="w-px h-5 bg-border" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              Banco de Prompts
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground">
              Faça login com sua conta Mirante para continuar.
            </p>
          </div>

          {/* Domain blocked warning */}
          <AnimatePresence>
            {domainBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Acesso não autorizado
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5 leading-relaxed">
                    Apenas contas{" "}
                    <span className="font-semibold">@mirante.com.br</span> têm
                    acesso a esta plataforma.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-11 px-5 rounded-xl border border-border bg-background hover:bg-surface transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed group shadow-premium"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Entrar com Google</span>
            {!loading && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform ml-auto" />
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Acesso restrito a colaboradores{" "}
            <span className="text-foreground font-medium">@mirante.com.br</span>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
