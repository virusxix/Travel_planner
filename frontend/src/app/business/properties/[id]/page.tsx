"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Plus, BedDouble } from "lucide-react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ImageGallery } from "@/components/shared/image-uploader";
import { RoomForm, type RoomFormValues } from "@/components/business/room-form";
import { useToast } from "@/components/shared/toast-provider";
import { formatCurrency } from "@/lib/utils";
import type { Property, Room } from "@/types";

interface RoomStats {
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  occupancyPercent: number;
}

function RoomStatsCard({ roomId }: { roomId: string }) {
  const { data } = useQuery({
    queryKey: ["room-stats", roomId],
    queryFn: () => api<RoomStats>(`/rooms/${roomId}/stats`),
  });
  if (!data) return null;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
      <div className="glass-card p-2 rounded-xl">
        <p className="text-muted">Total</p>
        <p className="font-bold">{data.totalRooms}</p>
      </div>
      <div className="glass-card p-2 rounded-xl">
        <p className="text-muted">Available</p>
        <p className="font-bold text-emerald-400">{data.availableRooms}</p>
      </div>
      <div className="glass-card p-2 rounded-xl">
        <p className="text-muted">Occupancy</p>
        <p className="font-bold gradient-brand-text">{data.occupancyPercent}%</p>
      </div>
    </div>
  );
}

export default function OwnerPropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [roomModal, setRoomModal] = useState<"add" | "edit" | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [deleteProperty, setDeleteProperty] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => api<Property>(`/properties/${id}`),
  });

  const createRoom = useMutation({
    mutationFn: (body: RoomFormValues) =>
      api(`/rooms/property/${id}`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      setRoomModal(null);
      toast({ title: "Room added", variant: "success" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const updateRoom = useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: RoomFormValues }) =>
      api(`/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...body,
          availableCount: body.availableCount ?? body.quantity,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      setRoomModal(null);
      setEditRoom(null);
      toast({ title: "Room updated", variant: "success" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const deleteRoomMut = useMutation({
    mutationFn: (roomId: string) => api(`/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      setDeleteRoom(null);
      toast({ title: "Room deleted", variant: "success" });
    },
  });

  const deletePropertyMut = useMutation({
    mutationFn: () => api(`/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Property deleted", variant: "success" });
      router.push("/business/properties");
    },
  });

  const submitProperty = useMutation({
    mutationFn: () => api(`/properties/${id}/submit`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast({ title: "Submitted for review", variant: "success" });
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => api(`/properties/${id}/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["property", id] }),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-surface p-8"><div className="h-64 rounded-2xl bg-white/5 animate-pulse max-w-3xl mx-auto" /></div>;
  }

  if (!property) {
    return <div className="min-h-screen bg-surface p-8 text-center text-muted">Property not found</div>;
  }

  const images = (property.images ?? []).map((img, i) => ({
    id: (img as { id?: string }).id ?? `img-${i}`,
    url: img.url,
  }));

  return (
    <div className="min-h-screen bg-surface px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link href="/business/properties" className="inline-flex items-center gap-2 text-sm text-violet-400 mb-6">
          <ArrowLeft className="h-4 w-4" /> Properties
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">{property.name}</h1>
            <p className="text-muted text-sm mt-1">{property.city}, {property.country}</p>
            <Badge className="mt-2" variant={property.status === "APPROVED" ? "success" : "warning"}>
              {property.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Link href={`/business/properties/${id}/edit`}>
              <Button variant="secondary" size="sm" className="rounded-xl gap-1">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="rounded-xl text-red-400" onClick={() => setDeleteProperty(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {property.status === "DRAFT" && (
          <Button className="mb-6 rounded-2xl w-full sm:w-auto" onClick={() => submitProperty.mutate()}>
            Submit for admin review
          </Button>
        )}

        <GlassCard hover={false} className="p-6 mb-6">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-sm text-muted">{property.description}</p>
          <p className="text-sm mt-4"><span className="text-muted">Address:</span> {property.address}</p>
          <p className="text-sm"><span className="text-muted">Contact:</span> {property.contactPhone} · {property.contactEmail}</p>
        </GlassCard>

        <GlassCard hover={false} className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Images</h2>
          <ImageGallery
            images={images}
            canDelete
            onDelete={(imageId) => deleteImage.mutate(imageId)}
          />
        </GlassCard>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-violet-400" /> Rooms
          </h2>
          <Button size="sm" className="rounded-xl gap-1" onClick={() => { setEditRoom(null); setRoomModal("add"); }}>
            <Plus className="h-4 w-4" /> Add room
          </Button>
        </div>

        <div className="space-y-4">
          {property.rooms?.map((room) => (
            <GlassCard key={room.id} hover={false} className="p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">{room.name}</p>
                  <p className="text-xs text-muted">{room.roomType} · {room.capacity} guests · {formatCurrency(Number(room.basePrice))}/night</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="rounded-lg" onClick={() => { setEditRoom(room); setRoomModal("edit"); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-lg text-red-400" onClick={() => setDeleteRoom(room)}>
                    Delete
                  </Button>
                </div>
              </div>
              <RoomStatsCard roomId={room.id} />
            </GlassCard>
          ))}
        </div>
      </div>

      <Modal open={roomModal !== null} onOpenChange={(o) => !o && setRoomModal(null)} title={roomModal === "add" ? "Add room" : "Edit room"}>
        <RoomForm
          showAvailability={roomModal === "edit"}
          initial={editRoom ? {
            name: editRoom.name,
            roomType: editRoom.roomType,
            capacity: editRoom.capacity,
            basePrice: Number(editRoom.basePrice),
            description: editRoom.description,
            quantity: editRoom.quantity,
            availableCount: editRoom.availableCount,
            imageUrls: [],
          } : undefined}
          submitLabel={roomModal === "add" ? "Add room" : "Save changes"}
          loading={createRoom.isPending || updateRoom.isPending}
          onSubmit={(body) => {
            if (roomModal === "add") createRoom.mutate(body);
            else if (editRoom) updateRoom.mutate({ roomId: editRoom.id, body });
          }}
        />
      </Modal>

      <Modal open={!!deleteRoom} onOpenChange={(o) => !o && setDeleteRoom(null)} title="Delete room?" description="This cannot be undone.">
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setDeleteRoom(null)}>Cancel</Button>
          <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700" onClick={() => deleteRoom && deleteRoomMut.mutate(deleteRoom.id)}>Delete</Button>
        </div>
      </Modal>

      <Modal open={deleteProperty} onOpenChange={setDeleteProperty} title="Delete property?" description="All rooms and images will be removed.">
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setDeleteProperty(false)}>Cancel</Button>
          <Button className="flex-1 rounded-xl bg-red-600" onClick={() => deletePropertyMut.mutate()}>Delete property</Button>
        </div>
      </Modal>
    </div>
  );
}
