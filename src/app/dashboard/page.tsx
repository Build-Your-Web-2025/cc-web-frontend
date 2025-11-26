"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Heart,
  MessageCircle,
  Plus,
  Users,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import NewPost from "@/components/NewPost";
import axios from "axios";

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

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  department?: string;
  imageUrl?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    department: string;
    designation?: string;
  } | null;
  rsvps: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "events">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
  }, []);

  const fetchPosts = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get("http://localhost:5000/api/posts", {
        headers,
      });
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error("Fetch posts error:", err);
      toast.error("Failed to load posts");
    }
  };

  const fetchEvents = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        return;
      }

      const response = await axios.get("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Fetch events error:", err);
      toast.error("Failed to load events");
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleRSVP = async (eventId: string) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login to RSVP");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/rsvp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      // Refresh events to get updated RSVP list
      fetchEvents();
    } catch (err) {
      console.error("RSVP error:", err);
      toast.error("Failed to update RSVP");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login to like posts");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh posts to get updated like count
      fetchPosts();
    } catch (err) {
      console.error("Like post error:", err);
      toast.error("Failed to like post");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Campus Connect
            </h1>
            <p className="text-muted-foreground">
              Share ideas, connect with peers, and stay updated with campus
              events
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span className="text-red-600">Logout</span>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "posts"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "events"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Events
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "posts" ? (
              <>
                {/* Create Post Button */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent
                    className="p-6"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Plus className="w-5 h-5" />
                      <span>Share something with your peers...</span>
                    </div>
                  </CardContent>
                </Card>

                {/* New Post Modal */}
                {showCreatePost && (
                  <NewPost
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={handlePostCreated}
                  />
                )}

                {/* Posts Feed */}
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No posts yet. Be the first to share something!
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post._id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {post.author?.name || "Unknown User"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {post.author?.department && post.author?.year
                                ? `${post.author.department} - Year ${post.author.year}`
                                : post.author?.department || ""}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(post.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="mt-4 rounded-md w-full max-h-96 object-cover"
                          />
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <Separator />
                      <CardFooter className="pt-4 flex gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                          <span>{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span>0</span>
                        </button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </>
            ) : (
              /* Events List */
              <div className="space-y-6">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No events available at the moment.
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => {
                    const userId = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    )?._id;
                    const hasRSVP = event.rsvps.includes(userId);

                    return (
                      <Card key={event._id}>
                        {event.imageUrl && (
                          <div className="w-full h-48 overflow-hidden">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">
                                {event.title}
                              </h3>
                              <p className="text-muted-foreground">
                                {event.description}
                              </p>
                              {event.department && (
                                <p className="text-sm text-primary mt-2">
                                  {event.department}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{event.rsvps.length} attending</span>
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">
                              📍 {event.location}
                            </div>
                          )}
                          {event.createdBy && (
                            <div className="text-xs text-muted-foreground">
                              Organized by {event.createdBy.name}
                              {event.createdBy.designation &&
                                ` (${event.createdBy.designation})`}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => handleRSVP(event._id)}
                            variant={hasRSVP ? "outline" : "default"}
                            className="w-full"
                          >
                            {hasRSVP ? "Cancel RSVP" : "RSVP"}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Quick Stats</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {posts.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Posts
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {
                      events.filter((e) => {
                        const userId = JSON.parse(
                          localStorage.getItem("user") || "{}"
                        )?._id;
                        return e.rsvps.includes(userId);
                      }).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your RSVPs
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Popular Interests</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Technology", "Sports", "Music", "Arts", "Gaming"].map(
                    (interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {interest}
                      </span>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
