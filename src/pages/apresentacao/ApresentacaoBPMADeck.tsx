import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SlideId =
  | "capa"
  | "apresente"
  | "atuacao-legal"
  | "historico"
  | "missao"
  | "grupamentos"
  | "area-df"
  | "encerramento";

type GrupamentoKey = "RPA" | "GOC" | "LACUSTRE" | "GTA" | "PREALG";

type Slide =
  | {
      id: SlideId;
      kind: "cover";
      title: string;
      subtitle: string;
    }
  | {
      id: SlideId;
      kind: "content";
      title: string;
      kicker?: string;
      paragraphs?: string[];
      bullets?: string[];
      note?: string;
      image?: { src: string; alt: string };
      layout?: "split" | "center";
    }
  | {
      id: SlideId;
      kind: "timeline";
      title: string;
      items: { year: string; title: string; text: string }[];
    }
  | {
      id: SlideId;
      kind: "grids";
      title: string;
      kicker?: string;
      cards: {
        key: GrupamentoKey;
        title: string;
        subtitle: string;
        bullets: string[];
        requirement?: string;
      }[];
      footer?: string;
    };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isFullscreen() {
  return !!document.fullscreenElement;
}

async function requestFs(el: HTMLElement) {
  if (el.requestFullscreen) await el.requestFullscreen();
}

async function exitFs() {
  if (document.exitFullscreen) await document.exitFullscreen();
}

function useKeyboardNav(opts: {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleFs: () => void;
  onGoStart: () => void;
  onGoEnd: () => void;
}) {
  useEffect(() => {
    if (!opts.enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (e.key === "Escape") opts.onClose();
      if (e.key === "ArrowLeft") opts.onPrev();
      if (e.key === "ArrowRight") opts.onNext();

      if (k === "f") opts.onToggleFs();
      if (k === "home") opts.onGoStart();
      if (k === "end") opts.onGoEnd();

      if (k === " " || k === "enter") {
        e.preventDefault();
        opts.onNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [opts]);
}

const motionPage = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, scale: 0.99, filter: "blur(6px)" },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function GlassCard(props: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
        props.className || "",
      ].join(" ")}
    >
      {props.children}
    </div>
  );
}

function LogoRow() {
  return (
    <div className="flex items-center gap-4">
      <img
        src="/presentatios/bpma-web/logo-pmdf.png"
        alt="Polícia Militar do Distrito Federal"
        className="h-10 w-auto opacity-90"
        draggable={false}
      />
      <div className="h-8 w-px bg-white/10" />
      <img
        src="/presentatios/bpma-web/logo-bpma.png"
        alt="Batalhão de Polícia Militar Ambiental"
        className="h-10 w-auto opacity-95"
        draggable={false}
      />
    </div>
  );
}

function ProgressDots(props: {
  total: number;
  active: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: props.total }).map((_, i) => {
        const active = i === props.active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => props.onPick(i)}
            className={[
              "h-2.5 rounded-full transition-all",
              active ? "w-7 bg-white/85" : "w-2.5 bg-white/25 hover:bg-white/40",
            ].join(" ")}
            aria-label={`Ir para o slide ${i + 1}`}
          />
        );
      })}
    </div>
  );
}

