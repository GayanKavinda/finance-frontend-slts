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
  Mail,
  Lock,
  ShieldCheck,
  Save,
  Camera,
  Upload,
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

function Field({ label, error, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

export default function PersonalDetails({ user, refetch }) {
  const { enqueueSnackbar } = useSnackbar();

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
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
      const res = await axios.post("/api/update-profile", data);
      console.log("[Profile] Update profile successful:", res.data);
      await refetch();
      enqueueSnackbar(res.data.message || "Profile updated", {
        variant: "success",
      });
    } catch (e) {
      console.error(
        "[Profile] Update profile failed:",
        e.response?.data || e.message
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
      const res = await axios.post("/api/upload-avatar", form, {
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
        e.response?.data || e.message
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
      await axios.post("/api/request-email-change", {
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
        e.response?.data || e.message
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
      const res = await axios.post("/api/confirm-email-change", {
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
        e.response?.data || e.message
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

          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
            Profile Photo
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={avatarPreview || "/images/Signup.png"}
                alt="avatar"
                fill
                className="rounded-full object-cover border border-slate-200 dark:border-slate-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-slate-700 text-white p-2 rounded-full shadow hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors z-10 cursor-pointer"
                title="Change photo"
              >
                <Camera size={14} />
              </button>
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
                <button
                  type="button"
                  disabled={!avatarFile || isUploadingAvatar}
                  onClick={onUploadAvatar}
                  className="group relative px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg disabled:opacity-40 hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Upload</span>
                      </>
                    )}
                  </span>
                </button>
                {avatarFile && !isUploadingAvatar && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(user?.avatar_url || null);
                      enqueueSnackbar("Crop cancelled", { variant: "info" });
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 active:scale-95 cursor-pointer"
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

          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
            Personal Info
          </h3>
          <form
            onSubmit={profileForm.handleSubmit(onUpdateProfile)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field
              label="Full name"
              icon={User}
              error={profileForm.formState.errors.name?.message}
            >
              <input
                {...profileForm.register("name")}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Your name"
              />
            </Field>
            <Field label="Email (read-only)" icon={Mail}>
              <input
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm cursor-not-allowed"
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white text-sm font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto justify-center overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                      <span>Save Changes</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
          {/* Glow effect for dark mode */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 blur-2xl opacity-0 dark:opacity-60"></div>

          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
            Change Email
          </h3>
          <form
            onSubmit={emailForm.handleSubmit(onConfirmEmailChange)}
            className="grid grid-cols-1 gap-5"
          >
            <Field
              label="New Email Address"
              icon={Mail}
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
                <button
                  type="button"
                  onClick={onRequestEmailOtp}
                  disabled={emailForm.formState.isSubmitting}
                  className="group px-4 py-2.5 rounded-lg border-2 border-primary dark:border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-sm font-bold w-full hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>Send Code</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Verification Code"
                icon={ShieldCheck}
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
              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-secondary to-secondary/90 text-white text-sm font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto justify-center overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                      <span>Confirm Change</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
