import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, Mail, Twitter, Linkedin, Check } from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

const Index = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!email || !message) return;

    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@example.com");
    toast("Copied to clipboard", { duration: 2000 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center">
      <div className="max-w-[540px] w-full mx-auto px-6 py-[15vh]">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease }}
              className="space-y-8"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.05 }}
              >
                <h1 className="text-6xl font-medium tracking-tighter text-foreground">
                  Say hi.
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  I'm usually online. Drop a note and I'll get back to you within 24 hours.
                </p>
              </motion.div>

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.1 }}
                className="bg-card rounded-[24px] p-8 space-y-6"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute opacity-0 pointer-events-none h-0 w-0"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                    Your email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="contact-input"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    ref={textareaRef}
                    required
                    rows={5}
                    maxLength={maxChars}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="contact-input resize-none"
                  />
                  <div className="flex justify-end mt-1.5 mr-1">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {message.length}/{maxChars}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    ⌘ + Enter to send
                  </span>
                  <button
                    type="submit"
                    disabled={sending || !email || !message}
                    className="contact-button"
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        Send message
                        <Send className="w-3.5 h-3.5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Footer Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease, delay: 0.2 }}
                className="flex items-center gap-6 pt-4"
              >
                <button
                  type="button"
                  onClick={copyEmail}
                  className="contact-link"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="space-y-4 py-[10vh]"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-6xl font-medium tracking-tighter text-foreground">
                Message sent.
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Thanks for reaching out. I'll get back to you soon.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                  setMessage("");
                }}
                className="mt-6 text-sm text-primary hover:underline underline-offset-4 transition-colors"
              >
                Send another message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
