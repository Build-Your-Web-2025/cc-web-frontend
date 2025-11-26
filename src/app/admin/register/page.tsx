"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function AdminRegister() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/admin/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          designation: formData.designation,
        }
      );

      console.log("Admin registration successful:", response.data);

      // Store admin data in localStorage
      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
      }
      if (response.data.admin) {
        localStorage.setItem("admin", JSON.stringify(response.data.admin));
      }

      toast.success("Registration successful!");
      // Redirect to admin dashboard
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Admin registration error:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Registration failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg pb-0">
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2 pt-4">
            <Image
              src="/logo.svg"
              alt="Campus Connect Logo"
              width={80}
              height={80}
            />
            <div className="space-y-0.5 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-foreground">
                Create Admin Account
              </h2>
              <p className="text-muted-foreground">
                Register as an administrator to manage the platform.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="admin@campus.edu"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Create a strong password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                  <SelectItem value="ce">Civil Engineering</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="student-affairs">
                    Student Affairs
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select
                onValueChange={(value) =>
                  handleInputChange("designation", value)
                }
              >
                <SelectTrigger id="designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hod">HOD (Head of Department)</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="event-coordinator">
                    Event Coordinator
                  </SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked as boolean)
                }
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Conditions
                </Link>
              </label>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create admin account"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4!">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
