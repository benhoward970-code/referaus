"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = { from: "bot" | "user"; text: string; options?: string[] };

const FAQ: Record<string, string> = {
  "What is ReferAus?": "ReferAus is a free NDIS provider directory for the Hunter Region. Participants can search, compare, and connect with local NDIS providers — completely free.",
  "Is it free?": "Yes! ReferAus is 100% free for NDIS participants. Providers can list for free too — paid plans are optional for extra features.",
  "How do I find a provider?": "Use the search bar on our homepage or go to the Providers page. You can filter by service type, location, and ratings. No account needed!",
  "I'm a provider — how do I list?": "Go to referaus.com/register, select 'Provider', and create your account. Your free listing takes about 5 minutes to set up.",
  "What areas do you cover?": "We're focused on Newcastle and the Hunter Region in NSW, Australia. We're expanding across NSW soon.",
  "How do I contact a provider?": "Find a provider on our directory, then click 'Send Enquiry' on their profile. They'll get your message directly.",
  "What are the paid plans?": "We have Starter ($29/mo), Pro ($79/mo), and Premium ($149/mo) plans for providers. These give priority search ranking, analytics, and more. Free listing is always available.",
  "I need help with my NDIS plan": "ReferAus helps you find providers — we're not a plan manager or support coordinator. You can search for Support Coordinators or Plan Managers on our site to get help with your plan.",
};

const INITIAL_OPTIONS = [
  "What is ReferAus?",
  "Is it free?",
  "How do I find a provider?",
  "I'm a provider — how do I list?",
  "I need something else",
];

const SECONDARY_OPTIONS = [
  "What areas do you cover?",
  "How do I contact a provider?",
  "What are the paid plans?",
  "I need help with my NDIS plan",
  "Talk to a real person",
];

type EnquiryStep = null | "name" | "email" | "message" | "done";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [started, setStarted] = useState(false);
  const [enquiryStep, setEnquiryStep] = useState<EnquiryStep>(null);
  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(false);
  const [onAuthPage, setOnAuthPage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/admin"];
    setOnAuthPage(authPaths.some((p) => path.startsWith(p)));
  }, []);

  if (onAuthPage) return null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show unread dot after 10 seconds if chat hasn't been opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && !started) setUnread(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [open, started]);

  const addBot = (text: string, options?: string[]) => {
    setMessages((prev) => [...prev, { from: "bot", text, options }]);
  };

  const addUser = (text: string) => {
    setMessages((prev) => [...prev, { from: "user", text }]);
  };

  const startChat = () => {
    if (started) return;
    setStarted(true);
    setUnread(false);
    addBot("G'day! 👋 I'm the ReferAus assistant. How can I help you today?", INITIAL_OPTIONS);
  };

  const handleOption = (option: string) => {
    addUser(option);

    if (option === "I need something else") {
      setTimeout(() => addBot("No worries — here are some more options:", SECONDARY_OPTIONS), 400);
      return;
    }

    if (option === "Talk to a real person") {
      setEnquiryStep("name");
      setTimeout(() => addBot("Happy to connect you with our team. What's your name?"), 400);
      return;
    }

    const answer = FAQ[option];
    if (answer) {
      setTimeout(() => {
        addBot(answer);
        setTimeout(() => addBot("Anything else I can help with?", [...SECONDARY_OPTIONS.slice(0, 3), "Talk to a real person"]), 600);
      }, 400);
    }
  };

  const handleEnquiryInput = async () => {
    const val = input.trim();
    if (!val) return;
    addUser(val);
    setInput("");

    if (enquiryStep === "name") {
      setEnquiry((e) => ({ ...e, name: val }));
      setEnquiryStep("email");
      setTimeout(() => addBot("Thanks " + val + "! What's your email address?"), 400);
    } else if (enquiryStep === "email") {
      if (!val.includes("@")) {
        setTimeout(() => addBot("That doesn't look like a valid email. Could you try again?"), 400);
        return;
      }
      setEnquiry((e) => ({ ...e, email: val }));
      setEnquiryStep("message");
      setTimeout(() => addBot("Got it. What can we help you with? (Briefly describe what you need)"), 400);
    } else if (enquiryStep === "message") {
      setEnquiry((e) => ({ ...e, message: val }));
      setEnquiryStep("done");

      // Save to Supabase via contact API
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: enquiry.name,
            email: enquiry.email,
            message: val,
            type: "chat-widget",
          }),
        });
      } catch {
        // Silent fail — message is displayed anyway
      }

      setTimeout(() => {
        addBot("Thanks! I've passed your message to our team. We'll get back to you at " + enquiry.email + " as soon as possible. 🙌");
        setTimeout(() => addBot("Is there anything else I can help with?", INITIAL_OPTIONS.slice(0, 4)), 800);
        setEnquiryStep(null);
      }, 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnquiryInput();
    }
  };

  return (
    <>
      {/* Chat bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); startChat(); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            aria-label="Open chat"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {unread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="font-bold text-sm">ReferAus Assistant</div>
                <div className="text-[0.65rem] text-blue-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Online
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors" aria-label="Close chat">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${msg.from === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}>
                    {msg.text}
                    {msg.options && (
                      <div className="mt-3 space-y-1.5">
                        {msg.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleOption(opt)}
                            className="block w-full text-left px-3 py-2 rounded-xl bg-white text-blue-600 text-xs font-medium border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input (only shown during enquiry flow) */}
            {enquiryStep && enquiryStep !== "done" && (
              <div className="border-t border-gray-100 px-4 py-3 flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    enquiryStep === "name" ? "Your name..." :
                    enquiryStep === "email" ? "your@email.com" :
                    "Type your message..."
                  }
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleEnquiryInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-all"
                >
                  Send
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
