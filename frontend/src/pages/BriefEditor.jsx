import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Trash2,
  Send,
  Plus,
  X,
  Sparkles,
  FileText,
  Target,
  Calendar,
  Users,
  Link2,
  HelpCircle,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { useAuth } from "../context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BriefEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchBrief();
  }, [id]);

  const fetchBrief = async () => {
    try {
      const response = await axios.get(`${API}/briefs/${id}`, {
        headers: getAuthHeaders(),
      });
      setBrief(response.data);
    } catch (error) {
      toast.error("Failed to load brief");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveBrief = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/briefs/${id}`, brief, {
        headers: getAuthHeaders(),
      });
      toast.success("Brief saved successfully");
    } catch (error) {
      toast.error("Failed to save brief");
    } finally {
      setSaving(false);
    }
  };

  const deleteBrief = async () => {
    try {
      await axios.delete(`${API}/briefs/${id}`, {
        headers: getAuthHeaders(),
      });
      toast.success("Brief deleted");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to delete brief");
    }
  };

  const exportBrief = async (destination) => {
    setExporting(true);
    try {
      const response = await axios.post(
        `${API}/export`,
        { brief_id: id, destination },
        { headers: getAuthHeaders() }
      );
      toast.success(response.data.message);
      setExportModalOpen(false);
      fetchBrief(); // Refresh to show updated status
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const updateField = (field, value) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
  };

  const addListItem = (field) => {
    setBrief((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const updateListItem = (field, index, value) => {
    setBrief((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeListItem = (field, index) => {
    setBrief((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neo-black/40" />
      </div>
    );
  }

  if (!brief) return null;

  const exportDestinations = [
    { id: "asana", name: "Asana", color: "bg-neo-pink" },
    { id: "clickup", name: "ClickUp", color: "bg-neo-cyan" },
    { id: "sheets", name: "Google Sheets", color: "bg-neo-lime" },
  ];

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
                <FileText className="w-5 h-5 text-neo-black/60" />
                <span className="font-heading font-bold truncate max-w-[200px]">
                  {brief.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setDeleteModalOpen(true)}
                data-testid="delete-brief-btn"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                className="neo-button-secondary"
                onClick={saveBrief}
                disabled={saving}
                data-testid="save-brief-btn"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Save</span>
              </Button>
              <Button
                className="neo-button-accent"
                onClick={() => setExportModalOpen(true)}
                data-testid="export-brief-btn"
              >
                <Send className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neo-lime border-2 border-neo-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold">Brief Title</span>
              {brief.source_type === "ai" && (
                <span className="neo-badge bg-neo-cyan text-xs ml-auto">
                  AI Generated
                </span>
              )}
            </div>
            <Input
              value={brief.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="neo-input text-xl font-heading font-bold"
              placeholder="Enter brief title..."
              data-testid="brief-title-input"
            />
          </motion.div>

          {/* Objective */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neo-cyan border-2 border-neo-black rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <Label className="font-heading font-bold">Objective</Label>
            </div>
            <Textarea
              value={brief.objective}
              onChange={(e) => updateField("objective", e.target.value)}
              className="neo-input min-h-[100px]"
              placeholder="What is the main goal of this project?"
              data-testid="brief-objective-input"
            />
          </motion.div>

          {/* Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <Label className="font-heading font-bold">Deliverables</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addListItem("deliverables")}
                className="text-neo-black/70 hover:text-neo-black"
                data-testid="add-deliverable-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {brief.deliverables?.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      updateListItem("deliverables", i, e.target.value)
                    }
                    className="neo-input"
                    placeholder="Enter deliverable..."
                    data-testid={`deliverable-input-${i}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("deliverables", i)}
                    className="text-neo-black/50 hover:text-red-500"
                    data-testid={`remove-deliverable-${i}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!brief.deliverables || brief.deliverables.length === 0) && (
                <p className="text-neo-black/50 text-sm">
                  No deliverables added yet
                </p>
              )}
            </div>
          </motion.div>

          {/* Deadline & Owners */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neo-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-neo-pink border-2 border-neo-black rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <Label className="font-heading font-bold">Deadline</Label>
              </div>
              <Input
                value={brief.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
                className="neo-input"
                placeholder="e.g., Friday, December 20"
                data-testid="brief-deadline-input"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="neo-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neo-lavender border-2 border-neo-black rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <Label className="font-heading font-bold">Owners</Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addListItem("owners")}
                  className="text-neo-black/70 hover:text-neo-black"
                  data-testid="add-owner-btn"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {brief.owners?.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateListItem("owners", i, e.target.value)
                      }
                      className="neo-input"
                      placeholder="Name or team..."
                      data-testid={`owner-input-${i}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeListItem("owners", i)}
                      className="text-neo-black/50 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!brief.owners || brief.owners.length === 0) && (
                  <p className="text-neo-black/50 text-sm">No owners assigned</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neo-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neo-muted border-2 border-neo-black rounded-lg flex items-center justify-center">
                  <Link2 className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <Label className="font-heading font-bold">Assets & Resources</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addListItem("assets")}
                className="text-neo-black/70 hover:text-neo-black"
                data-testid="add-asset-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {brief.assets?.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateListItem("assets", i, e.target.value)}
                    className="neo-input"
                    placeholder="Link or resource description..."
                    data-testid={`asset-input-${i}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("assets", i)}
                    className="text-neo-black/50 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!brief.assets || brief.assets.length === 0) && (
                <p className="text-neo-black/50 text-sm">No assets linked</p>
              )}
            </div>
          </motion.div>

          {/* Open Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="neo-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <Label className="font-heading font-bold">Open Questions</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addListItem("open_questions")}
                className="text-neo-black/70 hover:text-neo-black"
                data-testid="add-question-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {brief.open_questions?.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      updateListItem("open_questions", i, e.target.value)
                    }
                    className="neo-input"
                    placeholder="Question that needs clarification..."
                    data-testid={`question-input-${i}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("open_questions", i)}
                    className="text-neo-black/50 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!brief.open_questions || brief.open_questions.length === 0) && (
                <p className="text-neo-black/50 text-sm">
                  No open questions
                </p>
              )}
            </div>
          </motion.div>

          {/* Source Content */}
          {brief.source_content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="neo-card bg-neo-muted/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white border-2 border-neo-black rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <Label className="font-heading font-bold">Source Content</Label>
              </div>
              <div className="bg-white border-2 border-neo-black rounded-lg p-4">
                <p className="text-sm text-neo-black/70 whitespace-pre-wrap font-mono">
                  {brief.source_content}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="neo-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">
              Export Brief
            </DialogTitle>
            <DialogDescription>
              Choose where you want to export this brief
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {exportDestinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => exportBrief(dest.id)}
                disabled={exporting}
                className={`w-full neo-card py-4 px-5 flex items-center justify-between hover:shadow-neo-hover hover:-translate-y-0.5 transition-all ${exporting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                data-testid={`export-to-${dest.id}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${dest.color} border-2 border-neo-black rounded-lg flex items-center justify-center`}
                  >
                    <Send className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold">{dest.name}</span>
                </div>
                {exporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ExternalLink className="w-5 h-5 text-neo-black/40" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-neo-black/50 text-center mt-4">
            Note: Exports are in demo mode. Real integrations coming soon!
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="neo-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-red-600">
              Delete Brief?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The brief "{brief.title}" will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 neo-button-secondary"
              onClick={() => setDeleteModalOpen(false)}
              data-testid="cancel-delete-btn"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-2 border-red-600"
              onClick={deleteBrief}
              data-testid="confirm-delete-btn"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
