import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { CaptchaField } from "@/components/ui/hcaptcha";
import { DepartmentSelector } from "./department-selector";

const FacultyStatusSchema = z.object({
    status: z.enum(["GUEST", "PERMANENT", "PART_TIME"], {
      message: "Invalid status",
    }),
  });
  
  const FacultyDesignationSchema = z.object({
    designation: z.enum(["PROFESSOR", "ASSOCIATE_PROFESSOR", "ASSISTANT_PROFESSOR", "LECTURER", "SENIOR_LECTURER", "TEACHERS_ASSISTANT"], {
      message: "Invalid designation",
    }),
  });

const FacultyRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    employeeId: z.string().min(1, "Employee ID is required"),
    designation: FacultyDesignationSchema,
    status: FacultyStatusSchema,
    departmentId: z.number().min(1, "Department is required"),
    bio: z.string().min(1, "Bio is required"),
    //captchaToken: z.string().min(1, "Please complete the captcha verification")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const FacultyStatusSelector = ({form}) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
                <Select value={field.status} onValueChange={(value) => {
                    field.onChange(value);
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="GUEST">Guest</SelectItem>
                        <SelectItem value="PERMANENT">Permanent</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                    </SelectContent>
                </Select>
            </FormControl>
            <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FacultyDesignationSelector = ({form}) => {
  return (
    <FormField
      control={form.control}
      name="designation"
      render={({ field }) => (
        <FormItem>
            <FormLabel>Designation</FormLabel>
            <FormControl>
                <Select value={field.designation} onValueChange={(value) => {
                    field.onChange(value);
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PROFESSOR">Professor</SelectItem>
                        <SelectItem value="ASSOCIATE_PROFESSOR">Associate Professor</SelectItem>
                        <SelectItem value="ASSISTANT_PROFESSOR">Assistant Professor</SelectItem>
                        <SelectItem value="LECTURER">Lecturer</SelectItem>
                        <SelectItem value="SENIOR_LECTURER">Senior Lecturer</SelectItem>
                        <SelectItem value="TEACHERS_ASSISTANT">Teachers Assistant</SelectItem>
                    </SelectContent>
                </Select>
            </FormControl>
            <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default function FacultyRegisterForm({
  onSubmit,
  isLoading,
  captchaError,
  setCaptchaError,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(FacultyRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      employeeId: "",
      designation: "",
      status: "",
      departmentId: "",
      bio: "",
      //captchaToken: "",
    },
  });

  const handleCaptchaVerify = (token) => {
    form.setValue("captchaToken", token || "");
    setCaptchaError(token ? "" : "Please complete the captcha verification");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values, "faculty"))} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                    <Input placeholder="1234567890" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FacultyStatusSelector form={form} />
          <FacultyDesignationSelector form={form} />
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <DepartmentSelector form={form} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Bio" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={isLoading}
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <Icons.eyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Icons.eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    disabled={isLoading}
                    placeholder="********"
                    type={showConfirmPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <Icons.eyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Icons.eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <CaptchaField 
            onVerify={handleCaptchaVerify} 
            error={captchaError}
          /> */}

        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
