import { useState } from "react";
import { FileText, Code, Palette, Download, Terminal } from "lucide-react";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: FileText },
    { id: "markdown", title: "Markdown Syntax", icon: Code },
    { id: "themes", title: "Themes", icon: Palette },
    { id: "export", title: "Export Options", icon: Download },
    { id: "cli", title: "CLI Guide", icon: Terminal },
  ];

  const content = {
    introduction: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Welcome to MakeBreak</h1>
        <p className="text-lg text-muted-foreground">
          MakeBreak is a modern, Markdown-based presentation builder that helps you create
          beautiful slides with minimal effort.
        </p>
        <h2 className="text-2xl font-semibold mt-8">Getting Started</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Write your slides in Markdown format</li>
          <li>Preview in real-time as you type</li>
          <li>Apply beautiful themes instantly</li>
          <li>Export to HTML, PDF, or PPTX</li>
        </ul>
      </div>
    ),
    markdown: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Markdown Syntax</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to write effective presentations using Markdown.
        </p>
        <div className="bg-card border rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-3">Slide Separators</h3>
          <code className="block bg-muted p-4 rounded">---</code>
          <p className="text-sm text-muted-foreground mt-2">Use three dashes to separate slides</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Headings</h3>
          <code className="block bg-muted p-4 rounded font-mono text-sm">
            # Main Title<br/>
            ## Subtitle<br/>
            ### Section Heading
          </code>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Lists</h3>
          <code className="block bg-muted p-4 rounded font-mono text-sm">
            - Point one<br/>
            - Point two<br/>
            - Point three
          </code>
        </div>
      </div>
    ),
    themes: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Themes</h1>
        <p className="text-lg text-muted-foreground">
          Customize the appearance of your presentations with themes.
        </p>
        <h2 className="text-2xl font-semibold mt-8">Built-in Themes</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Light</strong> - Clean, minimalist light theme</li>
          <li><strong>Dark</strong> - Modern dark theme for low-light presentations</li>
          <li><strong>Academic</strong> - Professional theme for research and education</li>
          <li><strong>Minimalist</strong> - Ultra-clean design with maximum focus</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8">Custom Themes</h2>
        <p className="text-muted-foreground">
          Create your own themes by customizing colors, fonts, and layouts in the Theme Manager.
        </p>
      </div>
    ),
    export: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Export Options</h1>
        <p className="text-lg text-muted-foreground">
          Export your presentations in multiple formats.
        </p>
        <div className="grid gap-4 mt-6">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">HTML</h3>
            <p className="text-sm text-muted-foreground">
              Self-contained HTML file with embedded styles and assets
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">PDF</h3>
            <p className="text-sm text-muted-foreground">
              High-quality PDF suitable for printing and distribution
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-2">PPTX</h3>
            <p className="text-sm text-muted-foreground">
              PowerPoint format for editing in Microsoft Office
            </p>
          </div>
        </div>
      </div>
    ),
    cli: (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">CLI Guide</h1>
        <p className="text-lg text-muted-foreground">
          Use the MakeBreak CLI for automated workflows.
        </p>
        <div className="bg-card border rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-3">Installation</h3>
          <code className="block bg-muted p-4 rounded font-mono text-sm">
            npm install -g makebreak
          </code>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Build Presentation</h3>
          <code className="block bg-muted p-4 rounded font-mono text-sm">
            makebreak build slides.md --theme=dark --export=pdf
          </code>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Live Server</h3>
          <code className="block bg-muted p-4 rounded font-mono text-sm">
            makebreak serve slides.md
          </code>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <nav className="sticky top-24 space-y-1">
              {sections.map(({ id, title, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-smooth ${
                    activeSection === id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{title}</span>
                </button>
              ))}
            </nav>
          </aside>
          
          <main className="md:col-span-3">
            <div className="prose prose-lg max-w-none animate-fade-in">
              {content[activeSection as keyof typeof content]}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Docs;
