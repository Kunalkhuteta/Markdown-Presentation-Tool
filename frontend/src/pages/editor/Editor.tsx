import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Save, Download, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Theme {
  _id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => (
  <div className="h-full flex flex-col">
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`# Your Presentation Title

---

## Slide 2
- Point 1
- Point 2
- Point 3

---`}
      className="w-full h-[calc(100vh-150px)] resize-none font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 bg-card overflow-y-auto"
    />
  </div>
);



interface SlidePreviewProps {
  markdown: string;
  theme: Theme | null;
  title: string;
  onTitleChange: (value: string) => void;
}

const SlidePreview = ({
  markdown,
  theme,
  title,
  onTitleChange,
}: SlidePreviewProps) => {
  const slides = useMemo(
    () => markdown.split("---").filter((s) => s.trim()),
    [markdown]
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const renderMarkdown = (text: string) => {
    const lines = text.trim().split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# "))
        return (
          <h1 key={i} className="text-5xl font-bold mb-8">
            {line.slice(2)}
          </h1>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-4xl font-bold mb-6">
            {line.slice(3)}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-3xl font-semibold mb-4">
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="text-xl mb-2 ml-6">
            {line.slice(2)}
          </li>
        );
      if (line.trim())
        return (
          <p key={i} className="text-xl mb-4">
            {line}
          </p>
        );
      return null;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-8 py-3 border-b">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Presentation Title"
          className="max-w-sm font-medium text-lg"
        />
      </div>

      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{
          backgroundColor: theme?.backgroundColor || "#f8fafc",
          color: theme?.textColor || "#000",
          fontFamily: theme?.fontFamily || "inherit",
        }}
      >
        <div
          className="w-full max-w-4xl aspect-video rounded-xl shadow-lg p-12 flex flex-col justify-center transition-all"
          style={{ backgroundColor: theme?.primaryColor || "#fff" }}
        >
          {slides[currentSlide] ? (
            renderMarkdown(slides[currentSlide])
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-2xl">Start writing to see your slides...</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-4">
          Slide {currentSlide + 1} of {slides.length || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
          }
          disabled={currentSlide >= slides.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState("pdf");

  // Fetch themes
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await api.get("/themes/public-themes");
        setThemes(res.data.data);
      } catch (err) {
        console.error("Error fetching themes:", err);
      } finally {
        setLoadingThemes(false);
      }
    };
    fetchThemes();
  }, []);

  // Fetch presentation if editing
  useEffect(() => {
    const fetchPresentation = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/presentations/get-presentation/${id}`);
        const presentation = res.data.data;
        setTitle(presentation.title);
        setMarkdown(presentation.content);

        // FIXED HERE: changed themeId → theme
        if (presentation.theme) {
          const themeRes = await api.get(`/themes/get-theme/${presentation.theme}`);
          setSelectedTheme(themeRes.data.data);
        }
      } catch (err) {
        console.error("Error loading presentation:", err);
      }
    };
    fetchPresentation();
  }, [id]);

  // Save or Update Presentation
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (id) {
        await api.put(`/presentations/update-presentation/${id}`, {
          title,
          content: markdown,
          theme: selectedTheme?._id || null, // FIXED
        });
        toast.success("Presentation updated successfully!");
      } else {
        const res = await api.post("/presentations/create-new-presentation", {
          title,
          content: markdown,
          theme: selectedTheme?._id || null, // FIXED
        });
        toast.success("Presentation created successfully!");
        navigate(`/editor/${res.data.data._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save presentation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToPresentation = async (theme: Theme) => {
    try {
      setSelectedTheme(theme);
      toast.success(`Theme "${theme.name}" applied`);
      if (id) {
        await api.put(`/presentations/update-presentation/${id}`, {
          theme: theme._id, // FIXED
        });
      }
    } catch (err) {
      console.error("Failed to apply theme:", err);
      toast.error("Failed to apply theme");
    }
  };

  const handleExport = async (type: string) => {
    try {
      const res = await api.get(`/presentations/export/${id}?type=${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${title}.${type === "pdf" ? "pdf" : type === "markdown" ? "md" : "txt"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${type.toUpperCase()} successfully!`);
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Failed to export presentation");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="gap-2"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : (<><Save className="w-4 h-4" /> Save</>)}
            </Button>

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Export Type</DialogTitle>
                </DialogHeader>

                <RadioGroup
                  value={exportType}
                  onValueChange={setExportType}
                  className="space-y-3 mt-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="md" id="md" />
                    <Label htmlFor="md">Markdown (.md)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="txt" id="txt" />
                    <Label htmlFor="txt">Plain Text (.txt)</Label>
                  </div>
                </RadioGroup>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleExport(exportType)}>Export</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Theme Selector Popup */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Palette className="w-4 h-4" /> Select Theme
              </Button>
            </DialogTrigger>

            <DialogContent
              className="p-8 rounded-lg overflow-y-auto"
              style={{
                width: "90vw",
                height: "90vh",
                maxWidth: "90vw",
                maxHeight: "90vh",
                margin: "5vh auto",
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold mb-6">
                  Select a Theme
                </DialogTitle>
              </DialogHeader>

              {loadingThemes ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {themes.map((theme) => (
                    <Card
                      key={theme._id}
                      className={`hover:shadow-lg transition-all border-2 ${
                        selectedTheme?._id === theme._id
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: theme.backgroundColor }}
                    >
                      <CardHeader>
                        <CardTitle style={{ fontFamily: theme.fontFamily }}>
                          {theme.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">
                          {theme.description}
                        </p>
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: theme.backgroundColor }}
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: theme.textColor }}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleAddToPresentation(theme)}
                        >
                          Apply Theme
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 grid md:grid-cols-2 overflow-hidden">
        <div className="border-r">
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>
        <div>
          <SlidePreview
            markdown={markdown}
            theme={selectedTheme}
            title={title}
            onTitleChange={setTitle}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
