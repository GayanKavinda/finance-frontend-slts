import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800/10 py-14">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Brand Info */}
          <div className="space-y-5">
            <div className="relative w-[140px] h-[45px]">
              <Image
                src="/icons/slt_digital_icon.png"
                alt="SLT Digital Services"
                fill
                className="object-contain dark:brightness-0 dark:invert opacity-90"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] leading-tight">
                Sri Lanka Telecom Services
              </p>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
                Finance Division | Internal Portal
              </p>
            </div>
          </div>

          {/* Clean Menu Grid */}
          <div className="flex flex-wrap gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                Legal & Compliance
              </h4>
              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/privacy"
                  className="text-xs text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-xs text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Internal Usage Policy
                </Link>
                <Link
                  href="/security"
                  className="text-xs text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors font-medium"
                >
                  Security Standards
                </Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                Technical Support
              </h4>
              <div className="space-y-2.5">
                <p className="text-xs text-slate-500 font-medium">
                  it-support@slts.lk
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Intercom: 4402 (Helpdesk)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
            © {currentYear} SLT Services. Proprietary & Confidential System.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                System Official
              </span>
            </div>
            <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">
              v2.1.0-prod
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
