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

interface Comment {
  _id: string;
  post: string;
  author: {
    _id: string;
    name: string;
    department?: string;
    year?: string;
    avatarUrl?: string;
  };
  text: string;
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

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
  year?: number;
  bio?: string;
  interests?: string[];
  createdAt: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  department?: string;
  designation?: string;
  createdAt?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "profile">(
    "posts"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | Admin | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventDepartmentFilter, setEventDepartmentFilter] =
    useState<string>("all");

  useEffect(() => {
    fetchPosts();
    fetchEvents();

    // Get current user ID and data
    const userData = localStorage.getItem("user");
    const adminData = localStorage.getItem("admin");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user._id || user.id);
        setCurrentUser(user);
      } catch {}
    } else if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setCurrentUserId(admin._id || admin.id);
        setCurrentUser(admin);
      } catch {}
    }
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

  const fetchComments = async (postId: string) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Please login to comment");
        return;
      }

      const commentText = newComment[postId]?.trim();
      if (!commentText) {
        toast.error("Comment cannot be empty");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
      toast.success("Comment added!");
    } catch (err) {
      console.error("Add comment error:", err);
      toast.error("Failed to add comment");
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  // Filter posts based on search and filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      selectedTag === "all" || (post.tags && post.tags.includes(selectedTag));

    const matchesDepartment =
      selectedDepartment === "all" ||
      post.author?.department === selectedDepartment;

    return matchesSearch && matchesTag && matchesDepartment;
  });

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      event.description
        .toLowerCase()
        .includes(eventSearchQuery.toLowerCase()) ||
      (event.location &&
        event.location.toLowerCase().includes(eventSearchQuery.toLowerCase()));

    const matchesDepartment =
      eventDepartmentFilter === "all" ||
      event.department === eventDepartmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Get unique tags from posts
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags || []))
  ).sort();

  // Get unique departments from posts
  const allDepartments = Array.from(
    new Set(
      posts
        .map((post) => post.author?.department)
        .filter((dept): dept is string => Boolean(dept))
    )
  ).sort();

  // Get unique departments from events
  const eventDepartments = Array.from(
    new Set(
      events
        .map((event) => event.department)
        .filter((dept): dept is string => Boolean(dept))
    )
  ).sort();

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
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "profile" ? (
              /* Profile Section */
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentUser ? (
                    <>
                      {/* Profile Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {currentUser.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Name
                            </p>
                            <p className="font-medium">{currentUser.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium">{currentUser.email}</p>
                          </div>
                          {currentUser.department && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Department
                              </p>
                              <p className="font-medium">
                                {currentUser.department}
                              </p>
                            </div>
                          )}
                          {"year" in currentUser && currentUser.year && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Year
                              </p>
                              <p className="font-medium">
                                Year {currentUser.year}
                              </p>
                            </div>
                          )}
                          {"designation" in currentUser &&
                            currentUser.designation && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Designation
                                </p>
                                <p className="font-medium">
                                  {currentUser.designation}
                                </p>
                              </div>
                            )}
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Member Since
                            </p>
                            <p className="font-medium">
                              {new Date(
                                currentUser.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      {"bio" in currentUser && currentUser.bio && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold text-lg mb-2">Bio</h4>
                            <p className="text-muted-foreground">
                              {currentUser.bio}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Interests Section */}
                      {"interests" in currentUser &&
                        currentUser.interests &&
                        currentUser.interests.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-semibold text-lg mb-3">
                                Interests
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {currentUser.interests.map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Activity Stats */}
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Activity</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {
                                posts.filter(
                                  (p) => p.author?._id === currentUserId
                                ).length
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Posts
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {posts.reduce(
                                (acc, post) =>
                                  acc +
                                  (post.likes.includes(currentUserId || "")
                                    ? 1
                                    : 0),
                                0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Likes Given
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {
                                events.filter((e) =>
                                  e.rsvps.includes(currentUserId || "")
                                ).length
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Events RSVP
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Loading profile...
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : activeTab === "posts" ? (
              <>
                {/* Search and Filter Section */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search posts by content or author..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-3">
                        {/* Tag Filter */}
                        <select
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="all">All Tags</option>
                          {allTags.map((tag) => (
                            <option key={tag} value={tag}>
                              #{tag}
                            </option>
                          ))}
                        </select>

                        {/* Department Filter */}
                        <select
                          value={selectedDepartment}
                          onChange={(e) =>
                            setSelectedDepartment(e.target.value)
                          }
                          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="all">All Departments</option>
                          {allDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>

                        {/* Clear Filters */}
                        {(searchQuery ||
                          selectedTag !== "all" ||
                          selectedDepartment !== "all") && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedTag("all");
                              setSelectedDepartment("all");
                            }}
                            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}

                        {/* Results Count */}
                        <div className="ml-auto px-3 py-2 text-sm text-muted-foreground">
                          {filteredPosts.length}{" "}
                          {filteredPosts.length === 1 ? "post" : "posts"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Create Post Button */}
                <div className="flex justify-start">
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Post
                  </Button>
                </div>

                {/* New Post Modal */}
                {showCreatePost && (
                  <NewPost
                    onClose={() => setShowCreatePost(false)}
                    onPostCreated={handlePostCreated}
                  />
                )}

                {/* Posts Feed */}
                {filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {posts.length === 0
                        ? "No posts yet. Be the first to share something!"
                        : "No posts match your filters. Try adjusting your search."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
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
                      <CardFooter className="pt-4 flex flex-col gap-4">
                        <div className="flex gap-4 w-full">
                          <button
                            onClick={() => handleLike(post._id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                currentUserId &&
                                post.likes.includes(currentUserId)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                            <span>{post.likes.length}</span>
                          </button>
                          <button
                            onClick={() => toggleComments(post._id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>{comments[post._id]?.length || 0}</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedPost === post._id && (
                          <div className="w-full space-y-3 border-t pt-4">
                            {/* Add Comment */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={newComment[post._id] || ""}
                                onChange={(e) =>
                                  setNewComment((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(post._id)}
                              >
                                Post
                              </Button>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                              {comments[post._id]?.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No comments yet. Be the first to comment!
                                </p>
                              ) : (
                                comments[post._id]?.map((comment) => (
                                  <div
                                    key={comment._id}
                                    className="flex gap-2 p-3 bg-gray-50 rounded-md"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                      <span className="text-xs font-semibold text-primary">
                                        {comment.author?.name
                                          ?.charAt(0)
                                          .toUpperCase() || "?"}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm">
                                          {comment.author?.name ||
                                            "Unknown User"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(
                                            comment.createdAt
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm mt-1 whitespace-pre-wrap wrap-break-word">
                                        {comment.text}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                )}
              </>
            ) : (
              /* Events List */
              <div className="space-y-6">
                {/* Search and Filter Section for Events */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search events by title, description, or location..."
                          value={eventSearchQuery}
                          onChange={(e) => setEventSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-3">
                        {/* Department Filter */}
                        <select
                          value={eventDepartmentFilter}
                          onChange={(e) =>
                            setEventDepartmentFilter(e.target.value)
                          }
                          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="all">All Departments</option>
                          {eventDepartments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>

                        {/* Clear Filters */}
                        {(eventSearchQuery ||
                          eventDepartmentFilter !== "all") && (
                          <button
                            onClick={() => {
                              setEventSearchQuery("");
                              setEventDepartmentFilter("all");
                            }}
                            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}

                        {/* Results Count */}
                        <div className="ml-auto px-3 py-2 text-sm text-muted-foreground">
                          {filteredEvents.length}{" "}
                          {filteredEvents.length === 1 ? "event" : "events"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {events.length === 0
                        ? "No events available at the moment."
                        : "No events match your filters. Try adjusting your search."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredEvents.map((event) => {
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
