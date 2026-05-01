import React, { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY_PREFIX = "annotations_";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function findNearestSection(x, y) {
  const sections = document.querySelectorAll("[data-section]");
  if (!sections.length) return null;

  let nearest = null;
  let minDist = Infinity;

  sections.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = el.getAttribute("data-section");
    }
  });

  return nearest;
}

/**
 * Capture meaningful DOM context under a click point.
 * Walks up from the clicked element to find a meaningful container,
 * then extracts its outer HTML (truncated) and text content.
 */
function captureDomContext(clientX, clientY) {
  // Temporarily hide annotation bubbles so elementFromPoint hits the real content
  const bubbles = document.querySelectorAll("[data-annotation-id]");
  bubbles.forEach((b) => { b.style.pointerEvents = "none"; b.style.visibility = "hidden"; });

  const el = document.elementFromPoint(clientX, clientY);

  bubbles.forEach((b) => { b.style.pointerEvents = ""; b.style.visibility = ""; });

  if (!el) return { tag: "unknown", text: "", html: "" };

  // Walk up to find the nearest meaningful element (not a generic wrapper)
  const meaningfulTags = new Set(["H1","H2","H3","H4","P","BUTTON","A","LI","SPAN","LABEL","STRONG","EM","DIV"]);
  let target = el;
  // If it's a very generic div, look for the closest parent with actual text
  for (let i = 0; i < 5; i++) {
    if (!target.parentElement) break;
    const text = (target.textContent || "").trim();
    if (text.length > 10 && text.length < 500) break;
    if (text.length >= 500) break; // good enough
    target = target.parentElement;
  }

  const text = (target.textContent || "").trim().slice(0, 300);
  // Get a simplified outer HTML (strip long style attributes for readability)
  let html = target.outerHTML || "";
  // Truncate HTML to something reasonable
  if (html.length > 600) html = html.slice(0, 600) + "...";

  return {
    tag: target.tagName || "unknown",
    text,
    html,
  };
}

function formatAnnotationsForExport(annotations, variant) {
  const label = variant ? variant.toUpperCase() : "export";
  let output = `=== Annotations ${label} ===\n`;

  const sorted = [...annotations].sort((a, b) => a.y - b.y);
  sorted.forEach((ann, i) => {
    const section = ann.nearestSectionId
      ? `[Section: ${ann.nearestSectionId}]`
      : "[Section: unknown]";
    output += `\n--- Commentaire ${i + 1} ---\n`;
    output += `${section} (x: ${Math.round(ann.x)}, y: ${Math.round(ann.y)})\n`;
    output += `> ${ann.text || "(vide)"}\n`;
    if (ann.domContext) {
      output += `\nElement sous le commentaire: <${ann.domContext.tag}>\n`;
      output += `Texte: "${ann.domContext.text}"\n`;
      output += `HTML:\n${ann.domContext.html}\n`;
    }
  });

  return output;
}

// --- Styles ---

const headerStyle = {
  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 200,
  background: "rgba(30,30,46,0.95)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 16px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 14,
  color: "#e0e0e0",
  flexWrap: "wrap",
};

const btnBase = {
  border: "none",
  borderRadius: 6,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  transition: "background 0.15s, color 0.15s",
  whiteSpace: "nowrap",
};

const toggleActiveStyle = {
  ...btnBase,
  background: "#7c3aed",
  color: "#fff",
};

const toggleInactiveStyle = {
  ...btnBase,
  background: "#3a3a52",
  color: "#c4b5fd",
};

const actionBtnStyle = {
  ...btnBase,
  background: "#3a3a52",
  color: "#c4b5fd",
};

const countStyle = {
  marginLeft: "auto",
  color: "#a5a5c0",
  fontSize: 13,
};

function annotationContainerStyle(isActive) {
  return {
    position: "absolute",
    zIndex: 150,
    background: "#fff",
    border: "2px solid #7c3aed",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(124,58,237,0.18)",
    padding: 0,
    minWidth: 180,
    maxWidth: 300,
    display: "flex",
    flexDirection: "column",
    cursor: isActive ? "default" : "default",
  };
}

