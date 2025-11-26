"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  Users,
  FileText,
  LogOut,
  TrendingUp,
  MessageSquare,
  Plus,
} from "lucide-react";
import NewEvent from "@/components/NewEvent";
import { useState, useEffect, startTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalEvents: number;
  activeUsers: number;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  department?: string;
  designation?: string;
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

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  department?: string;
  imageUrl?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    department: string;
    designation: string;
  };
  rsvps: Array<{
    _id: string;
    name: string;
    email?: string;
    department?: string;
    year?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "posts" | "events"
  >("overview");
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    activeUsers: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/admin/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats({
        totalUsers: data.totals.users || 0,
        totalPosts: data.totals.posts || 0,
        totalEvents: data.totals.events || 0,
        activeUsers: data.totals.users || 0,
      });
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Fetch events error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const handleEventCreated = () => {
    // Refresh events list after creating new event
    fetchEvents();
    setShowCreateEvent(false);
    fetchStats();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  // Client-side only: check if admin is logged in
  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (adminData) {
      try {
        startTransition(() => {
          setAdmin(JSON.parse(adminData) as Admin);
        });
      } catch {
        router.push("/admin/login");
      }
    } else {
      toast.error("Please login to access admin dashboard");
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch data when admin is loaded
  useEffect(() => {
    if (admin) {
      const loadData = async () => {
        await Promise.all([fetchStats(), fetchEvents(), fetchUsers()]);
      };
      loadData();
    }
  }, [admin]);

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {admin.name}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b bg-white rounded-t-lg px-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Users
          </button>
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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stats.totalUsers}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Posts
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stats.totalPosts}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +8% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Events
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stats.totalEvents}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +5 this month
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Active Users
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stats.activeUsers}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last 24 hours
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Info Card */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold">Admin Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{admin.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{admin.email}</span>
                </div>
                {admin.department && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{admin.department}</span>
                  </div>
                )}
                {admin.designation && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Designation:</span>
                    <span className="font-medium">{admin.designation}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="flex items-center gap-2 justify-start h-auto py-4">
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Manage Users</p>
                      <p className="text-xs opacity-80">
                        View and manage users
                      </p>
                    </div>
                  </Button>
                  <Button className="flex items-center gap-2 justify-start h-auto py-4">
                    <MessageSquare className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Review Posts</p>
                      <p className="text-xs opacity-80">Moderate content</p>
                    </div>
                  </Button>
                  <Button
                    className="flex items-center gap-2 justify-start h-auto py-4"
                    onClick={() => {
                      setActiveTab("events");
                      setShowCreateEvent(true);
                    }}
                  >
                    <Calendar className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Create Event</p>
                      <p className="text-xs opacity-80">Add new campus event</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Management</h3>
                <div className="text-sm text-muted-foreground">
                  Total: {users.length} users
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No users found
                </p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user._id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{user.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              {user.department && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Department:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {user.department}
                                  </span>
                                </div>
                              )}
                              {user.year && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Year:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {user.year}
                                  </span>
                                </div>
                              )}
                              <div className="col-span-2">
                                <span className="text-muted-foreground">
                                  Joined:
                                </span>{" "}
                                <span className="font-medium">
                                  {new Date(
                                    user.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {user.interests && user.interests.length > 0 && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">
                                    Interests:
                                  </span>{" "}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {user.interests.map((interest, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <h3 className="text-lg font-semibold">Post Management</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Post management features coming soon...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Create Event Button */}
            <Card className="border-none shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent
                className="p-6"
                onClick={() => setShowCreateEvent(true)}
              >
                <div className="flex items-center gap-3 text-primary">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create New Event</span>
                </div>
              </CardContent>
            </Card>

            {/* New Event Modal */}
            {showCreateEvent && (
              <NewEvent
                onClose={() => setShowCreateEvent(false)}
                onEventCreated={handleEventCreated}
              />
            )}

            {/* Events List */}
            {events.length === 0 ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No events created yet. Click above to create your first event!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event._id} className="border-none shadow-md">
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
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              {event.department}
                            </span>
                          )}
                        </div>
                        {event.imageUrl && (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event.rsvps.length} RSVPs</span>
                        </div>
                        {event.location && (
                          <div className="col-span-2 text-muted-foreground">
                            📍 {event.location}
                          </div>
                        )}
                        <div className="col-span-2 text-xs text-muted-foreground">
                          Created {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* RSVP Details */}
                      {event.rsvps.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <button
                            onClick={() =>
                              setExpandedEventId(
                                expandedEventId === event._id ? null : event._id
                              )
                            }
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {expandedEventId === event._id ? "Hide" : "View"}{" "}
                            RSVPs ({event.rsvps.length})
                          </button>

                          {expandedEventId === event._id && (
                            <div className="mt-3 space-y-2">
                              {event.rsvps.map((rsvp) => (
                                <div
                                  key={rsvp._id}
                                  className="flex items-center gap-2 p-2 rounded bg-gray-50"
                                >
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-primary">
                                      {rsvp.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1 text-sm">
                                    <div className="font-medium">
                                      {rsvp.name}
                                    </div>
                                    {rsvp.department && rsvp.year && (
                                      <div className="text-xs text-muted-foreground">
                                        {rsvp.department} - Year {rsvp.year}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
