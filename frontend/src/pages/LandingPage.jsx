import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import {
  ArrowRight,
  MessageSquare,
  Mail,
  Sparkles,
  FileText,
  CheckCircle,
  Zap,
  Clock,
  Users,
  Target,
  LayoutDashboard,
  Send,
} from "lucide-react";
import { Button } from "../components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-main/80 backdrop-blur-sm border-b-2 border-neo-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neo-lime border-2 border-neo-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-xl">BrieflyAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="font-semibold hover:bg-neo-black/5"
                onClick={() => navigate("/auth")}
                data-testid="nav-login-btn"
              >
                Log in
              </Button>
              <Button
                className="neo-button-primary px-6 py-2"
                onClick={() => navigate("/auth")}
                data-testid="nav-get-started-btn"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="neo-badge bg-neo-cyan">
                <Zap className="w-4 h-4 mr-2" /> AI-Powered Brief Generation
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tighter mb-6"
            >
              Turn messy messages into{" "}
              <span className="bg-neo-lime px-2 border-2 border-neo-black inline-block transform -rotate-1">
                clear creative briefs
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-neo-black/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              BrieflyAI reads your Slack and Gmail conversations, extracts what
              matters, and creates structured briefs your team can act on instantly.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                className="neo-button-accent px-8 py-6 text-lg"
                onClick={() => navigate("/auth")}
                data-testid="hero-get-started-btn"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="neo-button-secondary px-8 py-6 text-lg"
                onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
                data-testid="hero-how-it-works-btn"
              >
                See How It Works
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="neo-card neo-card-hover bg-white p-4 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-neo-black"></div>
                <div className="w-3 h-3 rounded-full bg-neo-yellow border border-neo-black"></div>
                <div className="w-3 h-3 rounded-full bg-neo-lime border border-neo-black"></div>
                <span className="ml-4 text-sm text-neo-black/50 font-mono">BrieflyAI Dashboard</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neo-muted border-2 border-neo-black rounded-lg p-4">
                  <MessageSquare className="w-6 h-6 mb-2 text-neo-cyan" strokeWidth={2.5} />
                  <p className="font-mono text-xs text-neo-black/70">#marketing-campaign</p>
                  <p className="text-sm mt-2">"Hey team, need assets for Q1 launch by Friday..."</p>
                </div>
                <div className="bg-neo-lime/20 border-2 border-neo-black rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-2" strokeWidth={2.5} />
                    <p className="font-heading font-bold text-sm">AI Processing</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-neo-black rounded-lg p-4">
                  <FileText className="w-6 h-6 mb-2 text-neo-pink" strokeWidth={2.5} />
                  <p className="font-heading font-bold text-sm">Q1 Launch Brief</p>
                  <p className="text-xs text-neo-black/70 mt-1">5 deliverables, 2 owners</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="py-8 border-y-2 border-neo-black bg-neo-black">
        <Marquee speed={40} gradient={false}>
          {["Marketing Teams", "Creative Agencies", "Startups", "Project Managers", "Product Teams", "Design Studios"].map((item, i) => (
            <span key={i} className="mx-8 text-white font-heading font-bold text-lg">
              {item} <span className="text-neo-lime mx-4">•</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 md:px-6 bg-neo-pink-light">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="neo-badge bg-neo-pink mb-4">The Problem</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">
              Campaign chaos is killing your productivity
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: MessageSquare,
                title: "Scattered Information",
                desc: "Campaign details spread across Slack, emails, and docs",
                color: "bg-neo-cyan",
              },
              {
                icon: Clock,
                title: "Constant Clarifications",
                desc: "Endless back-and-forth messages to understand requirements",
                color: "bg-neo-yellow",
              },
              {
                icon: Target,
                title: "Missed Deadlines",
                desc: "Wasted time leads to delays and rushed work",
                color: "bg-neo-pink",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card neo-card-hover"
              >
                <div className={`w-12 h-12 ${item.color} border-2 border-neo-black rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-neo-black/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="neo-badge bg-neo-lime mb-4">The Solution</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">
              BrieflyAI does the heavy lifting
            </h2>
            <p className="text-neo-black/70">
              Connect your tools, let AI analyze, get structured briefs in seconds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { icon: MessageSquare, label: "Connect Slack & Gmail", color: "bg-neo-cyan" },
              { icon: Sparkles, label: "AI Reads Conversations", color: "bg-neo-lime" },
              { icon: FileText, label: "Brief Generated", color: "bg-neo-yellow" },
              { icon: CheckCircle, label: "Review & Edit", color: "bg-neo-lavender" },
              { icon: Send, label: "Export to Tools", color: "bg-neo-pink" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${step.color} border-2 border-neo-black rounded-xl shadow-neo mx-auto mb-3 flex items-center justify-center`}>
                  <step.icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <p className="font-semibold text-sm">{step.label}</p>
                {i < 4 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-neo-black/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 md:px-6 bg-neo-black text-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="neo-badge bg-neo-lime text-neo-black border-neo-lime mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">
              From chaos to clarity in 3 steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Your Tools",
                desc: "Link your Slack workspace and Gmail account with one click. We only read what you allow.",
                icon: LayoutDashboard,
              },
              {
                step: "02",
                title: "Chat with AI",
                desc: "Tell BrieflyAI which channel or thread to analyze. Ask questions, get instant briefs.",
                icon: MessageSquare,
              },
              {
                step: "03",
                title: "Export & Execute",
                desc: "Review the generated brief, make edits, then export to Asana, ClickUp, or Sheets.",
                icon: Send,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/5 border-2 border-white/20 rounded-xl p-6 hover:border-neo-lime transition-colors"
              >
                <span className="font-mono text-neo-lime text-4xl font-bold">{item.step}</span>
                <item.icon className="w-8 h-8 mt-4 mb-3 text-neo-cyan" strokeWidth={2.5} />
                <h3 className="font-heading font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="neo-badge bg-neo-cyan mb-4">Use Cases</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-6">
              Built for teams that move fast
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Marketing Campaigns",
                desc: "Turn scattered campaign discussions into actionable briefs",
                color: "bg-neo-lime",
                icon: Target,
              },
              {
                title: "Creative Agencies",
                desc: "Standardize client requests from any communication channel",
                color: "bg-neo-cyan",
                icon: Sparkles,
              },
              {
                title: "Product Launches",
                desc: "Consolidate launch requirements from multiple stakeholders",
                color: "bg-neo-yellow",
                icon: Zap,
              },
              {
                title: "Startup Teams",
                desc: "Move fast without losing important project details",
                color: "bg-neo-pink",
                icon: Users,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-card neo-card-hover group"
              >
                <div className={`w-12 h-12 ${item.color} border-2 border-neo-black rounded-lg flex items-center justify-center mb-4 group-hover:rotate-3 transition-transform`}>
                  <item.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-neo-black/70 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-neo-lime">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black mb-6">
              Stop chasing requirements.
              <br />
              Start executing.
            </h2>
            <p className="text-neo-black/70 mb-10 text-lg">
              Join teams that have already saved hundreds of hours with BrieflyAI.
            </p>
            <Button
              className="neo-button-primary px-10 py-6 text-lg"
              onClick={() => navigate("/auth")}
              data-testid="cta-get-started-btn"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 bg-neo-black text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neo-lime border-2 border-neo-lime rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-neo-black" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-xl">BrieflyAI</span>
            </div>
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} BrieflyAI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/70 hover:text-white text-sm">Privacy</a>
              <a href="#" className="text-white/70 hover:text-white text-sm">Terms</a>
              <a href="#" className="text-white/70 hover:text-white text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
