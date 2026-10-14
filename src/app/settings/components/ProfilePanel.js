"use client";

// src/app/settings/components/ProfilePanel.js
// Full profile modification — avatar, personal info, and email change with
// OTP verification. Lives in Settings (Account tab); the /profile page is
// read-only and links here.

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Upload,
  User as UserIcon,
  UserCircle,
  X,
  ShieldCheck,
  Calendar,
  Building2,
  Briefcase,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import ImageCropModal from "@/components/ImageCropModal";

const PROFILE_FIELDS = [
  "name",
  "phone",
  "address",
  "city",
  "country",
  "postal_code",
  "date_of_birth",
  "gender",
  "company",
  "job_title",
  "tax_id",
];

const emptyProfile = () => ({
  name: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postal_code: "",
  date_of_birth: "",
  gender: "",
  company: "",
  job_title: "",
  tax_id: "",
});

function profileFromUser(user) {
  const base = emptyProfile();
  if (!user) return base;
  base.name = user.name || "";
  base.phone = user.phone || "";
  base.address = user.address || "";
  base.city = user.city || "";
  base.country = user.country || "";
  base.postal_code = user.postal_code || "";
  base.date_of_birth = user.date_of_birth
    ? String(user.date_of_birth).slice(0, 10)
    : "";
  base.gender = user.gender || "";
  base.company = user.company || "";
  base.job_title = user.job_title || "";
  base.tax_id = user.tax_id || "";
  return base;
}

