"use client";

import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative flex min-h-screen items-center justify-center px-6 py-20">
        <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 backdrop-blur-xl"
          >
            <Sparkles size={15} className="text-violet-400" />
            <span>Secure Financial Infrastructure</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl"
          >
            Financial operations,
            <br />
            <span className="gradient-text">
              built with confidence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg"
          >
            VaultPay gives Nexus Corporate Services a secure
            workspace to manage invoices, monitor revenue and
            process client payments with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button className="group flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-medium text-white shadow-primary transition hover:bg-violet-500">
              Enter VaultPay
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-medium text-slate-200 transition hover:bg-white/[0.07]">
              <LockKeyhole size={17} />
              Security First
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid gap-4 sm:grid-cols-3"
          >
            <Feature
              icon={<ShieldCheck size={20} />}
              title="Role-based security"
              text="Admin and client access remain strictly separated."
            />

            <Feature
              icon={<LockKeyhole size={20} />}
              title="Protected payments"
              text="Payment actions are designed around safe transaction states."
            />

            <Feature
              icon={<Sparkles size={20} />}
              title="Modern workflow"
              text="Invoices, payments and documents in one workspace."
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="glass interactive rounded-2xl p-5 text-left shadow-glow">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <h3 className="font-medium text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}