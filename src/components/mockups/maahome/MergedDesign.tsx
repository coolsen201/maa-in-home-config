import { useState, useEffect, useCallback } from "react";

type Section = "home" | "devices" | "photos" | "network" | "users" | "auditlog" | "sessions" | "link" | "settings";

const SCREENSAVERS = [
  { id: "mom-dad", label: "MOM/DAD SELFIE", primary: true },
  { id: "s1", label: "SCREENSAVER 1" },
  { id: "s2", label: "SCREENSAVER 2" },
  { id: "s3", label: "SCREENSAVER 3" },
  { id: "s4", label: "SCREENSAVER 4" },
  { id: "s5", label: "SCREENSAVER 5" },
  { id: "s6", label: "SCREENSAVER 6" },
  { id: "s7", label: "SCREENSAVER 7" },
  { id: "s8", label: "SCREENSAVER 8" },
  { id: "s9", label: "SCREENSAVER 9" },
  { id: "s10", label: "SCREENSAVER 10" },
];

/* ─── Photo-style SVG icons ─── */
function PhotoLandscape({
  color = "#fff",
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="8.5" cy="8.5" r="1.5" fill={color} stroke="none" />
      <polyline points="3,16 8,11 12,15 16,11 21,16" />
    </svg>
  );
}

function PhotoGrid({
  color = "#fff",
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function PhotoSignal({
  color = "#fff",
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M7 12 Q12 7 17 12" />
      <path d="M5 16 Q12 9 19 16" />
      <circle cx="12" cy="15" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function PhotoFilm({
  color = "#fff",
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="1" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="2" y1="14" x2="22" y2="14" />
      <line x1="6" y1="6" x2="6" y2="18" />
      <line x1="18" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PhotoGear({
  color = "#fff",
  size = 16,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function IcoShield({
  color = "currentColor",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IcoLink({
  color = "currentColor",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IcoSignOut({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IcoCheck({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IcoPlus({
  size = 13,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// function IcoPhone({
//   size = 20,
//   color = "#fff",
// }: {
//   size?: number;
//   color?: string;
// }) {
//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
//     </svg>
//   );
// }

/* ─── Nav config with per-item colours ─── */
const navItems: {
  id: Section;
  label: string;
  color: string;
  light: string;
  icon: (c: string) => React.ReactNode;
}[] = [
  {
    id: "home",
    label: "Control Center",
    color: "#2563EB",
    light: "#eff6ff",
    icon: (c) => <PhotoLandscape color={c} />,
  },
  {
    id: "devices",
    label: "📋 Devices List",
    color: "#7C3AED",
    light: "#f5f3ff",
    icon: (c) => <PhotoFilm color={c} />,
  },
  {
    id: "photos",
    label: "Photo Library",
    color: "#16A34A",
    light: "#f0fdf4",
    icon: (c) => <PhotoGrid color={c} />,
  },
  {
    id: "network",
    label: "Network Health",
    color: "#EA580C",
    light: "#fff7ed",
    icon: (c) => <PhotoSignal color={c} />,
  },
  {
    id: "users",
    label: "👥 Admin Users",
    color: "#0891B2",
    light: "#ecfeff",
    icon: (c) => <PhotoGrid color={c} />,
  },
  {
    id: "auditlog",
    label: "📜 Audit Log",
    color: "#4B5563",
    light: "#f3f4f6",
    icon: (c) => <PhotoFilm color={c} />,
  },
  {
    id: "link",
    label: "Add Your Home Number",
    color: "#0891B2",
    light: "#ecfeff",
    icon: (c) => <PhotoGrid color={c} />,
  },
  {
    id: "settings",
    label: "System Settings",
    color: "#DC2626",
    light: "#fef2f2",
    icon: (c) => <PhotoGear color={c} />,
  },
];

/* ─── Glossy pill button ─── */
function GlossyBtn({
  label,
  color,
  textColor = "#fff",
  square = false,
  onClick,
  disabled = false,
}: {
  label: string;
  color: string;
  textColor?: string;
  square?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const darken = (hex: string, amt: number) => {
    if (hex.startsWith("rgba")) return hex;
    const n = parseInt(hex.slice(1), 16);
    if (isNaN(n)) return hex;
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled
          ? "#d1d5db"
          : `linear-gradient(to bottom, ${color} 0%, ${color} 45%, ${darken(color, 40)} 100%)`,
        boxShadow: disabled
          ? "none"
          : `0 1px 0 rgba(255,255,255,0.35) inset, 0 3px 6px rgba(0,0,0,0.25)`,
        color: textColor,
        border: disabled ? "1px solid #9ca3af" : `1px solid ${darken(color, 50)}`,
        borderRadius: square ? 0 : 999,
        padding: "7px 20px",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.08em",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap" as const,
        fontFamily: "inherit",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

/* ─── Photo placeholder ─── */
function PhotoSlot({
  label,
  primary = false,
}: {
  label: string;
  primary?: boolean;
}) {
  return (
    <div
      style={{
        aspectRatio: "1",
        border: primary ? "2px solid #2563EB" : "1px solid #e5e7eb",
        background: primary ? "#eff6ff" : "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
      }}
    >
      <PhotoLandscape color={primary ? "#2563EB" : "#9ca3af"} size={28} />
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: primary ? "#2563EB" : "#6b7280",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Helper: Format Date ─── */
function formatTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

// function escapeHtml(value: string | null | undefined) {
//   return String(value ?? "");
// }

function maskKey(key: string | null | undefined) {
  if (!key) return "-";
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

const UUID_REGEX = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

/* ─── Main Component ─── */
export function MergedDesign() {
  const [active, setActive] = useState<Section>("home");
  
  // Data states
  const [pending, setPending] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [disabled, setDisabled] = useState<any[]>([]);
  const [health, setHealth] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  // Expiry configuration saved locally
  const [approvalDays, setApprovalDays] = useState<number>(() => {
    const saved = localStorage.getItem("ccc_approval_duration_days");
    return saved ? parseInt(saved, 10) : 30;
  });

  // Table state management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUUIDs, setSelectedUUIDs] = useState<string[]>([]);
  
  // Inline editing states
  const [editingCell, setEditingCell] = useState<{ uuid: string; field: "home_number" | "user_id" } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Modal states
  const [detailDevice, setDetailDevice] = useState<any | null>(null);
  const [extendUUID, setExtendUUID] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState("30");
  const [transferUUID, setTransferUUID] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState("");
  
  // User Form Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    user_id: "",
    name: "",
    email: "",
    balance: "",
    credited: "",
    received_from: "",
    expiry_date: "",
  });

  // PIN input modal for Approvals
  const [pinApprovalModal, setPinApprovalModal] = useState<{ uuid: string; expectedPin: string } | null>(null);
  const [enteredPin, setEnteredPin] = useState("");

  // Quick Approve State
  const [localUuid, setLocalUuid] = useState("");

  // Remove checklist modal
  const [removeChecklistUUID, setRemoveChecklistUUID] = useState<string | null>(null);
  const [checklistChecks, setChecklistChecks] = useState({
    chk1: false,
    chk2: false,
    chk3: false,
  });

  // API Call helper
  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  };

  // Main reload function
  const reloadData = useCallback(async () => {
    try {
      const [p, a, d, h, u, l] = await Promise.all([
        fetchJson("/api/pending").catch(() => []),
        fetchJson("/api/approved").catch(() => []),
        fetchJson("/api/disabled").catch(() => []),
        fetchJson("/api/health").catch(() => ({})),
        fetchJson("/api/users").catch(() => []),
        fetchJson("/api/audit-log").catch(() => []),
      ]);

      setPending(p || []);
      setApproved(a || []);
      setDisabled(d || []);
      setHealth(h || {});
      setUsers(u || []);
      setAuditLog(l || []);
    } catch (err) {
      console.error("Error fetching console data:", err);
    }
  }, []);

  // Poll intervals
  useEffect(() => {
    reloadData();
    const timer = setInterval(reloadData, 10000);
    return () => clearInterval(timer);
  }, [reloadData]);

  // Handle default approval days duration changes
  const changeApprovalDays = (days: number) => {
    setApprovalDays(days);
    localStorage.setItem("ccc_approval_duration_days", String(days));
  };

  // Actions
  const handleApprove = async (uuid: string, pin: string) => {
    if (enteredPin.trim() !== pin.trim()) {
      alert("❌ Incorrect PIN. Please check the code on the kiosk screen.");
      return;
    }
    try {
      const result = await fetchJson("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, pin: enteredPin.trim(), duration_days: approvalDays }),
      });
      if (result.success) {
        alert(`✅ Station approved for ${result.duration_days} day(s)!\nSecure Key: ${result.secure_key}\nExpires: ${result.expires_at}`);
        setPinApprovalModal(null);
        setEnteredPin("");
        reloadData();
      }
    } catch (e: any) {
      alert("Error approving station: " + e.message);
    }
  };

  const handleDisable = async (uuid: string) => {
    if (!confirm(`Disable station ${uuid}?`)) return;
    try {
      const result = await fetchJson("/api/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      });
      if (result.success) {
        alert(`Station ${uuid} disabled.`);
        reloadData();
      }
    } catch (e: any) {
      alert("Error disabling station: " + e.message);
    }
  };

  const handleRemove = async (uuid: string) => {
    try {
      const result = await fetchJson("/api/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      });
      if (result.success) {
        alert(`Station ${uuid} removed.`);
        setRemoveChecklistUUID(null);
        setChecklistChecks({ chk1: false, chk2: false, chk3: false });
        reloadData();
      }
    } catch (e: any) {
      alert("Error removing station: " + e.message);
    }
  };

  const handleSaveField = async (uuid: string, field: "home_number" | "user_id", val: string) => {
    try {
      const payload: any = { uuid };
      payload[field] = val.trim();
      const result = await fetchJson("/api/update-kiosk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (result.success) {
        setEditingCell(null);
        reloadData();
      }
    } catch (e: any) {
      alert(`Error updating ${field}: ` + e.message);
    }
  };

  const handleForceApproveSubmit = async (uuid: string, setLocalUuid: (v: string) => void) => {
    const cleaned = uuid.trim().toUpperCase();
    if (!cleaned) {
      alert("Device UUID is required.");
      return;
    }
    if (!UUID_REGEX.test(cleaned)) {
      alert("❌ Invalid UUID format. Correct format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX");
      return;
    }
    try {
      const result = await fetchJson("/api/force-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: cleaned, duration_days: approvalDays }),
      });
      if (result.success) {
        let msg = "";
        if (result.already_approved) {
          msg = `✅ Station was already approved!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}`;
        } else if (result.reregistered) {
          msg = `✅ Device re-registered and approved for ${result.duration_days} day(s)!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}`;
        } else {
          msg = `✅ Station approved for ${result.duration_days} day(s)!\nHome No: ${result.home_number}\nExpires: ${result.expires_at}`;
        }
        alert(msg);
        setLocalUuid("");
        reloadData();
      }
    } catch (e: any) {
      alert("Error force approving device: " + e.message);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferUUID) return;
    if (!transferUserId.trim()) {
      alert("User ID cannot be empty.");
      return;
    }
    try {
      const result = await fetchJson("/api/transfer-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: transferUUID, new_user_id: transferUserId.trim() }),
      });
      if (result.success) {
        alert(`✅ Device transferred to ${result.new_user_id}!`);
        setTransferUUID(null);
        setTransferUserId("");
        reloadData();
      }
    } catch (e: any) {
      alert("Error transferring device: " + e.message);
    }
  };

  const handleWiFiReset = async (uuid: string) => {
    if (!confirm(`Reset kiosk ${uuid} for WiFi re-provisioning?\n\nThis will set it back to "pending" — it will need re-approval on next boot.`)) return;
    try {
      const result = await fetchJson("/api/reprovision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      });
      if (result.success) {
        alert("✅ Kiosk reset to pending status successfully!");
        reloadData();
      }
    } catch (e: any) {
      alert("Error resetting kiosk: " + e.message);
    }
  };

  const handleExtendSubmit = async () => {
    if (!extendUUID) return;
    const days = parseInt(extendDays, 10);
    if (isNaN(days) || days <= 0) {
      alert("Enter a valid number of days.");
      return;
    }
    try {
      const result = await fetchJson("/api/extend-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: extendUUID, days }),
      });
      if (result.success) {
        alert(`✅ Expiry extended +${days} days!\nNew Expiry: ${result.new_expiry}`);
        setExtendUUID(null);
        reloadData();
      }
    } catch (e: any) {
      alert("Error extending expiry: " + e.message);
    }
  };

  const handleRunExpireCheck = async () => {
    try {
      const result = await fetchJson("/api/expire-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const disabledList = result.expired_disabled || [];
      if (disabledList.length > 0) {
        alert(`⏱ Expiry check completed.\n${disabledList.length} device(s) auto-disabled:\n${disabledList.join("\n")}`);
      } else {
        alert(`✅ Expiry check completed. No expired devices found (${result.checked} checked).`);
      }
      reloadData();
    } catch (e: any) {
      alert("Error checking expirations: " + e.message);
    }
  };

  const handleUserSubmit = async () => {
    if (!userForm.user_id.trim()) {
      alert("User ID is required.");
      return;
    }
    try {
      const result = await fetchJson("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (result.success) {
        setUserModalOpen(false);
        setUserForm({
          user_id: "",
          name: "",
          email: "",
          balance: "",
          credited: "",
          received_from: "",
          expiry_date: "",
        });
        reloadData();
      }
    } catch (e: any) {
      alert("Error saving user: " + e.message);
    }
  };

  // Bulk actions handlers
  const handleBulkExtend = async () => {
    if (!selectedUUIDs.length) return;
    const daysStr = prompt(`Extend ${selectedUUIDs.length} device(s) by how many days?`, "30");
    if (!daysStr) return;
    const days = parseInt(daysStr, 10);
    if (isNaN(days) || days <= 0) return;
    let ok = 0, fail = 0;
    for (const uuid of selectedUUIDs) {
      try {
        const r = await fetchJson("/api/extend-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid, days }),
        });
        if (r.success) ok++; else fail++;
      } catch {
        fail++;
      }
    }
    setSelectedUUIDs([]);
    alert(`Bulk Extend complete: ${ok} succeeded, ${fail} failed.`);
    reloadData();
  };

  const handleBulkDisable = async () => {
    if (!selectedUUIDs.length) return;
    if (!confirm(`Disable ${selectedUUIDs.length} selected device(s)?`)) return;
    let ok = 0, fail = 0;
    for (const uuid of selectedUUIDs) {
      try {
        const r = await fetchJson("/api/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid }),
        });
        if (r.success) ok++; else fail++;
      } catch {
        fail++;
      }
    }
    setSelectedUUIDs([]);
    alert(`Bulk Disable complete: ${ok} succeeded, ${fail} failed.`);
    reloadData();
  };

  const toggleSelectAll = (checked: boolean, list: any[]) => {
    if (checked) {
      setSelectedUUIDs(list.map(d => d.uuid));
    } else {
      setSelectedUUIDs([]);
    }
  };

  const toggleSelectUUID = (uuid: string) => {
    setSelectedUUIDs(prev =>
      prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
    );
  };

  // Active navigation config
  const activeItem = navItems.find((n) => n.id === active)!;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f3f4f6",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 18px 18px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 6,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <IcoShield color="#fff" size={14} />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              MaainHome
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? "#fff" : "#374151",
                  background: isActive
                    ? `linear-gradient(to bottom, ${item.color}, ${item.color}cc)`
                    : "transparent",
                  boxShadow: isActive
                    ? "0 1px 0 rgba(255,255,255,0.2) inset, 0 2px 5px rgba(0,0,0,0.18)"
                    : "none",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  letterSpacing: "0.01em",
                  transition: "all 0.15s",
                }}
              >
                {isActive ? item.icon("#fff") : item.icon(item.color)}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: "#374151" }}>
                A
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Administrator
              </p>
              <p
                style={{
                  fontSize: 9,
                  color: "#9ca3af",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                fixscal.com
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("ccc_pin_authed");
              window.location.reload();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            <IcoSignOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 28px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 4,
                height: 22,
                background: activeItem.color,
                borderRadius: 2,
              }}
            />
            <h1
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {activeItem.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={reloadData}
              style={{
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: "#4b5563",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🔄 Refresh Data
            </button>
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
              Auto-sync: 10s
            </span>
          </div>
        </header>

        {/* Content View */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          
          {/* VIEW: CONTROL CENTER (Overview) */}
          {active === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Stats Counters Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Queue</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#1f2937", margin: 0 }}>{pending.length}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#10b981", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Approved Stations</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#1f2937", margin: 0 }}>{approved.length}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Disabled Stations</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#1f2937", margin: 0 }}>{disabled.length}</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Terminals</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#1f2937", margin: 0 }}>{pending.length + approved.length + disabled.length}</p>
                </div>
              </div>

              {/* Pending Queue Table */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#1f2937", letterSpacing: "0.05em" }}>PENDING PAIRING REQUESTS</span>
                  <span style={{ fontSize: 9, background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>ACTION REQUIRED</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>HOME NUMBER</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>DEVICE UUID</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>SECURITY PIN</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>LAST SEEN</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                            No pending pairing requests found.
                          </td>
                        </tr>
                      ) : (
                        pending.map((k) => (
                          <tr key={k.uuid} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{k.home_number || "N/A"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, fontFamily: "monospace", color: "#4b5563" }}>{k.uuid}</td>
                            <td style={{ padding: "12px 20px" }}>
                              <span style={{ background: "#eff6ff", color: "#2563EB", padding: "4px 8px", borderRadius: 4, fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>
                                {k.pin}
                              </span>
                            </td>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#6b7280" }}>{formatTime(k.lastSeen)}</td>
                            <td style={{ padding: "12px 20px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: 8 }}>
                                <GlossyBtn label="Approve" color="#10b981" onClick={() => setPinApprovalModal({ uuid: k.uuid, expectedPin: k.pin })} />
                                <GlossyBtn label="Remove" color="#ef4444" onClick={() => setRemoveChecklistUUID(k.uuid)} />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Approve Panel preview */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", padding: 20, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#1f2937" }}>Quick Approval Mode</h3>
                  <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>Bypass standard PIN challenge and force approve a terminal using its Device UUID.</p>
                </div>
                <GlossyBtn label="OPEN QUICK APPROVE" color="#2563EB" onClick={() => setActive("link")} />
              </div>
            </div>
          )}

          {/* VIEW: DEVICES LIST */}
          {active === "devices" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Search & Filters */}
              <div style={{ display: "flex", gap: 12, background: "#fff", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="🔍 Search UUID, Home Number, or User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 1, border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit" }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit", background: "#fff" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Only</option>
                  <option value="disabled">Disabled Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>

              {/* Combined Devices Table */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        <th style={{ padding: "12px 16px", width: 40 }}>
                          <input
                            type="checkbox"
                            checked={selectedUUIDs.length > 0 && selectedUUIDs.length === [...pending, ...approved, ...disabled].length}
                            onChange={(e) => toggleSelectAll(e.target.checked, [...pending, ...approved, ...disabled])}
                          />
                        </th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>HOME NUMBER</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>UUID</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>USER ID</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>EXPIRES AT</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>APPROVAL MODE</th>
                        <th style={{ padding: "12px 16px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const all = [...pending, ...approved, ...disabled];
                        const filtered = all.filter(k => {
                          const isExpired = k.expiresAt && new Date(k.expiresAt) < new Date();
                          const matchesStatus =
                            statusFilter === "all" ||
                            (statusFilter === "expired" && isExpired) ||
                            (statusFilter === k.status);

                          const matchQuery =
                            k.uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            k.home_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            k.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

                          return matchesStatus && matchQuery;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                                No matching devices found.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(k => {
                          const isExpired = k.expiresAt && new Date(k.expiresAt) < new Date();
                          const statusBg =
                            k.status === "approved"
                              ? isExpired
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(16, 185, 129, 0.1)"
                              : k.status === "disabled"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(245, 158, 11, 0.1)";

                          const statusColor =
                            k.status === "approved"
                              ? isExpired
                                ? "#ef4444"
                                : "#10b981"
                              : k.status === "disabled"
                              ? "#ef4444"
                              : "#f59e0b";

                          const isEditingHN = editingCell?.uuid === k.uuid && editingCell?.field === "home_number";
                          const isEditingUID = editingCell?.uuid === k.uuid && editingCell?.field === "user_id";

                          return (
                            <tr key={k.uuid} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "12px 16px" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedUUIDs.includes(k.uuid)}
                                  onChange={() => toggleSelectUUID(k.uuid)}
                                />
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {isEditingHN ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                      type="text"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      style={{ border: "1px solid #d1d5db", padding: "4px 8px", fontSize: 11, borderRadius: 4, width: 80 }}
                                    />
                                    <button onClick={() => handleSaveField(k.uuid, "home_number", editingValue)} style={{ background: "#10b981", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>✓</button>
                                    <button onClick={() => setEditingCell(null)} style={{ background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>✗</button>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{k.home_number || "N/A"}</span>
                                    {k.status === "approved" && (
                                      <button
                                        onClick={() => {
                                          setEditingCell({ uuid: k.uuid, field: "home_number" });
                                          setEditingValue(k.home_number || "");
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 11 }}
                                        title="Edit Home Number"
                                      >
                                        ✎
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <button
                                  onClick={() => setDetailDevice(k)}
                                  style={{ background: "none", border: "none", padding: 0, fontFamily: "monospace", color: "#2563EB", cursor: "pointer", textDecoration: "underline", fontSize: 11 }}
                                >
                                  {k.uuid.slice(0, 18)}...
                                </button>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span style={{ background: statusBg, color: statusColor, padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>
                                  {k.status} {isExpired && "(EXPIRED)"}
                                </span>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                {isEditingUID ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input
                                      type="text"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      style={{ border: "1px solid #d1d5db", padding: "4px 8px", fontSize: 11, borderRadius: 4, width: 80 }}
                                    />
                                    <button onClick={() => handleSaveField(k.uuid, "user_id", editingValue)} style={{ background: "#10b981", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>✓</button>
                                    <button onClick={() => setEditingCell(null)} style={{ background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>✗</button>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 11, color: "#4b5563" }}>{k.user_id || "Unclaimed"}</span>
                                    {k.status === "approved" && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingCell({ uuid: k.uuid, field: "user_id" });
                                            setEditingValue(k.user_id || "");
                                          }}
                                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 10 }}
                                          title="Edit User ID"
                                        >
                                          link
                                        </button>
                                        {k.user_id && (
                                          <button
                                            onClick={() => handleSaveField(k.uuid, "user_id", "")}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 10 }}
                                            title="Unlink User"
                                          >
                                            unlink
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: 11, color: isExpired ? "#ef4444" : "#4b5563" }}>{formatTime(k.expiresAt)}</td>
                              <td style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280" }}>{k.approvalMode || "-"}</td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: 4 }}>
                                  {k.status === "approved" && (
                                    <>
                                      <button onClick={() => { setExtendUUID(k.uuid); setExtendDays("30"); }} style={{ border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>+Days</button>
                                      <button onClick={() => { setTransferUUID(k.uuid); setTransferUserId(k.user_id || ""); }} style={{ border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Transfer</button>
                                      <button onClick={() => handleWiFiReset(k.uuid)} style={{ border: "1px solid #fbcfe8", color: "#db2777", background: "#fdf2f8", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>WiFi Reset</button>
                                      <button onClick={() => handleDisable(k.uuid)} style={{ border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Disable</button>
                                    </>
                                  )}
                                  <button onClick={() => setRemoveChecklistUUID(k.uuid)} style={{ border: "1px solid #fecaca", color: "#ef4444", background: "#fef2f2", cursor: "pointer", padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Remove</button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedUUIDs.length > 0 && (
                <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1f2937", padding: "12px 24px", borderRadius: 999, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 100 }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{selectedUUIDs.length} devices selected</span>
                  <GlossyBtn label="Extend Expiry" color="#3b82f6" onClick={handleBulkExtend} />
                  <GlossyBtn label="Disable" color="#ef4444" onClick={handleBulkDisable} />
                  <button onClick={() => setSelectedUUIDs([])} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Clear Selection</button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: PHOTO LIBRARY */}
          {active === "photos" && <PhotoLibrary />}

          {/* VIEW: NETWORK HEALTH */}
          {active === "network" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: "0.05em" }}>SYSTEM HEALTH & LATENCY</span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {[
                    { label: "Overall System Status", value: health.ok ? "Healthy & Secured" : "Maintenance / Warning Required", status: health.ok ? "ok" : "err" },
                    { label: "Firestore Database connection", value: health.db || "Firestore connected" },
                    { label: "Ping response latency", value: health.latency ? `${health.latency} ms` : "15 ms" },
                    { label: "Active Approval Scheme", value: health.approval_mode || "PIN-Verification" },
                    { label: "Default Kiosk Expiration Duration", value: `${approvalDays} days` }
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{row.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "#4b5563" }}>{row.value}</span>
                        <div style={{ width: 18, height: 18, background: "linear-gradient(to bottom, #4ade80, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999 }}>
                          <span style={{ color: "#fff" }}><IcoCheck size={10} /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance tools */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", padding: 20, borderRadius: 8 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "#1f2937" }}>System Expiry Checker</h3>
                <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Force evaluate database records right now. Terminals with expired leases will automatically turn to disabled status.</p>
                <GlossyBtn label="RUN EXPIRATIONS CHECK" color="#EA580C" onClick={handleRunExpireCheck} />
              </div>
            </div>
          )}

          {/* VIEW: CALL SESSIONS */}
          {active === "sessions" && <CallSessions />}

          {/* VIEW: ADD YOUR HOME NUMBER (Quick Approve) */}
          {active === "link" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", padding: 28, borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, background: "linear-gradient(to bottom, #22d3ee, #0891b2)", borderRadius: 8, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(8,145,178,0.4)" }}>
                    <IcoLink color="#fff" size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, color: "#1f2937", margin: 0 }}>Add Your Home Number (Quick Approve)</h2>
                    <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Bypass interactive pairing PIN challenges by registers using physical UUIDs.</p>
                  </div>
                </div>

                <div>
                      <p style={{ fontSize: 10, fontWeight: 800, color: "#374151", marginBottom: 6, textTransform: "uppercase" }}>DEVICE UUID</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input
                          type="text"
                          value={localUuid}
                          onChange={(e) => setLocalUuid(e.target.value)}
                          placeholder="e.g. 550E8400-E29B-41D4-A716-446655440000"
                          style={{ flex: 1, border: "1px solid #d1d5db", padding: "11px 16px", fontSize: 13, color: "#111", outline: "none", fontFamily: "monospace", borderRadius: 6 }}
                        />
                        <button
                          onClick={() => handleForceApproveSubmit(localUuid, setLocalUuid)}
                          style={{
                            background: "linear-gradient(to bottom, #22d3ee, #0891b2)",
                            boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset, 0 3px 6px rgba(0,0,0,0.18)",
                            color: "#fff",
                            border: "1px solid #0e7490",
                            borderRadius: 6,
                            padding: "11px 22px",
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontFamily: "inherit",
                          }}
                        >
                          <IcoLink color="#fff" size={13} /> FORCE PAIR STATION
                        </button>
                      </div>
                </div>
              </div>

              {/* Linked Stations */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: "0.05em" }}>ACTIVE DIRECT LINKED STATIONS</span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {approved.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                      No active stations linked yet.
                    </div>
                  ) : (
                    approved.map((station) => (
                      <div key={station.uuid} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #f3f4f6" }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginRight: 12 }}>{station.home_number || "Unlabeled"}</span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280" }}>{station.uuid}</span>
                        </div>
                        <span style={{ fontSize: 10, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>ACTIVE</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ADMIN USERS */}
          {active === "users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Configure client billing balances, account credits, and expiration limits.</p>
                <GlossyBtn
                  label="+ ADD NEW USER"
                  color="#0891B2"
                  onClick={() => {
                    setUserForm({
                      user_id: "",
                      name: "",
                      email: "",
                      balance: "",
                      credited: "",
                      received_from: "",
                      expiry_date: "",
                    });
                    setUserModalOpen(true);
                  }}
                />
              </div>

              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>USER ID</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>NAME</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>EMAIL</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>BALANCE</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>CREDITED</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>EXPIRY DATE</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>UPDATED AT</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em", textAlign: "right" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                            No admin users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const isExpired = u.expiry_date && new Date(u.expiry_date) < new Date();
                          return (
                            <tr key={u.user_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#1f2937" }}>{u.user_id}</td>
                              <td style={{ padding: "12px 20px", fontSize: 12, color: "#4b5563" }}>{u.name || "—"}</td>
                              <td style={{ padding: "12px 20px", fontSize: 11, color: "#6b7280" }}>{u.email || "—"}</td>
                              <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: "#059669" }}>₹{u.balance || "0"}</td>
                              <td style={{ padding: "12px 20px", fontSize: 12, color: "#4b5563" }}>₹{u.credited || "0"}</td>
                              <td style={{ padding: "12px 20px", fontSize: 11, color: isExpired ? "#ef4444" : "#4b5563", fontWeight: isExpired ? 700 : 500 }}>
                                {u.expiry_date || "—"} {isExpired && "(Expired)"}
                              </td>
                              <td style={{ padding: "12px 20px", fontSize: 11, color: "#9ca3af" }}>{formatTime(u.updated_at)}</td>
                              <td style={{ padding: "12px 20px", textAlign: "right" }}>
                                <GlossyBtn
                                  label="Edit"
                                  color="#0891B2"
                                  onClick={() => {
                                    setUserForm({
                                      user_id: u.user_id || "",
                                      name: u.name || "",
                                      email: u.email || "",
                                      balance: String(u.balance || ""),
                                      credited: String(u.credited || ""),
                                      received_from: u.received_from || "",
                                      expiry_date: u.expiry_date || "",
                                    });
                                    setUserModalOpen(true);
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: AUDIT LOG */}
          {active === "auditlog" && (
            <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>TIMESTAMP</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>ACTION</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>UUID</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>ADMIN</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>BEFORE</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>AFTER</th>
                      <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>NOTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                          No audit log entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLog.map((e, index) => {
                        const actionColor =
                          e.action === "approve"
                            ? "#10b981"
                            : e.action === "disable" || e.action === "remove"
                            ? "#ef4444"
                            : "#d97706";
                        return (
                          <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#9ca3af" }}>{formatTime(e.timestamp)}</td>
                            <td style={{ padding: "12px 20px" }}>
                              <span style={{ color: actionColor, fontWeight: 800, fontSize: 11, textTransform: "uppercase" }}>{e.action}</span>
                            </td>
                            <td style={{ padding: "12px 20px", fontFamily: "monospace", fontSize: 11, color: "#4b5563" }}>{e.uuid || "—"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 12, color: "#4b5563" }}>{e.admin_user || "—"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#9ca3af" }}>{e.before || "—"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#4b5563" }}>{e.after || "—"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#6b7280" }}>{e.note || "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: SYSTEM SETTINGS (Keys & Config) */}
          {active === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Approval Duration Config */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", padding: 24, borderRadius: 8 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Authorization Settings</h3>
                <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Configure default lease terms for new terminal approvals.</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Default Lease Duration:</label>
                  <select
                    value={approvalDays}
                    onChange={(e) => changeApprovalDays(parseInt(e.target.value, 10))}
                    style={{ border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit" }}
                  >
                    <option value={1}>1 Day</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>365 Days</option>
                    <option value={9999}>9999 Days (Unlimited)</option>
                  </select>
                </div>
              </div>

              {/* Security Keys Overview */}
              <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: "0.05em" }}>TERMINAL ENCRYPTION KEYS</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>HOME NUMBER</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>DEVICE UUID</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>SECURE CRYPTO KEY</th>
                        <th style={{ padding: "12px 20px", fontSize: 9, fontWeight: 800, color: "#9ca3af", letterSpacing: "0.05em" }}>PAIRED DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approved.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>
                            No active cryptographic keys found.
                          </td>
                        </tr>
                      ) : (
                        approved.map((k) => (
                          <tr key={k.uuid} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "12px 20px", fontSize: 12, fontWeight: 700, color: "#d97706" }}>{k.home_number || "N/A"}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, fontFamily: "monospace", color: "#4b5563" }}>{k.uuid}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, fontFamily: "monospace", color: "#4b5563" }}>{maskKey(k.secure_key)}</td>
                            <td style={{ padding: "12px 20px", fontSize: 11, color: "#6b7280" }}>{formatTime(k.approvedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL: DEVICE DETAIL ─── */}
      {detailDevice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: 500, maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#1f2937" }}>Device Profile Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto", marginBottom: 20 }}>
              {[
                { label: "Device UUID", val: detailDevice.uuid },
                { label: "Home Number", val: detailDevice.home_number },
                { label: "Pairing Status", val: detailDevice.status },
                { label: "Associated User ID", val: detailDevice.user_id },
                { label: "Expiration lease", val: formatTime(detailDevice.expiresAt) },
                { label: "Approval Mode", val: detailDevice.approvalMode },
                { label: "Registration PIN", val: detailDevice.pin },
                { label: "Secure Crypto Key", val: detailDevice.secure_key },
                { label: "Last Heartbeat seen", val: formatTime(detailDevice.lastSeen) },
                { label: "First Registered", val: formatTime(detailDevice.createdAt || detailDevice.firstSeen) },
                { label: "Kiosk Public IP", val: detailDevice.publicIP || detailDevice.sourceIP },
                { label: "Kiosk Private IP", val: detailDevice.privateIP }
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", borderBottom: "1px solid #f3f4f6", paddingBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", width: "40%", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#1f2937", flex: 1, wordBreak: "break-all" }}>{row.val || "—"}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right" }}>
              <GlossyBtn label="CLOSE DETAILS" color="#4B5563" onClick={() => setDetailDevice(null)} />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EXTEND LEASE ─── */}
      {extendUUID && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 360 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Extend Expiry Lease</h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Terminal UUID: <code style={{ fontFamily: "monospace" }}>{extendUUID.slice(0, 15)}...</code></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>ADD DAYS</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                style={{ border: "1px solid #d1d5db", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "end", gap: 10 }}>
              <GlossyBtn label="CANCEL" color="#9CA3AF" onClick={() => setExtendUUID(null)} />
              <GlossyBtn label="CONFIRM EXTENSION" color="#10b981" onClick={handleExtendSubmit} />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: TRANSFER OWNER ─── */}
      {transferUUID && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 360 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Transfer Device Owner</h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Terminal UUID: <code style={{ fontFamily: "monospace" }}>{transferUUID.slice(0, 15)}...</code></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>NEW USER ID</label>
              <input
                type="text"
                value={transferUserId}
                onChange={(e) => setTransferUserId(e.target.value)}
                style={{ border: "1px solid #d1d5db", padding: "10px 12px", borderRadius: 6, fontSize: 12 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "end", gap: 10 }}>
              <GlossyBtn label="CANCEL" color="#9CA3AF" onClick={() => setTransferUUID(null)} />
              <GlossyBtn label="TRANSFER NOW" color="#10b981" onClick={handleTransferSubmit} />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PIN APPROVAL CHALLENGE ─── */}
      {pinApprovalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 380 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>🔐 Kiosk Approval Code Challenge</h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Please enter the 6-digit verification code currently shown on the physical terminal screen to authorize.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>6-DIGIT VERIFICATION PIN</label>
              <input
                type="text"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="000000"
                style={{ border: "1px solid #d1d5db", padding: "12px 14px", borderRadius: 6, fontSize: 16, textAlign: "center", letterSpacing: "0.4em", fontWeight: 700 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "end", gap: 10 }}>
              <GlossyBtn label="CANCEL" color="#9CA3AF" onClick={() => { setPinApprovalModal(null); setEnteredPin(""); }} />
              <GlossyBtn label="VERIFY & APPROVE" color="#10b981" onClick={() => handleApprove(pinApprovalModal.uuid, pinApprovalModal.expectedPin)} />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: REMOVE SECURITY CHECKLIST ─── */}
      {removeChecklistUUID && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 440 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, color: "#ef4444" }}>⚠️ Revocation Safety Safeguard</h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: "#6b7280" }}>Terminal UUID: <code style={{ fontFamily: "monospace" }}>{removeChecklistUUID}</code></p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <label style={{ display: "flex", gap: 10, fontSize: 11, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checklistChecks.chk1}
                  onChange={(e) => setChecklistChecks(prev => ({ ...prev, chk1: e.target.checked }))}
                />
                <span>Confirm this will revoke all cryptographic keys for the kiosk.</span>
              </label>
              <label style={{ display: "flex", gap: 10, fontSize: 11, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checklistChecks.chk2}
                  onChange={(e) => setChecklistChecks(prev => ({ ...prev, chk2: e.target.checked }))}
                />
                <span>Confirm the physical kiosk will reboot and lose all secure lines.</span>
              </label>
              <label style={{ display: "flex", gap: 10, fontSize: 11, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={checklistChecks.chk3}
                  onChange={(e) => setChecklistChecks(prev => ({ ...prev, chk3: e.target.checked }))}
                />
                <span>Confirm this action is permanent and cannot be undone without re-pairing.</span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "end", gap: 10 }}>
              <GlossyBtn label="CANCEL" color="#9CA3AF" onClick={() => { setRemoveChecklistUUID(null); setChecklistChecks({ chk1: false, chk2: false, chk3: false }); }} />
              <GlossyBtn
                label="PERMANENTLY REVOKE"
                color="#ef4444"
                disabled={!(checklistChecks.chk1 && checklistChecks.chk2 && checklistChecks.chk3)}
                onClick={() => handleRemove(removeChecklistUUID)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT ADMIN USER ─── */}
      {userModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 420 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: "#1f2937" }}>Configure Admin User Profile</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>USER ID *</label>
                <input
                  type="text"
                  value={userForm.user_id}
                  onChange={(e) => setUserForm(prev => ({ ...prev, user_id: e.target.value }))}
                  style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>FULL NAME</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>BALANCE (₹)</label>
                  <input
                    type="text"
                    value={userForm.balance}
                    onChange={(e) => setUserForm(prev => ({ ...prev, balance: e.target.value }))}
                    style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>CREDITED (₹)</label>
                  <input
                    type="text"
                    value={userForm.credited}
                    onChange={(e) => setUserForm(prev => ({ ...prev, credited: e.target.value }))}
                    style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>RECEIVED FROM</label>
                <input
                  type="text"
                  value={userForm.received_from}
                  onChange={(e) => setUserForm(prev => ({ ...prev, received_from: e.target.value }))}
                  style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: "#4b5563" }}>EXPIRY DATE</label>
                <input
                  type="date"
                  value={userForm.expiry_date}
                  onChange={(e) => setUserForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  style={{ border: "1px solid #d1d5db", padding: "8px 10px", borderRadius: 6, fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "end", gap: 10 }}>
              <GlossyBtn label="CANCEL" color="#9CA3AF" onClick={() => setUserModalOpen(false)} />
              <GlossyBtn label="SAVE PROFILE" color="#0891B2" onClick={handleUserSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoLibrary() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
          11 photo slots · Displayed as screensavers on your Home Station
        </p>
        <GlossyBtn label="+ UPLOAD PHOTO" color="#16A34A" square />
      </div>
      <div
        style={{ border: "1px solid #e5e7eb", background: "#fff", padding: 20 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 10,
          }}
        >
          {SCREENSAVERS.map((s) => (
            <PhotoSlot key={s.id} label={s.label} primary={s.primary} />
          ))}
          <div
            style={{
              aspectRatio: "1",
              border: "1.5px dashed #d1d5db",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <IcoPlus color="#9ca3af" />
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#9ca3af",
              }}
            >
              ADD SLOT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallSessions() {
  return (
    <div style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid #f3f4f6",
          background: "#f9fafb",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#6b7280",
          }}
        >
          FULL CALL HISTORY
        </span>
        <span
          style={{
            background: "linear-gradient(to bottom,#4ade80,#16a34a)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            padding: "3px 10px",
            borderRadius: 999,
            boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset",
          }}
        >
          LIVE
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          padding: "10px 20px",
          borderBottom: "1px solid #f3f4f6",
          background: "#f9fafb",
          gap: 8,
        }}
      >
        {["TIMESTAMP", "DURATION", "STATUS"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#9ca3af",
            }}
          >
            {h}
          </span>
        ))}
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#9ca3af",
          }}
        >
          CALL
        </span>
      </div>
      <div
        style={{
          padding: "64px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ border: "1px solid #e5e7eb", padding: 14, borderRadius: 8 }}>
          <PhotoFilm color="#d1d5db" size={32} />
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#d1d5db",
            fontWeight: 700,
          }}
        >
          NO CALL LOGS RECORDED YET
        </span>
      </div>
    </div>
  );
}
