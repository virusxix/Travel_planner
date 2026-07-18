/**
 * Tiny markdown renderer for AI chat — bold, headings, lists, paragraphs.
 */

function inlineBold(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function lineType(line) {
  const t = line.trim();
  if (/^#{1,3}\s+/.test(t)) return 'heading';
  if (/^[-*•]\s+/.test(t)) return 'bullet';
  if (/^\d+[.)]\s+/.test(t)) return 'number';
  if (!t) return 'blank';
  return 'text';
}

export default function ChatMarkdown({ content }) {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const type = lineType(lines[i]);

    if (type === 'blank') {
      i += 1;
      continue;
    }

    if (type === 'heading') {
      const raw = lines[i].trim();
      const level = (raw.match(/^#+/) || ['#'])[0].length;
      const text = raw.replace(/^#{1,3}\s+/, '');
      const Tag = level === 1 ? 'h3' : 'h4';
      blocks.push(
        <Tag
          key={`h-${i}`}
          className={`font-semibold text-neutral-900 tracking-tight ${
            level === 1 ? 'text-[15px] mt-4 mb-2' : 'text-[14px] mt-3 mb-1.5'
          }`}
        >
          {inlineBold(text)}
        </Tag>
      );
      i += 1;
      continue;
    }

    if (type === 'bullet' || type === 'number') {
      const items = [];
      const start = i;
      const listKind = type;
      while (i < lines.length && (lineType(lines[i]) === 'bullet' || lineType(lines[i]) === 'number')) {
        items.push(lines[i].trim().replace(/^([-*•]|\d+[.)])\s+/, ''));
        i += 1;
      }
      const ListTag = listKind === 'number' ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`l-${start}`}
          className={`my-2 space-y-1.5 pl-5 text-[14px] leading-[1.55] text-neutral-700 ${
            ListTag === 'ol' ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map((item, j) => (
            <li key={j} className="pl-0.5">
              {inlineBold(item)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    const para = [];
    const start = i;
    while (i < lines.length && lineType(lines[i]) === 'text') {
      para.push(lines[i].trim());
      i += 1;
    }
    const joined = para.join(' ');
    const isDay = /^(day\s+\d+|morning|afternoon|evening)\b/i.test(joined.replace(/\*\*/g, ''));
    blocks.push(
      <p
        key={`p-${start}`}
        className={`text-[14px] leading-[1.55] ${
          isDay ? 'mt-4 mb-1.5 font-semibold text-neutral-900' : 'my-1.5 text-neutral-700'
        }`}
      >
        {inlineBold(joined)}
      </p>
    );
  }

  return <div className="chat-md">{blocks}</div>;
}
