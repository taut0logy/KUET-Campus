"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import StudentRegisterForm from "@/components/auth/student-register-form";
import FacultyRegisterForm from "@/components/auth/faculty-register-form";
import EmployeeRegisterForm from "@/components/auth/employee-register-form";

function RegisterTabs() {
  const { registerStudent, registerFaculty, registerEmployee } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [errors, setErrors] = useState([]);

  const onSubmit = async (values, selectedTab) => {
    try {
      setIsLoading(true);

      // if (!values.captchaToken) {
      //   setCaptchaError("Please complete the captcha verification");
      //   setIsLoading(false);
      //   return;
      // }

      let result;

      if (selectedTab === "student") {
        result = await registerStudent({
          name: values.name,
          email: values.email,
          password: values.password,
          studentId: values.studentId,
          section: values.section,
          batch: values.batch,
          departmentId: values.departmentId,
          captchaToken: values.captchaToken,
        });
      } else if (selectedTab === "faculty") {
        result = await registerFaculty({
          name: values.name,
          email: values.email,
          password: values.password,
          employeeId: values.employeeId,
          status: values.status,
          designation: values.designation,
          departmentId: values.departmentId,
          bio: values.bio,
          captchaToken: values.captchaToken,
        });
      } else if (selectedTab === "employee") {
        result = await registerEmployee({
          name: values.name,
          email: values.email,
          password: values.password,
          employeeId: values.employeeId,
          designation: values.designation,
          departmentId: values.departmentId,
          captchaToken: values.captchaToken,
        });
      }

      console.log("Registration successful:", result);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      router.push("/verify-email");
    } catch (error) {
      console.error("Registration error:", error);

      // Prevent form from submitting naturally
      event?.preventDefault?.();


      if (error.response && error.response.data) {
        toast.error(
          error.response.data.message ||
            "Registration failed. Please try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="student" className="w-full sm:w-[500px]">
      <TabsList className="w-full justify-center">
        <TabsTrigger value="student" onClick={() => setSelectedTab("student")}>Student</TabsTrigger>
        <TabsTrigger value="faculty" onClick={() => setSelectedTab("faculty")}>Faculty</TabsTrigger>
        <TabsTrigger value="employee" onClick={() => setSelectedTab("employee")}>Employee</TabsTrigger>
      </TabsList>
      <TabsContent value="student">
        <Card>
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>
              Please use your university email address to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentRegisterForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              captchaError={captchaError}
              setCaptchaError={setCaptchaError}
            />
          </CardContent>
          <CardFooter>
            <div className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="faculty">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Registration</CardTitle>
            <CardDescription>
              Please use your university email address to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FacultyRegisterForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              captchaError={captchaError}
              setCaptchaError={setCaptchaError}
            />
          </CardContent>
          <CardFooter>
            <div className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="employee">
        <Card>
          <CardHeader>
            <CardTitle>Employee Registration</CardTitle>
            <CardDescription>
              Please use your university email address to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeRegisterForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              captchaError={captchaError}
              setCaptchaError={setCaptchaError}
            />
          </CardContent>
          <CardFooter>
            <div className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <div className="w-full">
        <Suspense fallback={<Icons.spinner className="h-8 w-8 animate-spin" />}>
          <RegisterTabs />
        </Suspense>
      </div>
    </div>
  );
}
