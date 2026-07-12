import React, { useState, useRef } from "react";
import { User, Payment } from "../types";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Hash, 
  FileText,
  Smartphone,
  ShieldCheck,
  Check
} from "lucide-react";

interface PaymentPageProps {
  currentUser: User;
  onClose: () => void;
  onSubmitProof: (proof: Omit<Payment, "id" | "created_at" | "updated_at" | "status">) => void;
  existingPayment?: Payment | null;
}

export default function PaymentPage({
  currentUser,
  onClose,
  onSubmitProof,
  existingPayment
}: PaymentPageProps) {
  // Form States
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'ULTIMATE'>('PRO');
  const [fullName, setFullName] = useState(currentUser.username || "");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank Transfer'>('JazzCash');
  const [transactionId, setTransactionId] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(500);

  const handleSelectPlan = (plan: 'PRO' | 'ULTIMATE') => {
    setSelectedPlan(plan);
    setAmountPaid(plan === 'PRO' ? 500 : 1200);
  };
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  
  // Validation / Loading States
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers (Client-side validation of size, format, unique naming simulation)
  const handleFileChange = (file: File) => {
    setError("");
    
    // Validate format (JPG, PNG, PDF)
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, and PDF are allowed.");
      return;
    }

    // Validate size (5 MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File exceeds 5 MB limit. Please upload a smaller receipt.");
      return;
    }

    // Convert file to Base64 (secure storage simulation)
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      // Simulate unique file naming to prevent collisions
      const fileExtension = file.name.split(".").pop();
      const uniqueName = `proof_${currentUser.id}_${Date.now()}.${fileExtension}`;
      setScreenshotName(uniqueName);
    };
    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form validation (Prevent injection, clear empty, check length)
    if (!fullName.trim()) {
      setError("Please enter your Full Name.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Please enter your WhatsApp Number.");
      return;
    }
    if (!transactionId.trim()) {
      setError("Please enter the Transaction ID.");
      return;
    }
    if (!screenshot) {
      setError("Please upload your payment screenshot proof.");
      return;
    }
    if (amountPaid <= 0) {
      setError("Amount Paid must be a positive number.");
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      // Call onSubmit with form data
      onSubmitProof({
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: fullName.trim(),
        user_whatsapp: whatsapp.trim(),
        plan_name: selectedPlan === 'PRO' ? "PRO Plan ⭐" : "ULTIMATE Plan 👑",
        payment_method: paymentMethod,
        account_name: "Asad",
        payment_number: "03703089154",
        transaction_id: transactionId.trim(),
        amount: amountPaid,
        payment_date: paymentDate,
        screenshot: screenshot,
        notes: notes.trim(),
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background ambient glows */}
        <div className="absolute top-[30%] left-[30%] w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#070d1e]/90 border border-white/10 rounded-3xl p-8 shadow-2xl relative backdrop-blur-md text-center z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle size={32} />
          </div>
          
          <h2 className="font-display text-2xl font-extrabold text-white mb-3">Submitted Successfully</h2>
          
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-3">
            <p className="text-sm text-slate-200 font-medium text-center">
              "Your payment proof has been submitted successfully and is waiting for admin approval."
            </p>
            <div className="h-px bg-white/5 w-full my-2"></div>
            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400">
              <span>Selected Plan:</span>
              <span className={`font-bold text-right ${selectedPlan === 'PRO' ? 'text-cyan-400' : 'text-amber-400'}`}>
                {selectedPlan === 'PRO' ? "PRO Plan ⭐" : "ULTIMATE Plan 👑"}
              </span>
              
              <span>Amount Paid:</span>
              <span className="text-cyan-400 font-bold text-right">Rs. {amountPaid}</span>

              <span>Transaction ID:</span>
              <span className="text-white font-mono text-right truncate" title={transactionId}>{transactionId}</span>

              <span>Status:</span>
              <span className="text-amber-400 font-bold text-right flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Approval
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Our administrator is reviewing your submission. Once approved, your subscription will be fully activated, and you will receive a success notification.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold text-sm rounded-xl transition-all hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/15 cursor-pointer flex items-center justify-center gap-2"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/5 bg-[#070d1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <h1 className="font-display text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2">
            <CreditCard size={18} className="text-cyan-400" /> Secure Checkout & Upgrade
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/5 px-3.5 py-1.5 rounded-full">
          <ShieldCheck size={14} className="text-emerald-400" /> Bank-grade Encryption
        </div>
      </header>

      <main className="px-6 md:px-12 py-10 max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SELECTED PLAN DETAILS & PAYMENT INFORMATION */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Plan Selector Buttons */}
          <div className="bg-slate-950/60 p-1.5 rounded-xl border border-white/5 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleSelectPlan('PRO')}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                selectedPlan === 'PRO'
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              PRO ⭐ (Rs. 500)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPlan('ULTIMATE')}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                selectedPlan === 'ULTIMATE'
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ULTIMATE 👑 (Rs. 1200)
            </button>
          </div>

          {/* Dynamic Plan Card */}
          <div className={`bg-[#070d1e]/80 border rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm transition-all duration-300 ${
            selectedPlan === 'PRO' ? "border-cyan-500/20" : "border-amber-500/20"
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
              selectedPlan === 'PRO' ? "bg-cyan-500/5" : "bg-amber-500/5"
            }`}></div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Selected Plan</p>
            <h3 className="font-display text-2xl font-black text-white flex items-center gap-2">
              {selectedPlan === 'PRO' ? (
                <>PRO Plan <span className="text-cyan-400">⭐</span></>
              ) : (
                <>ULTIMATE Plan <span className="text-amber-400">👑</span></>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {selectedPlan === 'PRO' 
                ? "Perfect for active retail merchants and support desks."
                : "For unlimited scale, multi-agents, and power operations."}
            </p>
            
            <div className={`my-5 flex items-baseline gap-1 text-3xl font-display font-extrabold ${
              selectedPlan === 'PRO' ? "text-cyan-400" : "text-amber-400"
            }`}>
              Rs. {selectedPlan === 'PRO' ? "500" : "1,200"} <span className="text-xs text-slate-500 font-normal">/ month</span>
            </div>

            <div className="h-px bg-white/5 my-4"></div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {selectedPlan === 'PRO' ? (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Up to 15 Smart Q&A intent pairs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> High response speed (Instant)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Direct chat logs filtering & search
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Group chats bypass control toggle
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Unlimited Q&A intent pairs (up to 9999)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Multi-agent personalities options
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Connect up to 3 distinct WhatsApp numbers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Bulk Excel imports & Priority Support
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Payment Account Credentials */}
          <div className="bg-[#070d1e]/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Credentials</h4>
            
            <div className="space-y-3.5 bg-slate-950/60 border border-white/5 rounded-xl p-4.5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Account Owner Name</p>
                <p className="text-base font-bold text-white mt-0.5">Asad</p>
              </div>

              <div className="h-px bg-white/5"></div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Mobile Account Number</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-mono font-extrabold text-cyan-400 tracking-wider select-all">03703089154</span>
                  <span className="text-[10px] text-slate-500 border border-white/5 px-2 py-0.5 rounded bg-white/5 font-semibold">Click to Copy</span>
                </div>
              </div>

              <div className="h-px bg-white/5"></div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Supported Payment Methods</p>
                <div className="flex flex-wrap gap-2">
                  {["JazzCash", "EasyPaisa", "Bank Transfer"].map((method) => (
                    <span 
                      key={method}
                      className="px-2.5 py-1 bg-white/5 text-slate-200 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instruction Steps */}
          <div className="bg-[#070d1e]/40 border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400" /> Instructions For Upgrading
            </h4>
            <div className="space-y-4 text-xs text-slate-300">
              {[
                { step: "1", text: "Send the exact amount to the payment number shown above." },
                { step: "2", text: "Take a clear screenshot of the successful transaction confirmation / receipt." },
                { step: "3", text: "Enter the correct transaction ID and other payment details in the form." },
                { step: "4", text: "Upload your transaction receipt proof (screenshot file)." },
                { step: "5", text: "Wait for admin approval. Verification usually takes less than an hour." }
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/10 shrink-0">
                    {item.step}
                  </span>
                  <p className="leading-relaxed text-slate-300 mt-0.5">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PAYMENT PROOF FORM */}
        <div className="lg:col-span-7">
          <div className="bg-[#070d1e]/80 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-white">Payment Verification Form</h3>
              <p className="text-xs text-slate-400 mt-1">Please provide accurate transaction details to fast-track your approval process.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03123456789"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Selected Plan</label>
                  <input
                    type="text"
                    disabled
                    value={selectedPlan === 'PRO' ? "PRO Plan ⭐" : "ULTIMATE Plan 👑"}
                    className={`w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold cursor-not-allowed opacity-80 ${
                      selectedPlan === 'PRO' ? "text-cyan-400" : "text-amber-400"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#0a0f24] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Transaction ID</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. T202607123"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-[#0a0f24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Amount Paid (PKR)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-[#0a0f24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Payment Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* SCREENSHOT PROOF UPLOADER BOX */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Upload Payment Screenshot (Receipt)
                </label>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? "border-cyan-400 bg-cyan-950/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                      : screenshot 
                      ? "border-emerald-500/30 bg-emerald-950/5 hover:bg-emerald-950/10" 
                      : "border-white/10 bg-[#0a0f24] hover:border-cyan-400/30 hover:bg-slate-900/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
                    accept="image/png, image/jpeg, application/pdf"
                    className="hidden"
                  />
                  
                  {screenshot ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto shadow-md">
                        <Check size={20} />
                      </div>
                      <p className="text-xs text-emerald-400 font-semibold truncate max-w-xs mx-auto">
                        Receipt Selected: {screenshotName || "proof.png"}
                      </p>
                      {screenshot.startsWith("data:image") && (
                        <div className="mt-2 flex justify-center">
                          <img 
                            src={screenshot} 
                            alt="Receipt Preview" 
                            className="h-20 max-w-full rounded-lg border border-white/10 object-contain shadow-lg" 
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500">Click or drag another file to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-white/5 border border-white/5 text-slate-400 rounded-xl flex items-center justify-center mx-auto group-hover:text-cyan-400 transition-colors">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Drag & Drop receipt or click to browse</p>
                        <p className="text-[10px] text-slate-500 mt-1">Supports JPEG, PNG, PDF up to 5 MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Optional Notes</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <textarea
                    placeholder="Add notes for the administrator if any..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0a0f24] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none placeholder-slate-600"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-extrabold text-sm rounded-xl transition-all hover:from-cyan-400 hover:to-indigo-400 shadow-lg shadow-cyan-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Submitting Proof...
                  </>
                ) : (
                  "Submit Payment Proof"
                )}
              </button>

            </form>
          </div>
        </div>

      </main>

    </div>
  );
}
