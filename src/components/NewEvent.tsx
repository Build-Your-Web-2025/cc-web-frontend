"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  department?: string;
  imageUrl?: string;
}

interface NewEventProps {
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export default function NewEvent({ onClose, onEventCreated }: NewEventProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=9abdfc8259278993fe03e52c22e5bada`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("ImgBB upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date) {
      toast.error("Please fill in title and date");
      return;
    }

    try {
      let uploadedImageUrl = "";

      // Upload image to ImgBB if present
      if (imageFile) {
        setIsUploading(true);
        try {
          uploadedImageUrl = await uploadToImgBB(imageFile);
          toast.success("Image uploaded successfully!");
        } catch (error) {
          toast.error("Failed to upload image. Creating event without image.");
          console.error("Image upload error:", error);
        } finally {
          setIsUploading(false);
        }
      }

      setIsSubmitting(true);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login as admin to create events");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/events/newevent",
        {
          title: title.trim(),
          description: description.trim(),
          date,
          location: location.trim(),
          department: department || undefined,
          imageUrl: uploadedImageUrl || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Event created successfully!");
      onEventCreated(response.data);
      onClose();
    } catch (err: unknown) {
      console.error("Create event error:", err);
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to create event"
        : "Failed to create event";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Event</h2>
          <button
            onClick={onClose}
            className="hover:bg-accent rounded-full p-1"
            disabled={isUploading || isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event..."
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <div>
            <Label htmlFor="date">
              Event Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="BCA">BCA</SelectItem>
                <SelectItem value="ECE">Electronics</SelectItem>
                <SelectItem value="ME">Mechanical</SelectItem>
                <SelectItem value="CE">Civil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Event Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max size: 5MB. Formats: JPG, PNG, GIF
            </p>
          </div>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isUploading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isUploading || isSubmitting}
            >
              {isUploading
                ? "Uploading Image..."
                : isSubmitting
                ? "Creating..."
                : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
