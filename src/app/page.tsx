"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
}

const FIELD_TYPES = [
  { type: "text", label: "Text Input", icon: "> text" },
  { type: "textarea", label: "Text Area", icon: "> textarea" },
  { type: "number", label: "Number", icon: "> number" },
  { type: "email", label: "Email", icon: "> email" },
  { type: "password", label: "Password", icon: "> password" },
  { type: "select", label: "Dropdown", icon: "> select" },
  { type: "checkbox", label: "Checkbox", icon: "> checkbox" },
  { type: "radio", label: "Radio Group", icon: "> radio" },
  { type: "date", label: "Date Picker", icon: "> date" },
  { type: "file", label: "File Upload", icon: "> file" },
];

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "preview" | "json">("build");
  const [formTitle, setFormTitle] = useState("My Form");
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedField = fields.find((f) => f.id === selectedId);

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: `${FIELD_TYPES.find((t) => t.type === type)?.label || type}`,
      placeholder: `Enter ${type}...`,
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1", "Option 2", "Option 3"] : [],
    };
    setFields([...fields, newField]);
    setSelectedId(newField.id);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveField = (from: number, to: number) => {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFields(updated);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Drag handlers
  const handleDragStart = (e: DragEvent, type: string) => {
    setDraggedType(type);
    e.dataTransfer.setData("fieldType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const type = e.dataTransfer.getData("fieldType");
    if (type) {
      addField(type);
    }
    setDraggedType(null);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const generateJson = () => {
    return JSON.stringify(
      {
        title: formTitle,
        fields: fields.map((f) => ({
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          ...(f.options.length > 0 ? { options: f.options } : {}),
        })),
      },
      null,
      2
    );
  };

  const handlePreviewChange = (fieldId: string, value: string) => {
    setPreviewValues({ ...previewValues, [fieldId]: value });
  };

  const handleSubmitPreview = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(generateJson());
  };

  const exportJson = () => {
    const blob = new Blob([generateJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderPreviewField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            className="crt-input"
            rows={3}
            style={{ pointerEvents: "auto" }}
            onChange={(e) => handlePreviewChange(field.id, e.target.value)}
          />
        );
      case "select":
        return (
          <select
            className="crt-input"
            style={{ pointerEvents: "auto" }}
            onChange={(e) => handlePreviewChange(field.id, e.target.value)}
          >
            <option value="">-- Select --</option>
            {field.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="flex flex-col gap-2" style={{ pointerEvents: "auto" }}>
            {field.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-[var(--text-dim)]">
                <input type="checkbox" className="w-4 h-4 accent-[var(--crt-green)]" />
                {opt}
              </label>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="flex flex-col gap-2" style={{ pointerEvents: "auto" }}>
            {field.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-[var(--text-dim)]">
                <input type="radio" name={field.id} className="w-4 h-4 accent-[var(--crt-green)]" />
                {opt}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="crt-input"
            style={{ pointerEvents: "auto" }}
            onChange={(e) => handlePreviewChange(field.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl crt-glow-intense">⚙</span>
          <div>
            <h1 className="text-xl font-bold tracking-wider crt-glow">FormBuilder</h1>
            <p className="text-[12px] text-[var(--text-dim)]">CRT Form Generator v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex">
            {(["build", "preview", "json"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`crt-tab ${activeTab === tab ? "active" : ""}`}
              >
                [{tab.toUpperCase()}]
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <span className="w-2 h-2 rounded-full bg-[var(--crt-green)] inline-block cursor-blink"></span>
            <span className="text-[var(--text-dim)]">SYSTEM OK</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Component Palette */}
        <aside className="w-56 border-r border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-sm text-[var(--crt-amber)] mb-2 tracking-wider">// FORM TITLE</h2>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="crt-input text-sm"
            />
          </div>

          <h2 className="text-sm text-[var(--crt-amber)] mb-2 tracking-wider">// COMPONENTS</h2>
          <p className="text-[11px] text-[var(--text-dim)] mb-3">Drag to canvas or click to add</p>
          <div className="space-y-1.5">
            {FIELD_TYPES.map((ft) => (
              <div
                key={ft.type}
                draggable
                onDragStart={(e) => handleDragStart(e, ft.type)}
                onClick={() => addField(ft.type)}
                className={`drag-item text-sm ${draggedType === ft.type ? "dragging" : ""}`}
              >
                <span className="text-[var(--crt-cyan)]">{ft.icon}</span>
                <span className="ml-2 text-[var(--text-dim)]">{ft.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-dim)]">
              <p>Fields: <span className="text-[var(--crt-green)]">{fields.length}</span></p>
              <p>Selected: <span className="text-[var(--crt-amber)]">{selectedField?.label || "none"}</span></p>
            </div>
          </div>
        </aside>

        {/* Center — Canvas / Preview / JSON */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "build" && (
            <div className="flex-1 overflow-y-auto p-6" ref={canvasRef}>
              <div
                className={`drop-zone p-4 min-h-[400px] ${dragOver ? "drag-over" : ""} ${fields.length > 0 ? "has-items" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {fields.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[350px] text-center">
                    <div className="text-5xl mb-4 opacity-30">📋</div>
                    <p className="text-lg text-[var(--text-dim)] crt-glow">Drop components here</p>
                    <p className="text-sm text-[var(--text-dim)] mt-1">
                      Drag from left panel or click to add
                    </p>
                    <div className="mt-4 text-[11px] text-[var(--text-dim)]">
                      <span className="cursor-blink">█</span> Waiting for input...
                    </div>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`field-item ${selectedId === field.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(field.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[var(--text-dim)]">[{index + 1}]</span>
                        <span className="text-[11px] text-[var(--crt-amber)] uppercase">{field.type}</span>
                        {field.required && <span className="text-[11px] text-[var(--crt-red)]">*REQ</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveField(index, index - 1); }}
                            className="text-[11px] text-[var(--text-dim)] hover:text-[var(--crt-green)] px-1"
                          >
                            ▲
                          </button>
                        )}
                        {index < fields.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveField(index, index + 1); }}
                            className="text-[11px] text-[var(--text-dim)] hover:text-[var(--crt-green)] px-1"
                          >
                            ▼
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                          className="text-[11px] text-[var(--text-dim)] hover:text-[var(--crt-red)] px-1"
                        >
                          [DEL]
                        </button>
                      </div>
                    </div>
                    <div className="field-label">{field.label}</div>
                    {field.type === "textarea" ? (
                      <textarea className="crt-input" placeholder={field.placeholder} rows={2} readOnly />
                    ) : field.type === "select" ? (
                      <select className="crt-input" disabled>
                        <option>-- {field.placeholder} --</option>
                        {field.options.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "checkbox" || field.type === "radio" ? (
                      <div className="flex flex-col gap-1">
                        {field.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
                            <input type={field.type} disabled className="accent-[var(--crt-green)]" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input type={field.type} className="crt-input" placeholder={field.placeholder} readOnly />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-lg mx-auto crt-box p-6 bg-[var(--bg)]">
                <h2 className="text-xl crt-glow-intense mb-1">{formTitle}</h2>
                <p className="text-sm text-[var(--text-dim)] mb-6">// form preview — interactive mode</p>

                {fields.length === 0 ? (
                  <p className="text-[var(--text-dim)]">No fields to preview. Add some in [BUILD] mode.</p>
                ) : (
                  <div className="space-y-5">
                    {fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm text-[var(--crt-cyan)] mb-1.5">
                          {field.label}
                          {field.required && <span className="text-[var(--crt-red)] ml-1">*</span>}
                        </label>
                        {renderPreviewField(field)}
                      </div>
                    ))}
                    <button
                      onClick={handleSubmitPreview}
                      className="w-full py-2 mt-4 border border-[var(--crt-green)] text-[var(--crt-green)] hover:bg-[var(--crt-green)] hover:text-[var(--bg)] transition font-bold tracking-wider"
                    >
                      {submitted ? "> FORM SUBMITTED ✓" : "> SUBMIT"}
                    </button>
                    {submitted && (
                      <div className="crt-box-amber p-3 text-[var(--crt-amber)] text-sm mt-2">
                        ✓ Form submitted successfully! Check console for data.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "json" && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm text-[var(--crt-amber)] tracking-wider">// JSON SCHEMA</h2>
                <div className="flex gap-2">
                  <button onClick={copyJson} className="text-[11px] text-[var(--text-dim)] hover:text-[var(--crt-green)] border border-[var(--border)] px-3 py-1 transition">
                    [COPY]
                  </button>
                  <button onClick={exportJson} className="text-[11px] text-[var(--text-dim)] hover:text-[var(--crt-amber)] border border-[var(--border)] px-3 py-1 transition">
                    [EXPORT .JSON]
                  </button>
                </div>
              </div>
              <pre className="json-preview">
                {generateJson()}
              </pre>
            </div>
          )}
        </main>

        {/* Right Panel — Properties */}
        {activeTab === "build" && (
          <aside className="w-64 border-l border-[var(--border)] bg-[var(--bg-panel)] p-4 overflow-y-auto">
            {selectedField ? (
              <>
                <h2 className="text-sm text-[var(--crt-amber)] mb-4 tracking-wider">// PROPERTIES</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] text-[var(--text-dim)] block mb-1">TYPE</label>
                    <div className="text-[var(--crt-cyan)] text-sm uppercase">{selectedField.type}</div>
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--text-dim)] block mb-1">LABEL</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      className="crt-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--text-dim)] block mb-1">PLACEHOLDER</label>
                    <input
                      type="text"
                      value={selectedField.placeholder}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      className="crt-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                        className="w-4 h-4 accent-[var(--crt-green)]"
                      />
                      <span className="text-sm text-[var(--text-dim)]">Required</span>
                    </label>
                  </div>
                  {(selectedField.type === "select" || selectedField.type === "checkbox" || selectedField.type === "radio") && (
                    <div>
                      <label className="text-[11px] text-[var(--text-dim)] block mb-1">OPTIONS</label>
                      <div className="space-y-1.5">
                        {selectedField.options.map((opt, i) => (
                          <div key={i} className="flex gap-1">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...selectedField.options];
                                newOpts[i] = e.target.value;
                                updateField(selectedField.id, { options: newOpts });
                              }}
                              className="crt-input text-sm flex-1"
                            />
                            <button
                              onClick={() => {
                                const newOpts = selectedField.options.filter((_, j) => j !== i);
                                updateField(selectedField.id, { options: newOpts });
                              }}
                              className="text-[var(--text-dim)] hover:text-[var(--crt-red)] px-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateField(selectedField.id, { options: [...selectedField.options, `Option ${selectedField.options.length + 1}`] })}
                          className="text-[11px] text-[var(--crt-green)] hover:text-[var(--crt-green-dim)]"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <button
                      onClick={() => removeField(selectedField.id)}
                      className="w-full py-1.5 border border-[var(--crt-red)] text-[var(--crt-red)] hover:bg-[var(--crt-red)] hover:text-[var(--bg)] text-sm transition"
                    >
                      [DELETE FIELD]
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-[var(--text-dim)] mt-8">
                <p className="text-lg mb-2">⚙</p>
                <p className="text-sm">Select a field to edit</p>
                <p className="text-[11px] mt-1">Click on any field in the canvas</p>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar flex items-center justify-between">
        <span>MODE: [{activeTab.toUpperCase()}] | FIELDS: {fields.length} | {formTitle}</span>
        <span>FormBuilder CRT v1.0 · Built with ☕ · Documented by MiMo v2.5 Pro</span>
      </div>
    </div>
  );
}