export default function ApresentacaoBPMADeck() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "capa",
        kind: "cover",
        title: "Batalhão de Polícia Militar Ambiental",
        subtitle:
          "Atuação, histórico, missão e grupamentos especializados no Distrito Federal",
      },
      {
        id: "apresente",
        kind: "content",
        title: "Apresentando o BPMA",
        kicker: "Unidade especializada da PMDF",
        paragraphs: [
          "O Batalhão de Polícia Militar Ambiental é responsável pela execução do policiamento ambiental, incluindo o policiamento florestal, de mananciais, fluvial e lacustre.",
          "Além do foco ambiental, o BPMA também atua na segurança pública de forma ampla, atendendo ocorrências relacionadas a crimes contra a vida e o patrimônio quando necessário.",
        ],
        bullets: [
          "Policiamento ostensivo florestal, lacustre, fluvial e de mananciais",
          "Proteção de fauna, flora e recursos hídricos",
          "Preservação de Unidades de Conservação",
          "Ações preventivas, repressivas e educativas",
        ],
        layout: "split",
        image: {
          src: "/presentatios/bpma-web/logo-bpma.png",
          alt: "Brasão do BPMA",
        },
      },
      {
        id: "atuacao-legal",
        kind: "content",
        title: "Área de atuação",
        kicker: "Base normativa e abrangência",
        paragraphs: [
          "Decreto Distrital nº 41.167, de 1º de setembro de 2020: o BPMA é o batalhão responsável pela execução do policiamento ambiental, incluindo o policiamento florestal, de mananciais, fluvial e lacustre.",
          "Portaria PMDF nº 1.138, de 02 de outubro de 2020: executa o policiamento ostensivo em todo o Distrito Federal e pode atuar em outras unidades da federação mediante convênio, com vistas à conservação da biodiversidade e garantia da qualidade de vida.",
        ],
        bullets: [
          "Abrangência: todo o Distrito Federal",
          "Ambientes: áreas naturais, rurais, urbanas, mananciais e espelhos d'água",
          "Possibilidade de atuação interestadual mediante convênio",
        ],
        layout: "center",
      },
      {
        id: "historico",
        kind: "timeline",
        title: "Histórico",
        items: [
          {
            year: "1988",
            title: "Criação",
            text:
              "Criado pelo Decreto nº 11.124 (10 de junho de 1988), com a denominação Companhia de Polícia Militar Florestal (CPFlo).",
          },
          {
            year: "1998",
            title: "Fortalecimento do arcabouço ambiental",
            text:
              "Com a Lei nº 9.605 (Lei de Crimes Ambientais), passou a ser denominada Companhia de Polícia Militar Ambiental.",
          },
          {
            year: "2003",
            title: "Reorganização",
            text:
              "Com o Decreto nº 23.955 (1º de agosto de 2003), a unidade passou a se chamar Companhia de Polícia Militar Ambiental (CPMA).",
          },
          {
            year: "2010",
            title: "BPMA",
            text:
              "Com o Decreto nº 31.793, a Companhia tornou-se o Batalhão de Polícia Militar Ambiental.",
          },
        ],
      },
      {
        id: "missao",
        kind: "content",
        title: "Missão",
        kicker: "Proteção ambiental e qualidade de vida",
        paragraphs: [
          "Executar atividades de policiamento ostensivo florestal, lacustre, fluvial e de mananciais em todo o Distrito Federal, com vistas à conservação da fauna, flora e recursos hídricos.",
          "Preservar Unidades de Conservação e fazer cumprir o ordenamento jurídico vigente, contribuindo para a manutenção do meio ambiente ecologicamente equilibrado e a sadia qualidade de vida.",
        ],
        bullets: [
          "Conservação da biodiversidade",
          "Proteção de recursos hídricos e mananciais",
          "Prevenção e repressão a infrações ambientais",
          "Educação ambiental e prevenção primária",
        ],
        layout: "split",
        image: {
          src: "/presentatios/bpma-web/logo-pmdf.png",
          alt: "Brasão da PMDF",
        },
      },
      {
        id: "grupamentos",
        kind: "grids",
        title: "Grupamentos do BPMA",
        kicker: "Especialização por tipo de missão e ambiente",
        cards: [
          {
            key: "RPA",
            title: "RPA Ambiental",
            subtitle: "Rádio Patrulhamento Ambiental",
            bullets: [
              "Resgate diário de animais silvestres em todo o DF",
              "Coíbe infrações ambientais contra fauna, flora e recursos hídricos",
              "Atuação ostensiva em Unidades de Conservação e fora delas",
            ],
            requirement: "Requisito: Curso de Policiamento Ambiental (CPA)",
          },
          {
            key: "GOC",
            title: "GOC",
            subtitle: "Grupamento de Operações no Cerrado",
            bullets: [
              "Policiamento preventivo e repressivo em toda área do DF",
              "Operações planejadas contra crimes ambientais de maior complexidade e risco",
              "Apoio a outras unidades e órgãos ambientais quando autorizado",
            ],
            requirement: "Requisitos: CPA e Curso de Operações no Cerrado (COCer)",
          },
          {
            key: "LACUSTRE",
            title: "Lacustre",
            subtitle: "Companhia de Operações Lacustres",
            bullets: [
              "Policiamento do espelho d'água do Lago Paranoá",
              "Atuação sobre recursos hídricos e áreas de margem",
              "Operações específicas em ambiente aquático",
            ],
            requirement: "Requisitos: CPA e Curso de Operações Lacustres",
          },
          {
            key: "GTA",
            title: "GTA",
            subtitle: "Grupo Tático Ambiental",
            bullets: [
              "Repressão e combate a crimes comuns e ambientais em áreas rurais e urbanas",
              "Atendimento de demandas do COPOM e apoio a outras unidades",
              "Emprego tático com técnicas, equipamentos e treinamentos diferenciados",
            ],
            requirement: "Regulamentado pela Portaria PMDF nº 802 (2012)",
          },
          {
            key: "PREALG",
            title: "PREALG",
            subtitle: "Programa de Educação Ambiental Lobo Guará",
            bullets: [
              "Educação ambiental no DF com foco em prevenção primária",
              "Frentes: Teatro Lobo Guará, Saber Cerrado e Guardiões Ambientais",
              "Promoção de consciência ambiental e redução de crimes ambientais",
            ],
            requirement: "Base normativa: Portaria PMDF nº 508 (2006)",
          },
        ],
        footer:
          "Os grupamentos se complementam para cobrir operações terrestres, lacustres, táticas e educativas em todo o Distrito Federal.",
      },
      {
        id: "area-df",
        kind: "content",
        title: "Área de atuação no Distrito Federal",
        kicker: "Subáreas de policiamento ambiental (SPA)",
        paragraphs: [
          "A atuação do BPMA cobre todo o território do Distrito Federal, com organização por subáreas de policiamento ambiental para melhor planejamento, resposta e presença operacional.",
          "Essa divisão facilita ações preventivas, repressivas e educativas, considerando características urbanas, rurais, unidades de conservação, mananciais e áreas lacustres.",
        ],
        image: {
          src: "/presentatios/bpma-web/mapa-spa-df.png",
          alt: "Mapa das subáreas de policiamento ambiental no DF",
        },
        note:
          "Dica de uso no projetor: tecla F ativa o fullscreen. Setas navegam. Espaço ou Enter avançam.",
        layout: "center",
      },
      {
        id: "encerramento",
        kind: "content",
        title: "Encerramento",
        kicker: "Mensagem do BPMA",
        paragraphs: [
          "O Meio Ambiente é o nosso maior patrimônio, protegê-lo é a nossa missão.",
        ],
        bullets: [
          "Presença",
          "Resposta",
          "Prevenção",
          "Proteção",
        ],
        layout: "center",
      },
    ],
    []
  );

  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fs, setFs] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const go = (n: number) => setIdx(clamp(n, 0, slides.length - 1));
  const prev = () => go(idx - 1);
  const next = () => go(idx + 1);

  const close = async () => {
    if (isFullscreen()) await exitFs();
    setOpen(false);
  };

  const toggleFullscreen = async () => {
    const el = overlayRef.current;
    if (!el) return;

    if (!isFullscreen()) await requestFs(el);
    else await exitFs();
  };

  useEffect(() => {
    const onFsChange = () => setFs(isFullscreen());
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useKeyboardNav({
    enabled: open,
    onPrev: prev,
    onNext: next,
    onClose: close,
    onToggleFs: toggleFullscreen,
    onGoStart: () => go(0),
    onGoEnd: () => go(slides.length - 1),
  });

  const slide = slides[idx];

  if (!open) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Apresentação BPMA
              </h1>
              <p className="text-sm text-muted-foreground">
                Clique para abrir a apresentação em tela cheia, com animações e transições.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIdx(0);
                setOpen(true);
              }}
              className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Abrir
            </button>
          </div>

          <div className="mt-8">
            <GlassCard className="p-6">
              <div className="flex flex-col gap-4">
                <LogoRow />
                <div className="text-sm text-muted-foreground">
                  Navegação: setas, Espaço, Enter. Fullscreen: tecla F.
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-black text-white"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Clique fora de botões avança
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) return;
        next();
      }}
    >
      {/* Fundo cinematic para projetor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.10),rgba(0,0,0,1)_60%)]" />
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <LogoRow />
          <div className="hidden md:block h-8 w-px bg-white/10" />
          <div className="hidden md:block">
            <div className="text-sm font-semibold leading-4">
              {slide.title}
            </div>
            <div className="text-xs text-white/60">
              Slide {idx + 1} de {slides.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
            disabled={idx === 0}
            style={{ opacity: idx === 0 ? 0.4 : 1 }}
          >
            Anterior
          </button>

          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
            disabled={idx === slides.length - 1}
            style={{ opacity: idx === slides.length - 1 ? 0.4 : 1 }}
          >
            Próximo
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
            title="Tecla F"
          >
            {fs ? "Sair do fullscreen" : "Fullscreen (F)"}
          </button>

          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
            title="Esc"
          >
            Fechar (Esc)
          </button>
        </div>
      </div>

      {/* Conteúdo do slide */}
      <div className="relative z-10 flex h-[calc(100vh-74px)] items-center justify-center px-4 pb-6 sm:px-6">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={motionPage.initial}
              animate={motionPage.animate}
              exit={motionPage.exit}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.kind === "cover" && (
                <GlassCard className="p-8 sm:p-12">
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-6"
                  >
                    <motion.div variants={item} className="flex items-center justify-between gap-6">
                      <LogoRow />
                      <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
                        <span>Setas</span>
                        <span className="opacity-40">|</span>
                        <span>Espaço</span>
                        <span className="opacity-40">|</span>
                        <span>F</span>
                        <span className="opacity-40">|</span>
                        <span>Esc</span>
                      </div>
                    </motion.div>

                    <motion.h1
                      variants={item}
                      className="text-3xl sm:text-5xl font-semibold tracking-tight"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      variants={item}
                      className="text-base sm:text-lg text-white/75 max-w-3xl"
                    >
                      {slide.subtitle}
                    </motion.p>

                    <motion.div variants={item} className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        Apresente o BPMA
                      </span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        Histórico
                      </span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        Missão
                      </span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        Grupamentos
                      </span>
                      <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        Área de atuação no DF
                      </span>
                    </motion.div>

                    <motion.div variants={item} className="pt-4">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-black">
                        <span>Clique ou pressione Espaço para avançar</span>
                        <span aria-hidden>▶</span>
                      </div>
                    </motion.div>
                  </motion.div>
                </GlassCard>
              )}

              {slide.kind === "content" && (
                <GlassCard className="p-6 sm:p-10">
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className={[
                      "grid gap-6 items-start",
                      slide.layout === "split"
                        ? "grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]"
                        : "grid-cols-1",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4">
                      <motion.div variants={item}>
                        {slide.kicker && (
                          <div className="text-xs uppercase tracking-wide text-white/60">
                            {slide.kicker}
                          </div>
                        )}
                        <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight">
                          {slide.title}
                        </h2>
                      </motion.div>

                      {slide.paragraphs?.length ? (
                        <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">
                          {slide.paragraphs.map((p, i) => (
                            <motion.p
                              key={i}
                              variants={item}
                              className="text-sm sm:text-base text-white/80 leading-relaxed"
                            >
                              {p}
                            </motion.p>
                          ))}
                        </motion.div>
                      ) : null}

                      {slide.bullets?.length ? (
                        <motion.ul
                          variants={stagger}
                          initial="hidden"
                          animate="show"
                          className="mt-2 grid gap-2"
                        >
                          {slide.bullets.map((b, i) => (
                            <motion.li
                              key={i}
                              variants={item}
                              className="flex gap-3 text-sm sm:text-base text-white/85"
                            >
                              <span className="mt-2 h-2 w-2 rounded-full bg-white/70 shrink-0" />
                              <span>{b}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      ) : null}

                      {slide.note ? (
                        <motion.div variants={item} className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs text-white/70">{slide.note}</div>
                        </motion.div>
                      ) : null}
                    </div>

                    {slide.layout === "split" && (
                      <div className="flex flex-col gap-4">
                        {slide.image && (
                          <motion.div variants={item} className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4">
                            <img
                              src={slide.image.src}
                              alt={slide.image.alt}
                              className="w-full h-auto object-contain max-h-[52vh]"
                              draggable={false}
                            />
                          </motion.div>
                        )}
                      </div>
                    )}

                    {slide.layout === "center" && slide.image ? (
                      <motion.div variants={item} className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-3">
                        <img
                          src={slide.image.src}
                          alt={slide.image.alt}
                          className="w-full h-auto object-contain max-h-[52vh]"
                          draggable={false}
                        />
                      </motion.div>
                    ) : null}
                  </motion.div>
                </GlassCard>
              )}

              {slide.kind === "timeline" && (
                <GlassCard className="p-6 sm:p-10">
                  <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
                    <motion.div variants={item}>
                      <div className="text-xs uppercase tracking-wide text-white/60">
                        Evolução institucional
                      </div>
                      <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight">
                        {slide.title}
                      </h2>
                    </motion.div>

                    <motion.div
                      variants={stagger}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {slide.items.map((it, i) => (
                        <motion.div
                          key={i}
                          variants={item}
                          className="rounded-3xl border border-white/10 bg-white/5 p-5"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="text-2xl font-semibold">{it.year}</div>
                            <div className="text-xs text-white/60">{it.title}</div>
                          </div>
                          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                            {it.text}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div variants={item} className="text-xs text-white/60">
                      Dica: use Home e End para ir ao início e ao final.
                    </motion.div>
                  </motion.div>
                </GlassCard>
              )}

              {slide.kind === "grids" && (
                <GlassCard className="p-6 sm:p-10">
                  <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
                    <motion.div variants={item}>
                      {slide.kicker && (
                        <div className="text-xs uppercase tracking-wide text-white/60">
                          {slide.kicker}
                        </div>
                      )}
                      <h2 className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight">
                        {slide.title}
                      </h2>
                    </motion.div>

                    <motion.div
                      variants={stagger}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {slide.cards.map((c) => (
                        <motion.div
                          key={c.key}
                          variants={item}
                          className="rounded-3xl border border-white/10 bg-white/5 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-lg font-semibold">{c.title}</div>
                              <div className="text-xs text-white/60">{c.subtitle}</div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                              {c.key}
                            </div>
                          </div>

                          <ul className="mt-4 grid gap-2">
                            {c.bullets.map((b, i) => (
                              <li key={i} className="flex gap-3 text-sm text-white/85">
                                <span className="mt-2 h-2 w-2 rounded-full bg-white/70 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>

                          {c.requirement ? (
                            <div className="mt-4 text-xs text-white/60">
                              {c.requirement}
                            </div>
                          ) : null}
                        </motion.div>
                      ))}
                    </motion.div>

                    {slide.footer ? (
                      <motion.div variants={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm text-white/75">{slide.footer}</div>
                      </motion.div>
                    ) : null}
                  </motion.div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Barra de progresso */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <ProgressDots total={slides.length} active={idx} onPick={go} />
            <div className="text-xs text-white/60">
              {idx + 1}/{slides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
