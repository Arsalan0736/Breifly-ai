import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Send,
  Plus,
  Sparkles,
  MessageSquare,
  Clock,
  ChevronRight,
  Menu,
  X,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { useAuth } from "../context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchBriefs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchBriefs = async () => {
    try {
      const response = await axios.get(`${API}/briefs`, {
        headers: getAuthHeaders(),
      });
      setBriefs(response.data);
    } catch (error) {
      toast.error("Failed to load briefs");
    } finally {
      setLoadingBriefs(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API}/chat`,
        {
          message: inputMessage,
          conversation_id: conversationId,
        },
        { headers: getAuthHeaders() }
      );

      const aiMessage = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toISOString(),
        brief: response.data.brief,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setConversationId(response.data.conversation_id);

      if (response.data.brief) {
        setBriefs((prev) => [response.data.brief, ...prev]);
        toast.success("New brief created!");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Briefs", onClick: () => { } },
    { icon: Settings, label: "Settings", onClick: () => navigate("/settings") },
  ];

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r-2 border-neo-black transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="p-4 border-b-2 border-neo-black">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-neo-lime border-2 border-neo-black rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </div>
            {sidebarOpen && (
              <span className="font-heading font-bold text-lg">BrieflyAI</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item, i) => (
              <li key={i}>
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${item.active
                      ? "bg-neo-black text-white"
                      : "hover:bg-neo-muted text-neo-black"
                    }`}
                  data-testid={`nav-${item.label.toLowerCase()}-btn`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t-2 border-neo-black">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neo-cyan border-2 border-neo-black rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" strokeWidth={2.5} />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-neo-black/60 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-neo-black/70 hover:text-neo-black hover:bg-neo-muted"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            {sidebarOpen && "Log out"}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r-2 border-neo-black z-50 md:hidden flex flex-col"
            >
              <div className="p-4 border-b-2 border-neo-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-neo-lime border-2 border-neo-black rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="font-heading font-bold text-lg">BrieflyAI</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navItems.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          item.onClick?.();
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${item.active
                            ? "bg-neo-black text-white"
                            : "hover:bg-neo-muted text-neo-black"
                          }`}
                      >
                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="p-4 border-t-2 border-neo-black">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neo-cyan border-2 border-neo-black rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-neo-black/60">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" strokeWidth={2.5} />
                  Log out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b-2 border-neo-black bg-white px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              className="hidden md:block"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="toggle-sidebar-btn"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-heading font-bold text-xl">Dashboard</h1>
          </div>
          <Button
            className="neo-button-accent"
            onClick={startNewChat}
            data-testid="new-chat-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </header>

        {/* Content Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-neo-lime border-2 border-neo-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="font-heading font-bold text-2xl mb-3">
                      Start a conversation
                    </h2>
                    <p className="text-neo-black/60 mb-6">
                      Ask BrieflyAI to create a brief from your Slack messages,
                      email threads, or describe your project needs.
                    </p>
                    <div className="space-y-2">
                      {[
                        "Create a brief from #marketing channel",
                        "Summarize this email thread into a brief",
                        "Help me structure a campaign brief",
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => setInputMessage(prompt)}
                          className="w-full text-left neo-card py-3 px-4 hover:bg-neo-muted transition-colors"
                          data-testid={`prompt-suggestion-${i}`}
                        >
                          <span className="text-sm">{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[80%] ${msg.role === "user"
                            ? "bg-neo-black text-white rounded-2xl rounded-br-md px-4 py-3"
                            : "neo-card"
                          }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-neo-lime border border-neo-black rounded-lg flex items-center justify-center">
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="font-semibold text-sm">BrieflyAI</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap text-sm">
                          {msg.content}
                        </div>
                        {msg.brief && (
                          <button
                            onClick={() => navigate(`/brief/${msg.brief.id}`)}
                            className="mt-3 flex items-center gap-2 text-neo-lime bg-neo-black/10 px-3 py-2 rounded-lg hover:bg-neo-black/20 transition-colors"
                            data-testid={`view-brief-${msg.brief.id}`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              View Brief: {msg.brief.title}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="neo-card">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-neo-black/60">
                            BrieflyAI is thinking...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t-2 border-neo-black bg-white">
              <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask BrieflyAI to create a brief..."
                    className="neo-input flex-1"
                    disabled={isTyping}
                    data-testid="chat-input"
                  />
                  <Button
                    type="submit"
                    className="neo-button-primary px-6"
                    disabled={!inputMessage.trim() || isTyping}
                    data-testid="send-message-btn"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Briefs Panel */}
          <aside className="hidden lg:block w-80 border-l-2 border-neo-black bg-white">
            <div className="p-4 border-b-2 border-neo-black">
              <h2 className="font-heading font-bold">Recent Briefs</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-4 space-y-3">
                {loadingBriefs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-neo-black/40" />
                  </div>
                ) : briefs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-neo-black/20 mb-3" />
                    <p className="text-neo-black/60 text-sm">
                      No briefs yet. Start a conversation to create one!
                    </p>
                  </div>
                ) : (
                  briefs.map((brief) => (
                    <button
                      key={brief.id}
                      onClick={() => navigate(`/brief/${brief.id}`)}
                      className="w-full text-left neo-card py-3 px-4 hover:shadow-neo-hover hover:-translate-y-0.5 transition-all"
                      data-testid={`brief-card-${brief.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {brief.title}
                          </h3>
                          <p className="text-xs text-neo-black/60 mt-1 line-clamp-2">
                            {brief.objective || "No objective set"}
                          </p>
                        </div>
                        <span
                          className={`neo-badge text-xs ${brief.status === "draft"
                              ? "bg-neo-yellow"
                              : brief.status === "exported"
                                ? "bg-neo-lime"
                                : "bg-neo-cyan"
                            }`}
                        >
                          {brief.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neo-black/50">
                        <Clock className="w-3 h-3" />
                        {new Date(brief.updated_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </main>
    </div>
  );
}
