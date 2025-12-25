import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Settings as SettingsIcon,
  Link2,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Settings() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${API}/integrations`, {
        headers: getAuthHeaders(),
      });
      setIntegrations(response.data);
    } catch (error) {
      toast.error("Failed to load integrations");
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const connectIntegration = async (name) => {
    setConnecting(name);
    try {
      const response = await axios.post(
        `${API}/integrations/${name}/connect`,
        {},
        { headers: getAuthHeaders() }
      );
      toast.info(
        `${name} integration is in demo mode. Real OAuth coming soon!`
      );
    } catch (error) {
      toast.error("Failed to connect integration");
    } finally {
      setConnecting(null);
    }
  };

  const integrationIcons = {
    slack: MessageSquare,
    gmail: Mail,
    asana: CheckCircle,
    clickup: CheckCircle,
    google_sheets: FileSpreadsheet,
  };

  const integrationColors = {
    slack: "bg-neo-cyan",
    gmail: "bg-neo-pink",
    asana: "bg-neo-yellow",
    clickup: "bg-neo-lime",
    google_sheets: "bg-neo-lavender",
  };

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-neo-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-neo-black/70 hover:text-neo-black"
                data-testid="back-to-dashboard-btn"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-neo-black/20" />
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-neo-black/60" />
                <span className="font-heading font-bold">Settings</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neo-lime border-2 border-neo-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold hidden sm:inline">
                BrieflyAI
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Profile Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-heading font-bold text-2xl mb-4">Profile</h2>
            <div className="neo-card">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-neo-cyan border-2 border-neo-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="font-semibold text-neo-black/60 text-sm">
                      Name
                    </Label>
                    <p className="font-semibold text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <Label className="font-semibold text-neo-black/60 text-sm">
                      Email
                    </Label>
                    <p className="font-semibold text-lg">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Integrations Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-2xl">Integrations</h2>
              <span className="neo-badge bg-neo-yellow text-xs">Demo Mode</span>
            </div>
            <div className="space-y-3">
              {loadingIntegrations ? (
                <div className="neo-card flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-neo-black/40" />
                </div>
              ) : (
                integrations.map((integration) => {
                  const Icon =
                    integrationIcons[integration.name] || Link2;
                  const color =
                    integrationColors[integration.name] || "bg-neo-muted";
                  const displayName =
                    integration.name.charAt(0).toUpperCase() +
                    integration.name.slice(1).replace("_", " ");

                  return (
                    <div
                      key={integration.name}
                      className="neo-card flex items-center justify-between"
                      data-testid={`integration-${integration.name}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 ${color} border-2 border-neo-black rounded-xl flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{displayName}</h3>
                          <p className="text-sm text-neo-black/60">
                            {integration.connected
                              ? `Last synced: ${integration.last_sync || "Never"}`
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {integration.connected ? (
                          <span className="flex items-center gap-1 text-neo-lime">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Connected
                            </span>
                          </span>
                        ) : (
                          <Button
                            className="neo-button-secondary"
                            onClick={() =>
                              connectIntegration(integration.name)
                            }
                            disabled={connecting === integration.name}
                            data-testid={`connect-${integration.name}-btn`}
                          >
                            {connecting === integration.name ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Link2 className="w-4 h-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-sm text-neo-black/50 mt-4">
              Integrations are currently in demo mode. Real OAuth connections
              will be available in the full version.
            </p>
          </motion.section>

          {/* Preferences Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading font-bold text-2xl mb-4">Preferences</h2>
            <div className="neo-card space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-neo-black/60">
                    Receive updates about your briefs
                  </p>
                </div>
                <Switch data-testid="email-notifications-switch" />
              </div>
              <div className="border-t-2 border-neo-black/10" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto-save Briefs</h3>
                  <p className="text-sm text-neo-black/60">
                    Automatically save changes while editing
                  </p>
                </div>
                <Switch defaultChecked data-testid="auto-save-switch" />
              </div>
              <div className="border-t-2 border-neo-black/10" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">AI Suggestions</h3>
                  <p className="text-sm text-neo-black/60">
                    Show AI-powered suggestions while writing
                  </p>
                </div>
                <Switch defaultChecked data-testid="ai-suggestions-switch" />
              </div>
            </div>
          </motion.section>

          {/* Data Privacy Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-heading font-bold text-2xl mb-4">
              Data & Privacy
            </h2>
            <div className="neo-card bg-neo-muted/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neo-lime border-2 border-neo-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Your data is secure</h3>
                  <ul className="space-y-2 text-sm text-neo-black/70">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-neo-lime mt-0.5 flex-shrink-0" />
                      <span>
                        BrieflyAI only reads data you explicitly allow
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-neo-lime mt-0.5 flex-shrink-0" />
                      <span>
                        Your conversations are encrypted and never shared
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-neo-lime mt-0.5 flex-shrink-0" />
                      <span>You can delete your data at any time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-heading font-bold text-2xl mb-4 text-red-600">
              Danger Zone
            </h2>
            <div className="neo-card border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-600">Delete Account</h3>
                  <p className="text-sm text-neo-black/60">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-2 border-red-500 text-red-500 hover:bg-red-50"
                  data-testid="delete-account-btn"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
