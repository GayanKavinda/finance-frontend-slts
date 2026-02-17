// src/app/profile/PersonalDetails.js

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";
import { useSnackbar } from "notistack";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  User,
  ShieldUser,
  Mail,
  Lock,
  ShieldCheck,
  Save,
  Camera,
  Upload,
  Use,
  XCircle,
  Eye,
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import Image from "next/image";

// Validation Schemas
const profileSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Too short"),
});

const emailChangeSchema = yup.object({
  new_email: yup
    .string()
    .email("Invalid email")
    .required("New email is required"),
  current_password: yup.string().required("Current password is required"),
  otp: yup.string().length(6, "Code must be 6 digits").optional(),
});

function SectionHeader({ icon: Icon, title, iconColor = "text-primary" }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        {Icon && (
          <div
            className={`p-1.5 rounded-lg ${iconColor.replace("text-", "bg-")}/10`}
          >
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div
        className={`h-0.5 w-16 bg-gradient-to-r ${iconColor.replace("text-", "from-").split(" ")[0]} to-transparent rounded-full`}
      ></div>
    </div>
  );
}

function Field({
  label,
  error,
  icon: Icon,
  iconColor = "text-slate-400",
  children,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
        {Icon && <Icon size={12} className={iconColor} />} {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

export default function PersonalDetails({ user, refetch }) {
  const { enqueueSnackbar } = useSnackbar();

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef(null);

  // Forms
  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
    mode: "onTouched",
  });

  const emailForm = useForm({
    resolver: yupResolver(emailChangeSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || "" });
      setAvatarPreview(user?.avatar_url || null);
    }
  }, [user]);

  // Handlers
  const onUpdateProfile = async (data) => {
    console.log("[Profile] Update profile initiated:", data);
    try {
      await fetchCsrf();
      const res = await axios.post("/update-profile", data);
      console.log("[Profile] Update profile successful:", res.data);
      await refetch();
      enqueueSnackbar(res.data.message || "Profile updated", {
        variant: "success",
      });
    } catch (e) {
      console.error(
        "[Profile] Update profile failed:",
        e.response?.data || e.message,
      );
      const msg =
        e.response?.data?.errors?.name?.[0] ||
        e.response?.data?.message ||
        "Update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;

    setIsUploadingAvatar(true);
    console.log("[Profile] Uploading avatar:", avatarFile.name);

    const form = new FormData();
    form.append("avatar", avatarFile);

    try {
      await fetchCsrf();
      const res = await axios.post("/upload-avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[Profile] Avatar upload successful:", res.data);

      enqueueSnackbar(res.data.message || "Avatar updated successfully! ✓", {
        variant: "success",
      });

      setAvatarFile(null);
      await refetch();
    } catch (e) {
      console.error(
        "[Profile] Avatar upload failed:",
        e.response?.data || e.message,
      );
      const msg =
        e.response?.data?.errors?.avatar?.[0] ||
        e.response?.data?.message ||
        "Upload failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onRequestEmailOtp = async () => {
    const values = emailForm.getValues();
    console.log("[Profile] Requesting email OTP for:", values.new_email);
    try {
      await fetchCsrf();
      await axios.post("/request-email-change", {
        new_email: values.new_email,
        current_password: values.current_password,
      });
      console.log("[Profile] OTP requested successfully");
      enqueueSnackbar("Verification code sent to your new email", {
        variant: "success",
      });
    } catch (e) {
      console.error(
        "[Profile] OTP request failed:",
        e.response?.data || e.message,
      );
      const msg =
        e.response?.data?.errors?.new_email?.[0] ||
        e.response?.data?.errors?.current_password?.[0] ||
        e.response?.data?.message ||
        "Failed to send OTP";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onConfirmEmailChange = async (data) => {
    console.log("[Profile] Confirming email change to:", data.new_email);
    try {
      await fetchCsrf();
      const res = await axios.post("/confirm-email-change", {
        new_email: data.new_email,
        otp: data.otp,
      });
      console.log("[Profile] Email change confirmed successfully");
      enqueueSnackbar(res.data.message || "Email updated", {
        variant: "success",
      });
      emailForm.reset();
      await refetch();
    } catch (e) {
      console.error(
        "[Profile] Email change confirmation failed:",
        e.response?.data || e.message,
      );
      const msg =
        e.response?.data?.errors?.otp?.[0] ||
        e.response?.data?.errors?.new_email?.[0] ||
        e.response?.data?.message ||
        "Email update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    try {
      // Create preview
      const url = URL.createObjectURL(croppedBlob);
      setAvatarPreview(url);

      // Convert blob to file
      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });
      setAvatarFile(file);

      // Close modal with smooth transition
      setShowCropModal(false);

      // Small delay before clearing temp image
      await new Promise((resolve) => setTimeout(resolve, 200));
      setTempImage(null);

      // Show success feedback
      enqueueSnackbar("Image cropped! Click Upload to save.", {
        variant: "info",
      });
    } catch (error) {
      console.error("Error handling crop:", error);
      enqueueSnackbar("Failed to process image", { variant: "error" });
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImage(null);
  };

  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Image Preview Modal */}
      <AnimatePresence>
        {showPreview && avatarPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              layoutId="avatar-preview-modal"
              className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={avatarPreview}
                alt="Profile Preview"
                fill
                className="object-cover"
              />
              <button
                onClick={() => setShowPreview(false)}
                className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-lg transition hover:bg-black/75 cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      <AnimatePresence>
        {showCropModal && tempImage && (
          <ImageCropModal
            image={tempImage}
            onComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>

      {/* Left: Avatar + Meta */}
      <div className="w-full lg:col-span-1">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
          {/* Glow effect for dark mode */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

          <SectionHeader
            icon={Camera}
            title="Profile Photo"
            iconColor="text-sky-500"
          />
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              {avatarPreview ? (
                <motion.div
                  layoutId="avatar-preview-modal"
                  className="relative h-full w-full cursor-zoom-in overflow-hidden rounded-full border border-slate-200 dark:border-slate-800"
                  onClick={() => setShowPreview(true)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <Image
                    src={avatarPreview}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />

                  {/* Hover overlay hint */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <Eye size={20} className="text-white drop-shadow-md" />
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <ShieldUser
                    className="w-8 h-8 text-slate-400 dark:text-slate-500"
                    strokeWidth={1.5}
                  />
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-white/10 dark:bg-black/20 backdrop-blur-md text-slate-900 dark:text-white p-2 rounded-full shadow-lg border border-white/20 dark:border-slate-800 hover:bg-white/20 dark:hover:bg-white/10 transition-colors z-10 cursor-pointer"
                title="Change photo"
              >
                <Camera size={14} />
              </motion.button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                JPG, PNG, WEBP up to 2MB
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 2 * 1024 * 1024) {
                      enqueueSnackbar("File too large (max 2MB)", {
                        variant: "error",
                      });
                      return;
                    }

                    // Show crop modal
                    const reader = new FileReader();
                    reader.onload = () => {
                      setTempImage(reader.result);
                      setShowCropModal(true);
                    };
                    reader.readAsDataURL(f);
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  disabled={!avatarFile || isUploadingAvatar}
                  onClick={onUploadAvatar}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center gap-2">
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                        <span>Upload</span>
                      </>
                    )}
                  </span>
                </motion.button>
                {avatarFile && !isUploadingAvatar && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(user?.avatar_url || null);
                      enqueueSnackbar("Crop cancelled", { variant: "info" });
                    }}
                    className="rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>
              Last updated:{" "}
              {user?.profile_updated_at
                ? new Date(user.profile_updated_at).toLocaleString()
                : "—"}
            </div>
            <div>Updated by: {user?.profile_updated_by || "—"}</div>
          </div>
        </div>
      </div>

      {/* Right: Personal Info and Email Change */}
      <div className="w-full lg:col-span-2 space-y-6">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
          {/* Glow effect for dark mode */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

          <SectionHeader
            icon={User}
            title="Personal Info"
            iconColor="text-blue-500"
          />
          <form
            onSubmit={profileForm.handleSubmit(onUpdateProfile)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field
              label="Full name"
              icon={User}
              iconColor="text-blue-500"
              error={profileForm.formState.errors.name?.message}
            >
              <input
                {...profileForm.register("name")}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Your name"
              />
            </Field>
            <Field
              label="Email (read-only)"
              icon={Mail}
              iconColor="text-amber-500"
            >
              <input
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm cursor-not-allowed"
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="group relative inline-flex w-auto items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative flex items-center gap-2">
                  {profileForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save
                        size={16}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
                      />
                      <span>Save Changes</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </form>
        </div>

        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
          {/* Glow effect for dark mode */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 blur-2xl opacity-0 dark:opacity-60"></div>

          <SectionHeader
            icon={Mail}
            title="Change Email"
            iconColor="text-amber-500"
          />
          <form
            onSubmit={emailForm.handleSubmit(onConfirmEmailChange)}
            className="grid grid-cols-1 gap-5"
          >
            <Field
              label="New Email Address"
              icon={Mail}
              iconColor="text-amber-500"
              error={emailForm.formState.errors.new_email?.message}
            >
              <input
                {...emailForm.register("new_email")}
                placeholder="name@example.com"
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Current Password"
                icon={Lock}
                iconColor="text-indigo-500"
                error={emailForm.formState.errors.current_password?.message}
              >
                <input
                  type="password"
                  {...emailForm.register("current_password")}
                  placeholder="Your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </Field>
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onRequestEmailOtp}
                  disabled={emailForm.formState.isSubmitting}
                  className="group flex w-auto cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span>Send Code</span>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Verification Code"
                icon={ShieldCheck}
                iconColor="text-emerald-500"
                error={emailForm.formState.errors.otp?.message}
              >
                <input
                  {...emailForm.register("otp")}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="group relative inline-flex w-auto items-center justify-center gap-2 overflow-hidden rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground shadow-lg shadow-secondary/25 transition-all duration-300 hover:shadow-secondary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative flex items-center gap-2">
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck
                        size={16}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
                      />
                      <span>Confirm Change</span>
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
