"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { ImageUploader } from "@/components/shared/image-uploader";
import { ROOM_TYPES } from "@/lib/constants";
import type { Room } from "@/types";

export interface RoomFormValues {
  name: string;
  roomType: string;
  capacity: number;
  basePrice: number;
  description: string;
  quantity: number;
  availableCount?: number;
  imageUrls: string[];
}

export function roomToForm(r: Room): RoomFormValues {
  return {
    name: r.name,
    roomType: r.roomType,
    capacity: r.capacity,
    basePrice: Number(r.basePrice),
    description: r.description,
    quantity: r.quantity,
    availableCount: r.availableCount,
    imageUrls: [],
  };
}

const empty: RoomFormValues = {
  name: "",
  roomType: "DOUBLE",
  capacity: 2,
  basePrice: 50,
  description: "",
  quantity: 1,
  imageUrls: [],
};

export function RoomForm({
  initial,
  onSubmit,
  loading,
  submitLabel,
  showAvailability,
}: {
  initial?: RoomFormValues;
  onSubmit: (values: RoomFormValues) => void;
  loading?: boolean;
  submitLabel: string;
  showAvailability?: boolean;
}) {
  const [values, setValues] = useState<RoomFormValues>(initial ?? empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!values.name) e.name = "Room name required";
    if (values.description.length < 10) e.description = "Description min 10 chars";
    if (values.capacity < 1) e.capacity = "Capacity required";
    if (values.basePrice <= 0) e.basePrice = "Price required";
    if (values.quantity < 1) e.quantity = "Quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function set<K extends keyof RoomFormValues>(key: K, val: RoomFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <FormField label="Room name" error={errors.name}>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} />
      </FormField>
      <FormField label="Room type">
        <Select value={values.roomType} onChange={(e) => set("roomType", e.target.value)}>
          {ROOM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Capacity" error={errors.capacity}>
          <Input type="number" min={1} value={values.capacity} onChange={(e) => set("capacity", parseInt(e.target.value, 10))} />
        </FormField>
        <FormField label="Base price (USD)" error={errors.basePrice}>
          <Input type="number" min={1} step="0.01" value={values.basePrice} onChange={(e) => set("basePrice", parseFloat(e.target.value))} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Total quantity" error={errors.quantity}>
          <Input type="number" min={1} value={values.quantity} onChange={(e) => set("quantity", parseInt(e.target.value, 10))} />
        </FormField>
        {showAvailability && (
          <FormField label="Available now">
            <Input
              type="number"
              min={0}
              value={values.availableCount ?? values.quantity}
              onChange={(e) => set("availableCount", parseInt(e.target.value, 10))}
            />
          </FormField>
        )}
      </div>
      <FormField label="Description" error={errors.description}>
        <Textarea rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormField>
      <ImageUploader images={values.imageUrls} onChange={(urls) => set("imageUrls", urls)} label="Room images" max={6} />
      <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
