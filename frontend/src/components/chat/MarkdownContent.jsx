import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function MarkdownContent({ content }) {
  if (!content) return null;

  // Split into code blocks and normal text blocks
  const parts = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      value: match[2]
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-3 leading-relaxed text-xs">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} language={part.language} code={part.value} />;
        }
        return <FormattedText key={pIdx} text={part.value} />;
      })}
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-studio-border bg-[#0B0D19] overflow-hidden my-2 shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-studio-border bg-studio-elevated/80 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Terminal className="h-3 w-3 text-studio-cyan" />
          <span className="uppercase font-semibold tracking-wider">{language || 'PROMPT / CODE'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono text-studio-cyan-light overflow-x-auto whitespace-pre-wrap break-words leading-relaxed selection:bg-studio-purple selection:text-white">
        {code.trim()}
      </pre>
    </div>
  );
}

function FormattedText({ text }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-display text-sm font-bold text-white pt-2 pb-0.5 border-b border-studio-border/40 text-studio-purple-light">
              {renderInlineSpans(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-display text-base font-bold text-white pt-2.5 pb-1 border-b border-studio-border/60 text-white">
              {renderInlineSpans(trimmed.substring(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-display text-lg font-extrabold text-white pt-3 pb-1 text-transparent bg-clip-text bg-gradient-to-r from-studio-purple-light to-studio-cyan">
              {renderInlineSpans(trimmed.substring(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="h-1.5 w-1.5 rounded-full bg-studio-purple shrink-0 mt-1.5" />
              <p className="flex-1 text-slate-200">
                {renderInlineSpans(trimmed.substring(2))}
              </p>
            </div>
          );
        }

        // Dialogue pattern: CHARACTER (EMOTION): "..."
        const dialogueMatch = trimmed.match(/^([A-Z0-9\s_-]+(?:\s*\([^)]+\))?):\s*(".*"|'.*')$/);
        if (dialogueMatch) {
          return (
            <div key={idx} className="my-1 pl-3 border-l-2 border-studio-cyan bg-studio-cyan/5 py-1 rounded-r-md">
              <span className="font-bold text-studio-cyan text-[11px] uppercase tracking-wider">
                {dialogueMatch[1]}:
              </span>{' '}
              <span className="italic text-slate-100">{dialogueMatch[2]}</span>
            </div>
          );
        }

        // Sound effect: *SFX: ...* or *DON!*
        if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
          return (
            <p key={idx} className="text-pink-400 font-semibold italic tracking-wide pl-1">
              {trimmed}
            </p>
          );
        }

        // Normal text line
        return (
          <p key={idx} className="text-slate-200">
            {renderInlineSpans(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineSpans(text) {
  // Parses `code`, **bold**, *italic*
  const parts = [];
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="rounded bg-[#0D1022] border border-studio-border/80 px-1.5 py-0.5 text-[11px] text-studio-cyan font-mono">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
