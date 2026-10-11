// src/app/signup/page.js
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Check,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Building2,
  MapPin,
  Globe,
  Calendar,
  UserCircle,
  Briefcase,
  FileText,
  Upload,
  Camera,
} from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchCsrf } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const schema = yup.object({
  name: yup.string().required("Name is required").max(255),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Must contain lowercase")
    .matches(/[A-Z]/, "Must contain uppercase")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[^a-zA-Z0-9]/, "Must contain a symbol"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password required"),
  phone: yup.string().max(30),
  address: yup.string().max(500),
  city: yup.string().max(100),
  country: yup.string().max(100),
  postal_code: yup.string().max(30),
  date_of_birth: yup.date().max(new Date(), "Date of birth cannot be in the future"),
  gender: yup.string().oneOf(["Male", "Female", "Other"]),
  company: yup.string().max(255),
  job_title: yup.string().max(255),
  tax_id: yup.string().max(100),
});

const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
        met ? "bg-primary" : "bg-muted"
      }`}
    >
      {met ? (
        <Check className="w-1.5 h-1.5 text-primary-foreground" />
      ) : (
        <X className="w-1.5 h-1.5 text-muted-foreground" />
      )}
    </div>
    <span
      className={`text-[10px] font-medium transition-colors ${
        met ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {text}
    </span>
  </div>
);

const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const pct = Math.min((strength / 5) * 100, 100);
  const color = strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-primary" : "bg-primary";

  return (
    <div className="space-y-1">
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : "Strong"} password
      </p>
    </div>
  );
};

export default function Signup() {
  const router = useRouter();
  const { refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const nextStep = async () => {
    const fields =
      step === 1
        ? ["name", "email"]
        : step === 2
        ? ["password", "password_confirmation"]
        : step === 3
        ? ["phone", "address", "city", "country", "postal_code", "date_of_birth", "gender", "company", "job_title", "tax_id"]
        : [];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      if (avatarFile) {
        const form = new FormData();
        form.append("avatar", avatarFile);
        Object.keys(data).forEach((k) => {
          if (data[k] !== undefined && data[k] !== "") form.append(k, data[k]);
        });
        await axios.post("/register", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/register", data);
      }
      enqueueSnackbar("Account created successfully!", { variant: "success" });
      router.push("/account-success");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Registration failed. Please try again.",
        { variant: "error" }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <main className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            PX
          </div>
          <span className="font-medium text-sm tracking-tight text-foreground">
            ProcureX
          </span>
        </div>

        <header className="mb-6 text-left">
          <h2 className="text-xl font-medium tracking-tight text-foreground mb-1">
            Create your account
          </h2>
          <p className="text-xs text-muted-foreground">
            Join the procurement management platform.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.name ? "border-destructive" : "border-border"}`}
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.email ? "border-destructive" : "border-border"}`}
                    id="email"
                    type="email"
                    placeholder="e.g. johndoe@slts.lk"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={nextStep}
                className="w-full"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.password ? "border-destructive" : "border-border"}`}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
                {password && <PasswordStrengthMeter password={password} />}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="password_confirmation">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.password_confirmation ? "border-destructive" : "border-border"}`}
                    id="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password_confirmation")}
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCircle className="w-4 h-4" />
                <p className="text-xs font-medium uppercase tracking-wider">
                  Additional Profile Details
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.phone ? "border-destructive" : "border-border"}`}
                    id="phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    {...register("phone")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="address">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.address ? "border-destructive" : "border-border"}`}
                    id="address"
                    type="text"
                    placeholder="123 Main Street"
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="city">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.city ? "border-destructive" : "border-border"}`}
                      id="city"
                      type="text"
                      placeholder="Colombo"
                      {...register("city")}
                    />
                  </div>
                  {errors.city && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="postal_code">
                    Postal Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.postal_code ? "border-destructive" : "border-border"}`}
                      id="postal_code"
                      type="text"
                      placeholder="00100"
                      {...register("postal_code")}
                    />
                  </div>
                  {errors.postal_code && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.postal_code.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="country">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.country ? "border-destructive" : "border-border"}`}
                    id="country"
                    type="text"
                    placeholder="Sri Lanka"
                    {...register("country")}
                  />
                </div>
                {errors.country && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="date_of_birth">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.date_of_birth ? "border-destructive" : "border-border"}`}
                      id="date_of_birth"
                      type="date"
                      {...register("date_of_birth")}
                    />
                  </div>
                  {errors.date_of_birth && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="gender">
                    Gender
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <select
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none ${errors.gender ? "border-destructive" : "border-border"}`}
                      id="gender"
                      defaultValue=""
                      {...register("gender")}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="company">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.company ? "border-destructive" : "border-border"}`}
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      {...register("company")}
                    />
                  </div>
                  {errors.company && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-foreground ml-1" htmlFor="job_title">
                    Job Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.job_title ? "border-destructive" : "border-border"}`}
                      id="job_title"
                      type="text"
                      placeholder="Manager"
                      {...register("job_title")}
                    />
                  </div>
                  {errors.job_title && (
                    <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                      {errors.job_title.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="tax_id">
                  Tax ID / National ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.tax_id ? "border-destructive" : "border-border"}`}
                    id="tax_id"
                    type="text"
                    placeholder="123456789V"
                    {...register("tax_id")}
                  />
                </div>
                {errors.tax_id && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.tax_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="Preview" fill sizes="48px" className="object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (f.size > 2 * 1024 * 1024) {
                          enqueueSnackbar("File too large (max 2MB)", { variant: "error" });
                          return;
                        }
                        setAvatarFile(f);
                        const reader = new FileReader();
                        reader.onload = () => setAvatarPreview(reader.result);
                        reader.readAsDataURL(f);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" /> Choose Photo
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      JPG, PNG, WEBP up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        <footer className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
