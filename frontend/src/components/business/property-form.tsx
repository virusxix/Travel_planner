"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FormField } from "@/components/ui/input";
import { ImageUploader } from "@/components/shared/image-uploader";
import { PROPERTY_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";
import type { Property } from "@/types";

export interface PropertyFormValues {
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  amenityIds: string[];
  imageUrls: string[];
}

const empty: PropertyFormValues = {
  name: "",
  type: "HOMESTAY",
  description: "",
  address: "",
  city: "",
  country: "",
  latitude: 0,
  longitude: 0,
  contactPhone: "",
  contactEmail: "",
  amenityIds: [],
  imageUrls: [],
};

export function propertyToForm(p: Property): PropertyFormValues {
  return {
    name: p.name,
    type: p.type,
    description: p.description,
    address: p.address,
    city: p.city,
    country: p.country,
    latitude: p.latitude,
    longitude: p.longitude,
    contactPhone: p.contactPhone,
    contactEmail: p.contactEmail,
    amenityIds: p.amenities?.map((a) => a.amenity.id) ?? [],
    imageUrls: [],
  };
}

export function PropertyForm({
  initial,
  onSubmit,
  loading,
  submitLabel,
}: {
  initial?: PropertyFormValues;
  onSubmit: (values: PropertyFormValues) => void;
  loading?: boolean;
  submitLabel: string;
}) {
  const [values, setValues] = useState<PropertyFormValues>(initial ?? empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: amenities } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => api<{ id: string; name: string }[]>("/amenities"),
  });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (values.name.length < 2) e.name = "Name is required";
    if (values.description.length < 20) e.description = "Description must be at least 20 characters";
    if (values.address.length < 5) e.address = "Address is required";
    if (values.city.length < 2) e.city = "City is required";
    if (values.country.length < 2) e.country = "Country is required";
    if (!values.contactPhone) e.contactPhone = "Phone is required";
    if (!values.contactEmail.includes("@")) e.contactEmail = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  }

  function set<K extends keyof PropertyFormValues>(key: K, val: PropertyFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <FormField label="Property name" error={errors.name}>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} />
      </FormField>

      <FormField label="Property type">
        <Select value={values.type} onChange={(e) => set("type", e.target.value)}>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Description" error={errors.description}>
        <Textarea rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Country" error={errors.country}>
          <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
        </FormField>
        <FormField label="City" error={errors.city}>
          <Input value={values.city} onChange={(e) => set("city", e.target.value)} />
        </FormField>
      </div>

      <FormField label="Address" error={errors.address}>
        <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Latitude">
          <Input type="number" step="any" value={values.latitude} onChange={(e) => set("latitude", parseFloat(e.target.value) || 0)} />
        </FormField>
        <FormField label="Longitude">
          <Input type="number" step="any" value={values.longitude} onChange={(e) => set("longitude", parseFloat(e.target.value) || 0)} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contact phone" error={errors.contactPhone}>
          <Input value={values.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </FormField>
        <FormField label="Contact email" error={errors.contactEmail}>
          <Input type="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </FormField>
      </div>

      {amenities && amenities.length > 0 && (
        <FormField label="Amenities">
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const checked = values.amenityIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    set(
                      "amenityIds",
                      checked ? values.amenityIds.filter((id) => id !== a.id) : [...values.amenityIds, a.id]
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    checked ? "pill-active" : "pill-inactive"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </FormField>
      )}

      <ImageUploader images={values.imageUrls} onChange={(urls) => set("imageUrls", urls)} />

      <Button type="submit" className="w-full rounded-2xl h-12" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
