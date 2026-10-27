"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";

export type SearchOption = {
  id: string;
  label: string;
  meta?: string;
  keywords?: string;
  disabled?: boolean;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  empty = "No hay opciones disponibles.",
}: {
  options: SearchOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  empty?: string;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const indexed = useMemo(
    () =>
      options.map((option) => ({
        option,
        text: normalize(`${option.label} ${option.keywords ?? ""}`),
      })),
    [options],
  );

  const selected = options.find((option) => option.id === value) ?? null;

  const matches = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return indexed;
    return indexed.filter((entry) => entry.text.includes(term));
  }, [indexed, query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = list.current;
    const item = container?.children[active] as HTMLElement | undefined;
    if (!container || !item) return;
    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    if (itemRect.top < containerRect.top) {
      container.scrollTop -= containerRect.top - itemRect.top;
    } else if (itemRect.bottom > containerRect.bottom) {
      container.scrollTop += itemRect.bottom - containerRect.bottom;
    }
  }, [active, open]);

  const choose = (option: SearchOption) => {
    if (option.disabled) return;
    onChange(option.id);
    setQuery("");
    setOpen(false);
  };

  const openList = () => {
    const index = options.findIndex((option) => option.id === value);
    setQuery("");
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  return (
    <div className="search-select" ref={root}>
      <Search size={16} aria-hidden />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-required
        aria-activedescendant={
          open && matches[active]
            ? `${listId}-${matches[active].option.id}`
            : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        value={open ? query : selected ? selected.label : ""}
        onFocus={openList}
        onClick={() => {
          if (!open) openList();
        }}
        onBlur={() => {
          setQuery("");
          setOpen(false);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              openList();
              return;
            }
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((index) =>
              matches.length === 0
                ? 0
                : (index + step + matches.length) % matches.length,
            );
            return;
          }
          if (event.key === "Enter" && open) {
            event.preventDefault();
            const entry = matches[active];
            if (entry) choose(entry.option);
            return;
          }
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setQuery("");
            setOpen(false);
          }
        }}
      />
      {selected && !open && (
        <button
          type="button"
          aria-label="Quitar selección"
          onClick={() => {
            onChange("");
            setQuery("");
          }}
        >
          <X size={13} />
        </button>
      )}
      {open && (
        <div
          className="search-select-menu"
          onClick={(event) => event.stopPropagation()}
        >
          {matches.length === 0 ? (
            <p className="search-select-empty">
              {options.length === 0
                ? empty
                : `Sin resultados para “${query.trim()}”.`}
            </p>
          ) : (
            <ul id={listId} role="listbox" ref={list}>
              {matches.map(({ option }, index) => (
                <li
                  key={option.id}
                  id={`${listId}-${option.id}`}
                  role="option"
                  aria-selected={option.id === value}
                  aria-disabled={option.disabled || undefined}
                  className={index === active ? "is-active" : undefined}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  <span>{option.label}</span>
                  {option.meta && <small>{option.meta}</small>}
                  {option.id === value && <Check size={13} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