function Field({ label, icon: Icon, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-border bg-card text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

export default function ProfilePanel({ user, refetch, draft, setDraft }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const fileInputRef = useRef(null);

  const [emailDraft, setEmailDraft] = useState({
    new_email: "",
    current_password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const avatarUrl = user?.avatar_url || null;

  const set = (key) => (e) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Avatar ─────────────────────────────────────────────────── */
  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile(f);
      setTempImage(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(f);
  };

  const onCropComplete = (blob) => {
    setShowCrop(false);
    setTempImage(null);
    setAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    toast("Image cropped — click Upload to save", { icon: "\u2702\uFE0F" });
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      await fetchCsrf();
      const form = new FormData();
      form.append("avatar", avatarFile);
      const res = await axios.post("/upload-avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Avatar updated");
      setAvatarFile(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch?.();
    } catch (e) {
      toast.error(e.response?.data?.errors?.avatar?.[0] || e.response?.data?.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ── Email change (OTP) ─────────────────────────────────────── */
  const onSendCode = async () => {
    if (!emailDraft.new_email || !emailDraft.current_password) {
      toast.error("New email and current password are required");
      return;
    }
    setEmailSaving(true);
    try {
      await fetchCsrf();
      await axios.post("/request-email-change", {
        new_email: emailDraft.new_email,
        current_password: emailDraft.current_password,
      });
      setOtpSent(true);
      toast.success("Verification code sent to your new email");
    } catch (e) {
      toast.error(
        e.response?.data?.errors?.new_email?.[0] ||
          e.response?.data?.errors?.current_password?.[0] ||
          e.response?.data?.message ||
          "Failed to send code"
      );
    } finally {
      setEmailSaving(false);
    }
  };

  const onConfirmEmail = async () => {
    if (!emailDraft.otp) {
      toast.error("Enter the 6-digit verification code");
      return;
    }
    setEmailSaving(true);
    try {
      await fetchCsrf();
      const res = await axios.post("/confirm-email-change", {
        new_email: emailDraft.new_email,
        otp: emailDraft.otp,
      });
      toast.success(res.data.message || "Email updated");
      setEmailDraft({ new_email: "", current_password: "", otp: "" });
      setOtpSent(false);
      await refetch?.();
    } catch (e) {
      toast.error(
        e.response?.data?.errors?.otp?.[0] ||
          e.response?.data?.message ||
          "Email update failed"
      );
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {previewing && avatarUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewing(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          >
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <Image src={avatarUrl} alt="Avatar preview" fill sizes="384px" className="object-cover" />
              <button
                onClick={() => setPreviewing(false)}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCrop && tempImage && (
          <ImageCropModal
            image={tempImage}
            imageData={pendingFile}
            onComplete={onCropComplete}
            onCancel={() => {
              setShowCrop(false);
              setTempImage(null);
              setPendingFile(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Photo ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-medium text-foreground flex items-center gap-2 mb-3">
          <Camera className="w-3.5 h-3.5 text-primary" />
          Profile Photo
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            {avatarUrl ? (
              <button type="button" onClick={() => setPreviewing(true)} className="cursor-zoom-in">
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="64px"
                  className="rounded-full object-cover border-2 border-border"
                />
              </button>
            ) : (
              <div className="w-full h-full rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <UserIcon className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] text-muted-foreground">JPG, PNG or WEBP \u00B7 up to 2MB</p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPickAvatar}
                className="sr-only"
                id="settings-avatar-input"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[11px] gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-3 h-3" />
                Change photo
              </Button>
              {avatarFile && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-[11px] gap-1.5"
                    onClick={onUploadAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[11px]"
                    onClick={() => {
                      setAvatarFile(null);
                      setPendingFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Discard crop
                  </Button>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Last updated: {user?.profile_updated_at ? new Date(user.profile_updated_at).toLocaleString() : "\u2014"}
              {user?.profile_updated_by ? ` \u00B7 by ${user.profile_updated_by}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Personal info ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-medium text-foreground flex items-center gap-2 mb-3">
          <UserIcon className="w-3.5 h-3.5 text-primary" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name" icon={UserIcon} required className="sm:col-span-2">
            <input
              value={draft.name}
              onChange={set("name")}
              placeholder="Your name"
              className={inputCls}
            />
          </Field>
          <Field label="Email address (read-only)" icon={Mail}>
            <input value={user?.email || ""} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </Field>
          <Field label="Phone number" icon={Phone}>
            <input value={draft.phone} onChange={set("phone")} placeholder="+94 77 123 4567" className={inputCls} />
          </Field>
          <Field label="Date of birth" icon={Calendar}>
            <input type="date" value={draft.date_of_birth} onChange={set("date_of_birth")} className={inputCls} />
          </Field>
          <Field label="Gender" icon={UserCircle}>
            <select value={draft.gender} onChange={set("gender")} className={inputCls}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Address" icon={MapPin} className="sm:col-span-2">
            <input value={draft.address} onChange={set("address")} placeholder="123 Main Street" className={inputCls} />
          </Field>
          <Field label="City" icon={MapPin}>
            <input value={draft.city} onChange={set("city")} placeholder="Colombo" className={inputCls} />
          </Field>
          <Field label="Country" icon={Globe}>
            <input value={draft.country} onChange={set("country")} placeholder="Sri Lanka" className={inputCls} />
          </Field>
          <Field label="Postal code" icon={Globe}>
            <input value={draft.postal_code} onChange={set("postal_code")} placeholder="00100" className={inputCls} />
          </Field>
          <Field label="Company / organization" icon={Building2}>
            <input value={draft.company} onChange={set("company")} placeholder="Sri Lanka Telecom" className={inputCls} />
          </Field>
          <Field label="Job title" icon={Briefcase}>
            <input value={draft.job_title} onChange={set("job_title")} placeholder="Procurement Officer" className={inputCls} />
          </Field>
          <Field label="Tax ID / national ID" icon={FileText}>
            <input value={draft.tax_id} onChange={set("tax_id")} placeholder="123456789V" className={inputCls} />
          </Field>
        </div>
        <div className="flex justify-end pt-3">
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={async () => {
              try {
                await fetchCsrf();
                const payload = {};
                PROFILE_FIELDS.forEach((k) => {
                  payload[k] = draft[k] ?? "";
                });
                const res = await axios.post("/update-profile", payload);
                toast.success(res.data.message || "Profile updated");
                await refetch?.();
              } catch (e) {
                toast.error(e.response?.data?.errors?.name?.[0] || e.response?.data?.message || "Update failed");
              }
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Save details
          </Button>
        </div>
      </div>

      {/* ── Email change with OTP ──────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-medium text-foreground flex items-center gap-2 mb-1">
          <Mail className="w-3.5 h-3.5 text-primary" />
          Change Email Address
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Changing your primary email requires password confirmation and a 6-digit code sent to the new address.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="New email address" icon={Mail} required>
            <input
              type="email"
              value={emailDraft.new_email}
              onChange={(e) => setEmailDraft((p) => ({ ...p, new_email: e.target.value }))}
              placeholder="name@slt.lk"
              className={inputCls}
            />
          </Field>
          <Field label="Current password" icon={Lock} required>
            <input
              type="password"
              value={emailDraft.current_password}
              onChange={(e) => setEmailDraft((p) => ({ ...p, current_password: e.target.value }))}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onSendCode}
            disabled={emailSaving}
          >
            {emailSaving && !otpSent ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
            Send code
          </Button>
        </div>

        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end pt-3 mt-3 border-t border-border"
          >
            <Field label="Verification code" icon={ShieldCheck}>
              <input
                value={emailDraft.otp}
                onChange={(e) => setEmailDraft((p) => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
                placeholder="6-digit code"
                maxLength={6}
                className={`${inputCls} tracking-[0.3em] font-mono`}
              />
            </Field>
            <Button
              type="button"
              size="sm"
              className="h-9 text-xs gap-1.5"
              onClick={onConfirmEmail}
              disabled={emailSaving}
            >
              {emailSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              Confirm change
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