const textareaStyle = {
  border: "none",
  outline: "none",
  resize: "vertical",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 13,
  lineHeight: 1.4,
  padding: "8px 10px",
  borderRadius: "0 0 6px 6px",
  minHeight: 48,
  width: "100%",
  boxSizing: "border-box",
  background: "#fff",
  color: "#1e1e2e",
};

const readOnlyTextStyle = {
  ...textareaStyle,
  background: "#f8f7ff",
  cursor: "default",
  resize: "none",
};

const closeBtnStyle = {
  position: "absolute",
  top: -8,
  right: -8,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  fontSize: 13,
  lineHeight: "20px",
  textAlign: "center",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

// --- Sub-components ---

function AnnotationBubble({ annotation, isActive, onUpdate, onDelete }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isActive && annotation._isNew && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, annotation._isNew]);

  return (
    <div
      data-annotation-id={annotation.id}
      style={{
        ...annotationContainerStyle(isActive),
        left: annotation.x,
        top: annotation.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isActive && (
        <button
          style={closeBtnStyle}
          title="Supprimer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(annotation.id);
          }}
        >
          x
        </button>
      )}
      {isActive ? (
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          value={annotation.text}
          placeholder="Votre commentaire..."
          onChange={(e) => onUpdate(annotation.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div style={readOnlyTextStyle}>
          {annotation.text || "(vide)"}
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export default function AnnotationOverlay({ variant, children }) {
  const storageKey = STORAGE_KEY_PREFIX + (variant || "default");
  const contentRef = useRef(null);

  const [active, setActive] = useState(false);
  const [annotations, setAnnotations] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      const toSave = annotations.map(({ _isNew, ...rest }) => {
        // Truncate domContext.html for storage (keep it reasonable)
        if (rest.domContext && rest.domContext.html && rest.domContext.html.length > 800) {
          rest = { ...rest, domContext: { ...rest.domContext, html: rest.domContext.html.slice(0, 800) + "..." } };
        }
        return rest;
      });
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // storage full or unavailable
    }
  }, [annotations, storageKey]);

  const handleContentClick = useCallback(
    (e) => {
      if (!active) return;

      // Don't create annotation if clicking on an existing annotation or button
      if (
        e.target.closest("[data-annotation-id]") ||
        e.target.closest("button") ||
        e.target.closest("textarea")
      ) {
        return;
      }

      const container = contentRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const sectionId = findNearestSection(e.clientX, e.clientY);
      const domContext = captureDomContext(e.clientX, e.clientY);

      const newAnnotation = {
        id: generateId(),
        x: Math.round(x),
        y: Math.round(y),
        text: "",
        timestamp: Date.now(),
        nearestSectionId: sectionId,
        domContext,
        _isNew: true,
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
    },
    [active]
  );

  const handleUpdate = useCallback((id, text) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, text, _isNew: false } : a))
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleCopyAll = useCallback(() => {
    const text = formatAnnotationsForExport(annotations, variant);
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: select a temporary textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
  }, [annotations, variant]);

  const handleClearAll = useCallback(() => {
    setAnnotations([]);
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Header bar */}
      <div style={headerStyle}>
        <button
          style={active ? toggleActiveStyle : toggleInactiveStyle}
          onClick={() => setActive((v) => !v)}
        >
          Mode commentaire
        </button>

        <span style={countStyle}>
          {annotations.length} commentaire{annotations.length !== 1 ? "s" : ""}
        </span>

        <button
          style={{
            ...actionBtnStyle,
            opacity: annotations.length === 0 ? 0.4 : 1,
            pointerEvents: annotations.length === 0 ? "none" : "auto",
          }}
          onClick={handleCopyAll}
        >
          Copier tout
        </button>

        <button
          style={{
            ...actionBtnStyle,
            opacity: annotations.length === 0 ? 0.4 : 1,
            pointerEvents: annotations.length === 0 ? "none" : "auto",
          }}
          onClick={handleClearAll}
        >
          Effacer tout
        </button>
      </div>

      {/* Content area with annotations */}
      <div
        ref={contentRef}
        style={{ position: "relative", cursor: active ? "crosshair" : "default" }}
        onClick={handleContentClick}
      >
        {children}

        {annotations.map((ann) => (
          <AnnotationBubble
            key={ann.id}
            annotation={ann}
            isActive={active}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
