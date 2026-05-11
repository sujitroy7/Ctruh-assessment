"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RadioButton, { RadioGroup } from "@/components/ui/RadioButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormType = "create" | "update";

export interface ProductType {
  id: string;
  title: string;
}

export interface ApiProductItem {
  _id: string;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
}

export interface ApiProduct {
  _id: string;
  name: string;
  type: string;
  items: ApiProductItem[];
}

interface ItemForm {
  id: string;
  gender: Gender;
  color: string;
  price: string;
  stock: string;
  images: File[];
  previewUrls: string[];
}

interface ProductForm {
  name: string;
  type: string;
  items: ItemForm[];
}

interface ProductFormProps {
  formType: FormType;
  productTypes: ProductType[];
  initialData?: ApiProduct;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDERS: Gender[] = ["male", "female", "unisex"];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function newItem(): ItemForm {
  return {
    id: crypto.randomUUID(),
    gender: "unisex",
    color: "#6366f1",
    price: "",
    stock: "",
    images: [],
    previewUrls: [],
  };
}

function itemFromApi(item: ApiProductItem): ItemForm {
  return {
    id: item._id,
    gender: item.gender as Gender,
    color: item.color,
    price: String(item.price),
    stock: String(item.stock),
    images: [],
    previewUrls: item.images,
  };
}

// ─── Item Card ────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ItemForm;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<ItemForm>) => void;
  onRemove: () => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (imgIdx: number) => void;
}

function ItemCard({
  item,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onAddImages,
  onRemoveImage,
}: ItemCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Item {index + 1}
        </span>
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            type="button"
            onClick={onRemove}
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4 text-error-500" />
          </Button>
        )}
      </div>

      <RadioGroup name={`gender-${item.id}`} label="Gender">
        <div className="flex flex-wrap items-center gap-5">
          {GENDERS.map((g) => (
            <RadioButton
              key={g}
              label={capitalize(g)}
              value={g}
              checked={item.gender === g}
              onChange={() => onUpdate({ gender: g })}
            />
          ))}
        </div>
      </RadioGroup>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-ink-soft">
            Color
          </label>
          <div
            className={clsx(
              "flex items-center gap-2.5 rounded-md border border-border bg-surface",
              "px-3.5 py-2.5 transition-colors",
              "focus-within:ring-2 focus-within:border-primary-500 focus-within:ring-primary-100",
            )}
          >
            <input
              type="color"
              value={item.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              aria-label="Choose color"
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
            />
            <span className="text-sm font-mono text-ink">{item.color}</span>
          </div>
        </div>

        <Input
          label="Price (₹)"
          type="number"
          min={0}
          placeholder="e.g. 599"
          value={item.price}
          onChange={(e) => onUpdate({ price: e.target.value })}
        />

        <Input
          label="Stock"
          type="number"
          min={0}
          placeholder="e.g. 10"
          value={item.stock}
          onChange={(e) => onUpdate({ stock: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-ink-soft">
          Images
        </label>
        <div className="flex flex-wrap gap-3">
          {item.previewUrls.map((url, imgIdx) => (
            <div
              key={imgIdx}
              className="relative w-20 h-20 rounded-md overflow-hidden border border-border group shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Preview ${imgIdx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(imgIdx)}
                aria-label="Remove image"
                className={clsx(
                  "absolute top-1 right-1 w-5 h-5 rounded-full",
                  "bg-neutral-900/70 text-ink-inverse flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload images"
            className={clsx(
              "w-20 h-20 shrink-0 rounded-md border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-1",
              "text-ink-muted hover:text-ink-soft hover:border-primary-400 hover:bg-primary-50",
              "transition-colors cursor-pointer",
            )}
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs">Upload</span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Image file upload"
          className="sr-only"
          onChange={(e) => {
            onAddImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export default function ProductForm({
  formType,
  productTypes,
  initialData,
}: ProductFormProps) {
  const isUpdate = formType === "update";

  const [form, setForm] = useState<ProductForm>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        type: initialData.type,
        items: initialData.items.map(itemFromApi),
      };
    }
    return {
      name: "",
      type: productTypes[0]?.id ?? "",
      items: [newItem()],
    };
  });

  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(itemId: string, patch: Partial<ItemForm>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem()] }));
  }

  function removeItem(itemId: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  }

  function addImages(itemId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              images: [...item.images, ...newFiles],
              previewUrls: [...item.previewUrls, ...newUrls],
            }
          : item,
      ),
    }));
  }

  function removeImage(itemId: string, imgIdx: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        URL.revokeObjectURL(item.previewUrls[imgIdx]);
        return {
          ...item,
          images: item.images.filter((_, i) => i !== imgIdx),
          previewUrls: item.previewUrls.filter((_, i) => i !== imgIdx),
        };
      }),
    }));
  }

  async function handleSave() {
    setSaving(true);
    if (isUpdate) {
      // TODO: PATCH /api/products/:id
    } else {
      // TODO: POST /api/products
    }
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }

  const title = isUpdate ? "Edit Product" : "Add Product";
  const buttonLabel = isUpdate ? "Update Product" : "Create Product";
  const loadingText = isUpdate ? "Updating…" : "Creating…";

  return (
    <div className="min-h-screen bg-canvas">
      {/* Sticky top bar */}
      <div className="px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/admin/products">
              <Button
                variant="ghost"
                iconOnly
                type="button"
                aria-label="Back to products"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-ink truncate">{title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 pt-4 flex flex-col gap-6">
        {/* ── Product Info ─────────────────────────────────────────────────── */}
        <section className="rounded-lg border border-border bg-surface shadow-card p-5 sm:p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-ink">Product Info</h2>

          <Input
            label="Product Name"
            placeholder="e.g. Classic Cotton Tee"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="product-type"
              className="block text-sm font-medium text-ink-soft"
            >
              Product Type
            </label>
            <select
              id="product-type"
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className={clsx(
                "w-full rounded-md border border-border bg-surface text-ink",
                "px-3.5 py-2.5 text-sm outline-none transition-colors",
                "focus:ring-2 focus:border-primary-500 focus:ring-primary-100",
                "disabled:bg-neutral-50 disabled:text-ink-disabled disabled:cursor-not-allowed",
              )}
            >
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Items ────────────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Items</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Each item is a unique gender + color variant with its own price
              and stock.
            </p>
          </div>

          {form.items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border bg-surface p-10 text-center">
              <p className="text-sm text-ink-muted">
                No items yet.{" "}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Add one
                </button>{" "}
                to get started.
              </p>
            </div>
          ) : (
            form.items.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                index={idx}
                canRemove={form.items.length > 1}
                onUpdate={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                onAddImages={(files) => addImages(item.id, files)}
                onRemoveImage={(imgIdx) => removeImage(item.id, imgIdx)}
              />
            ))
          )}

          {form.items.length > 0 && (
            <Button
              variant="secondary"
              type="button"
              leftIcon={<Plus />}
              onClick={addItem}
            >
              Add Another Item
            </Button>
          )}
        </section>

        {/* ── Bottom save ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link href="/admin/products">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="button"
            loading={saving}
            loadingText={loadingText}
            onClick={handleSave}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
