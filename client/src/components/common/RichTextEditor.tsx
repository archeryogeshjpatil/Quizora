import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useState, useRef } from 'react';

// Formula symbols organized by category
const FORMULA_GROUPS = [
  {
    label: 'Arithmetic',
    symbols: ['×', '÷', '±', '=', '≠', '<', '>', '≤', '≥', '∞'],
  },
  {
    label: 'Algebra',
    symbols: ['√', '∛', 'x²', 'x³', 'xⁿ', '|x|', 'ₙ', 'ⁿ'],
  },
  {
    label: 'Calculus',
    symbols: ['∑', '∫', '∂', 'd/dx', 'lim', '→', 'Δ'],
  },
  {
    label: 'Greek',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Ω', 'Σ', 'Π'],
  },
  {
    label: 'Set Theory',
    symbols: ['∈', '∉', '∪', '∩', '⊂', '⊃', '∅', '∀', '∃'],
  },
  {
    label: 'Logic',
    symbols: ['∧', '∨', '¬', '⇒', '⇔'],
  },
  {
    label: 'Chemistry',
    symbols: ['→', '⇌', '↑', '↓', '⁺', '⁻'],
  },
  {
    label: 'Fractions',
    symbols: ['½', '⅓', '¼', '⅕', '⅔', '¾'],
  },
];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ content, onChange, placeholder, minHeight = '120px' }: RichTextEditorProps) {
  const [showSymbols, setShowSymbols] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [showLatexInput, setShowLatexInput] = useState(false);
  const [latexValue, setLatexValue] = useState('');
  const [pasteWarning, setPasteWarning] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: 'bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm my-2 overflow-x-auto' },
        },
      }),
      Image.configure({ inline: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none px-4 py-3`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  if (!editor) return null;

  const insertSymbol = (symbol: string) => {
    editor.chain().focus().insertContent(symbol).run();
  };

  const insertCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLatex = () => {
    if (!latexValue.trim()) return;
    // Wrap in a span with LaTeX class for rendering
    editor.chain().focus().insertContent(`<span class="latex-formula" data-latex="${latexValue}">\\(${latexValue}\\)</span> `).run();
    setLatexValue('');
    setShowLatexInput(false);
  };

  // Handle paste — detect LaTeX, Unicode math, MathML
  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');

    // Detect LaTeX patterns
    if (text.match(/\\[a-zA-Z]+/) || text.match(/\$.*\$/) || text.match(/\\frac|\\sum|\\int|\\sqrt/)) {
      setPasteWarning('LaTeX formula detected — preserved as-is');
      setTimeout(() => setPasteWarning(''), 3000);
      return; // let default paste handle it
    }

    // Detect MathML
    if (html && html.includes('<math') || html?.includes('MathML')) {
      setPasteWarning('MathML content detected — converted to text');
      setTimeout(() => setPasteWarning(''), 3000);
      return;
    }

    // Detect Unicode math symbols
    if (text.match(/[∑∫∂√∞±≤≥≠≈∈∉∪∩⊂⊃∅∀∃∧∨¬⇒⇔αβγδεθλμπσφω]/)) {
      setPasteWarning('Math symbols detected — preserved');
      setTimeout(() => setPasteWarning(''), 3000);
      return;
    }

    // Plain text formula detection (x^2, a/b)
    if (text.match(/[a-z]\^[0-9]|[a-z]_[0-9]|sqrt\(|log\(|sin\(|cos\(/i)) {
      setPasteWarning('Text formula detected — consider using LaTeX mode for proper rendering');
      setTimeout(() => setPasteWarning(''), 4000);
    }
  };

  const ToolbarButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition ${
        active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Formatting Toolbar */}
      <div className="bg-gray-50 border-b px-2 py-1.5 flex items-center gap-0.5 flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading">
          H
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          •
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          1.
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={insertCodeBlock} active={editor.isActive('codeBlock')} title="Code Block">
          <span className="font-mono text-[10px]">{'{}'}</span>
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Insert Image">
          <span className="text-xs">IMG</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Formula/Symbol Toggle */}
        <button
          type="button"
          onClick={() => setShowSymbols(!showSymbols)}
          className={`px-2.5 h-8 flex items-center gap-1 rounded text-sm transition font-medium ${
            showSymbols ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Math & Symbols"
        >
          <span>∑</span>
          <span className="text-[10px]">Math</span>
        </button>

        {/* LaTeX Input */}
        <button
          type="button"
          onClick={() => setShowLatexInput(!showLatexInput)}
          className={`px-2.5 h-8 flex items-center gap-1 rounded text-sm transition font-medium ${
            showLatexInput ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Insert LaTeX Formula"
        >
          <span className="text-xs font-mono">LaTeX</span>
        </button>

        {/* Subscript/Superscript */}
        <ToolbarButton onClick={() => insertSymbol('²')} title="Superscript ²">
          x²
        </ToolbarButton>
        <ToolbarButton onClick={() => insertSymbol('₂')} title="Subscript ₂">
          x₂
        </ToolbarButton>
      </div>

      {/* Formula Toolbar — Always visible when toggled */}
      {showSymbols && (
        <div className="bg-purple-50 border-b px-3 py-2">
          {/* Category tabs */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {FORMULA_GROUPS.map((group, i) => (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveGroup(i)}
                className={`px-2 py-0.5 text-xs rounded-full transition ${
                  activeGroup === i ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-purple-100'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
          {/* Symbols grid */}
          <div className="flex gap-1 flex-wrap">
            {FORMULA_GROUPS[activeGroup].symbols.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertSymbol(symbol)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-lg hover:bg-purple-100 hover:border-purple-300 transition cursor-pointer"
                title={`Insert ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LaTeX Input Popup */}
      {showLatexInput && (
        <div className="bg-indigo-50 border-b px-3 py-3">
          <label className="block text-xs font-medium text-indigo-700 mb-1">Type LaTeX formula:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={latexValue}
              onChange={(e) => setLatexValue(e.target.value)}
              placeholder="e.g., \frac{a}{b}, \sum_{i=1}^{n} x_i, \sqrt{x^2+y^2}"
              className="flex-1 px-3 py-1.5 border border-indigo-300 rounded text-sm font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertLatex(); } }}
            />
            <button type="button" onClick={insertLatex} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition">Insert</button>
            <button type="button" onClick={() => setShowLatexInput(false)} className="px-2 py-1.5 text-gray-500 text-xs hover:text-gray-700">Cancel</button>
          </div>
          {latexValue && (
            <div className="mt-2 bg-white rounded p-2 border border-indigo-200 text-sm font-mono text-gray-700">
              Preview: \({latexValue}\)
            </div>
          )}
          <p className="text-[10px] text-indigo-500 mt-1">Examples: \frac&#123;a&#125;&#123;b&#125;, \int_0^1, \alpha + \beta, \sqrt&#123;x&#125;</p>
        </div>
      )}

      {/* Paste Warning */}
      {pasteWarning && (
        <div className="bg-yellow-50 border-b px-3 py-2 text-xs text-yellow-700 flex items-center gap-2">
          <span>⚠</span> {pasteWarning}
        </div>
      )}

      {/* Editor Content */}
      <div onPaste={handlePaste}>
        <EditorContent editor={editor} />
      </div>

      {/* Helper text */}
      <div className="bg-gray-50 border-t px-3 py-1.5">
        <p className="text-[10px] text-gray-400">
          Supports rich text, math symbols (∑ Math), LaTeX formulas, code blocks, and images. Pasted formulas are auto-detected and preserved.
        </p>
      </div>
    </div>
  );
}
