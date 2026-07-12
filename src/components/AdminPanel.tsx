import React, { useState } from "react";
import { User, Payment } from "../types";
import { 
  Users, 
  Star, 
  MessageSquare, 
  ArrowLeft, 
  Receipt, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  ExternalLink,
  MessageCircle,
  FileText
} from "lucide-react";

interface AdminPanelProps {
  users: User[];
  onSetPremium: (userId: number, isPremium: boolean) => void;
  onClose: () => void;
  payments: Payment[];
  onApprovePayment: (paymentId: number) => void;
  onRejectPayment: (paymentId: number, reason: string) => void;
  onDeletePayment: (paymentId: number) => void;
}

export default function AdminPanel({ 
  users, 
  onSetPremium, 
  onClose,
  payments,
  onApprovePayment,
  onRejectPayment,
  onDeletePayment
}: AdminPanelProps) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMsg, setErrorErrorMsg] = useState("");
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"users" | "payments">("users");

  // Rejection Dialog State
  const [rejectingPaymentId, setRejectingPaymentId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Screenshot Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState("");

  const handleLogin = () => {
    if (adminPassword === "ASAD1432") {
      setIsAdminLoggedIn(true);
      setErrorErrorMsg("");
    } else {
      setErrorErrorMsg("Wrong password!");
    }
  };

  const totalUsers = users.length;
  const premiumCount = users.filter((u) => u.is_premium).length;
  const totalMessages = users.reduce((sum, u) => sum + (u.total_messages || 0), 0);
  const pendingPaymentsCount = payments.filter(p => p.status === "Pending Approval").length;

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[30%] left-[30%] w-[350px] h-[350px] bg-cyan-900/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm bg-[#070d1e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl relative backdrop-blur-sm z-10">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Exit
          </button>

          <div className="text-center mt-6">
            <h1 className="font-display text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-1">AI-Agent Admin</h1>
            <p className="text-xs text-slate-400 mb-6">Enter admin password to access the panel</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400 text-center">{errorMsg}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm rounded-xl transition-all hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/15 cursor-pointer"
            >
              Sign In to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenReject = (paymentId: number) => {
    setRejectingPaymentId(paymentId);
    setRejectionReason("");
  };

  const handleConfirmReject = () => {
    if (rejectingPaymentId !== null && rejectionReason.trim()) {
      onRejectPayment(rejectingPaymentId, rejectionReason.trim());
      setRejectingPaymentId(null);
      setRejectionReason("");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-white/5 bg-[#070d1e]/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Close
          </button>
          <span className="w-px h-4 bg-white/10" />
          <h1 className="font-display text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI-Agent Admin Control Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-xs text-slate-400 border border-white/10 hover:border-cyan-400 px-3.5 py-1.5 rounded-xl hover:text-white transition-colors cursor-pointer"
          >
            Logout Admin
          </button>
        </div>
      </header>

      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto relative z-10">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Total Users</p>
              <h3 className="text-3xl font-display font-extrabold text-cyan-400">{totalUsers}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/10"><Users size={20} /></div>
          </div>
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Premium Accounts</p>
              <h3 className="text-3xl font-display font-extrabold text-amber-400">{premiumCount}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/10"><Star size={20} /></div>
          </div>
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Total Message Volume</p>
              <h3 className="text-3xl font-display font-extrabold text-indigo-400">{totalMessages}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10"><MessageSquare size={20} /></div>
          </div>
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl backdrop-blur-sm relative">
            {pendingPaymentsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                {pendingPaymentsCount}
              </span>
            )}
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Pending Receipts</p>
              <h3 className={`text-3xl font-display font-extrabold ${pendingPaymentsCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
                {pendingPaymentsCount}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/10">
              <Receipt size={20} />
            </div>
          </div>
        </div>

        {/* ADMIN TAB HEADERS */}
        <div className="flex gap-4 border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3.5 px-4 font-semibold text-sm transition-all relative ${
              activeTab === "users" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Registered Users ({totalUsers})
            {activeTab === "users" && (
              <span className="absolute bottom-0 inset-x-4 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3.5 px-4 font-semibold text-sm transition-all relative flex items-center gap-2 ${
              activeTab === "payments" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Payments & Receipts ({payments.length})
            {pendingPaymentsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-950 rounded">
                {pendingPaymentsCount}
              </span>
            )}
            {activeTab === "payments" && (
              <span className="absolute bottom-0 inset-x-4 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: USERS LIST */}
        {activeTab === "users" && (
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Registered Users</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0a0f24] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4">Total Messages</th>
                    <th className="p-4">Joined On</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-400">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 font-semibold text-white">{u.id}</td>
                      <td className="p-4 text-slate-200" title={u.email}>{u.email}</td>
                      <td className="p-4 font-medium text-slate-200">{u.username || "—"}</td>
                      <td className="p-4">
                        {u.is_premium ? (
                          <span className="px-2 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/10 rounded-lg text-xs font-semibold">PRO ⭐</span>
                        ) : (
                          <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-xs">FREE</span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.payment_status === "Pending Approval" ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded text-xs font-medium">Pending Approval</span>
                        ) : u.payment_status === "Approved" ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded text-xs font-medium">Approved</span>
                        ) : u.payment_status === "Rejected" ? (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded text-xs font-medium" title={u.rejection_reason}>Rejected</span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-200">{u.total_messages}</td>
                      <td className="p-4 text-xs">{u.joined}</td>
                      <td className="p-4 pr-6 text-right">
                        {u.is_premium ? (
                          <button
                            onClick={() => onSetPremium(u.id, false)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Downgrade
                          </button>
                        ) : (
                          <button
                            onClick={() => onSetPremium(u.id, true)}
                            className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
                          >
                            Upgrade to PRO ⭐
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENTS MANAGEMENT LIST */}
        {activeTab === "payments" && (
          <div className="bg-[#070d1e]/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Payment Submissions Database Table</h4>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="mx-auto text-slate-600 mb-4" size={40} />
                <h5 className="font-semibold text-white text-base">No payments submitted yet</h5>
                <p className="text-xs text-slate-400 mt-1">Receipt submissions from users will show up here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0a0f24] text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">Receipt ID</th>
                      <th className="p-4">Sender Details</th>
                      <th className="p-4">Plan Name</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Date Sent</th>
                      <th className="p-4">Proof File</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-400">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-colors align-top">
                        <td className="p-4 pl-6 font-semibold text-white">#{p.id}</td>
                        <td className="p-4 space-y-1">
                          <p className="text-white font-semibold">{p.user_name}</p>
                          <p className="text-slate-400 font-mono text-[11px]">{p.user_email}</p>
                          <p className="text-slate-500 flex items-center gap-1">
                            <MessageCircle size={12} className="text-emerald-400" />
                            {p.user_whatsapp}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="text-cyan-400 font-bold font-mono">{p.plan_name}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-900 border border-white/5 text-slate-300 rounded">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-white select-all">{p.transaction_id}</td>
                        <td className="p-4 text-cyan-400 font-extrabold text-sm">Rs. {p.amount}</td>
                        <td className="p-4 text-slate-400 whitespace-nowrap">{p.payment_date}</td>
                        <td className="p-4">
                          {p.screenshot ? (
                            <button
                              onClick={() => {
                                setLightboxImage(p.screenshot);
                                setLightboxName(`${p.user_name}'s Payment Proof`);
                              }}
                              className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/30 text-white hover:text-cyan-400 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                            >
                              <Eye size={12} /> View proof
                            </button>
                          ) : (
                            <span className="text-slate-600">No screenshot</span>
                          )}
                        </td>
                        <td className="p-4 space-y-1.5">
                          {p.status === "Pending Approval" ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded text-[10px] font-bold">
                              PENDING APPROVAL
                            </span>
                          ) : p.status === "Approved" ? (
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded text-[10px] font-bold">
                                APPROVED
                              </span>
                              <p className="text-[9px] text-slate-500 italic block">By {p.approved_by} on {p.approved_at?.split("T")[0]}</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded text-[10px] font-bold block w-max">
                                REJECTED
                              </span>
                              {p.rejection_reason && (
                                <p className="text-[10px] text-rose-300 max-w-[150px] leading-tight break-words font-medium">Reason: {p.rejection_reason}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-y-2">
                          {p.status === "Pending Approval" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => onApprovePayment(p.id)}
                                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                title="Approve subscription"
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReject(p.id)}
                                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                title="Reject receipt"
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            {p.notes && (
                              <div className="text-[10px] text-slate-500 italic bg-white/5 px-2 py-1 rounded max-w-[180px] break-words text-left" title="Note from User">
                                <strong>Note:</strong> {p.notes}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this payment record from the database table?")) {
                                  onDeletePayment(p.id);
                                }
                              }}
                              className="p-1.5 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/10 rounded-lg transition-all cursor-pointer self-start"
                              title="Delete record permanently"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* SCREENSHOT PROOF LIGHTBOX */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="bg-[#070d1e] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setLightboxImage(null);
                setLightboxName("");
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="font-display text-sm font-bold text-white mb-4">{lightboxName}</h3>
            <div className="bg-slate-950 rounded-xl p-2 border border-white/5 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img 
                src={lightboxImage} 
                alt="Payment Proof Lightbox" 
                className="max-h-[55vh] max-w-full rounded-lg object-contain shadow-2xl" 
              />
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON PROMPT DIALOG */}
      {rejectingPaymentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#070d1e] border border-white/10 rounded-3xl p-6 shadow-2xl relative max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="text-rose-400" size={18} /> Specify Rejection Reason
            </h3>
            <p className="text-xs text-slate-400 mb-4">Please type a clear reason for rejecting the receipt so the user can fix and re-submit.</p>
            
            <div className="space-y-4">
              <textarea
                placeholder="e.g. Transaction ID was not found or incorrect amount sent."
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0f24] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none placeholder-slate-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectingPaymentId(null)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
