"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Send, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";

interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    department?: string;
    year?: string;
    avatarUrl?: string;
  };
  content: string;
  imageUrl?: string;
  tags?: string[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface NewPostProps {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

export default function NewPost({ onClose, onPostCreated }: NewPostProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
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
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
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

    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }

    setIsLoading(true);

    try {
      // Check for both user token and admin token
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login to create a post");
        setIsLoading(false);
        return;
      }

      let uploadedImageUrl = null;

      // Upload image to ImgBB if present
      if (imageFile) {
        setIsUploading(true);
        try {
          uploadedImageUrl = await uploadToImgBB(imageFile);
          toast.success("Image uploaded successfully!");
        } catch (error) {
          toast.error("Failed to upload image. Posting without image.");
          console.error("Image upload error:", error);
        } finally {
          setIsUploading(false);
        }
      }

      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const response = await axios.post(
        "http://localhost:5000/api/posts/newpost",
        {
          content: content.trim(),
          imageUrl: uploadedImageUrl,
          tags: tagsArray.length > 0 ? tagsArray : [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Post created successfully!");
      onPostCreated(response.data);
      onClose();
    } catch (err) {
      console.error("Create post error:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message || "Failed to create post";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to create post");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Create a Post</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">
                Content <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="content"
                className="w-full min-h-[150px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="What's on your mind? Share your thoughts, ideas, or questions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                {content.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                Image <span className="text-muted-foreground">(Optional)</span>
              </Label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading || isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={600}
                    height={300}
                    className="w-full h-auto max-h-64 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={isLoading || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="tags"
                type="text"
                placeholder="technology, programming, campus-life"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
