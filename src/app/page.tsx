"use client";

import React, { useState, useId } from "react";
import Image from "next/image";
import { Check, Copy, AlertCircle, Loader2, Sparkles, MapPin } from "lucide-react";

interface ClaimResponse {
  success: boolean;
  claimCode?: string;
  message: string;
}

export default function MorrowClaimPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<{ name?: string; phone?: string }>({});
  const [successData, setSuccessData] = useState<ClaimResponse | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const nameInputId = useId();
  const phoneInputId = useId();

  const validate = () => {
    const errors: { name?: string; phone?: string } = {};
    const trimmedName = name.trim();
    const cleanedPhone = phone.replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = "Enter your full name or nickname (2+ characters).";
    }

    if (!cleanedPhone) {
      errors.phone = "Phone number is required to receive voucher.";
    } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errors.phone = "Enter a valid 10-digit mobile number (e.g. 9876543210).";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
        }),
      });

      const data: ClaimResponse = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.message || "Unable to process your request. Please try again.");
      } else {
        setSuccessData(data);
      }
    } catch {
      setApiError("Network issue: Unable to reach the server. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!successData?.claimCode) return;
    try {
      await navigator.clipboard.writeText(successData.claimCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#fdf8f4] text-[#27150c]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden flex flex-col">
        
        {/* Hero Image & Branding */}
        <div className="relative h-44 sm:h-48 w-full bg-stone-900">
          <Image
            src="/images/morrow-hero.webp"
            alt="Morrow Café ambiance"
            fill
            priority
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#27150c] via-[#27150c]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-amber-200 mb-1.5">
              <Sparkles className="w-3 h-3" /> In-Dine Exclusive
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight leading-tight">
              Morrow Café
            </h1>
            <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-400" /> Sector 104, Noida
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          {!successData ? (
            <div>
              <section className="text-center mb-6">
                <div className="inline-block bg-[#f9eee3] text-[#b85d19] px-4 py-1.5 rounded-2xl mb-2.5">
                  <span className="text-2xl font-bold tracking-tight">₹150 OFF</span>
                </div>
                <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
                  Your Next Handcrafted Coffee & Bite
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  Thanks for visiting us today. Enter your details below to lock in ₹150 OFF your next table order.
                </p>
              </section>

              {/* Server-Side Alert Message */}
              <div aria-live="polite">
                {apiError && (
                  <div
                    role="alert"
                    className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>{apiError}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label
                    htmlFor={nameInputId}
                    className="block text-xs font-semibold text-stone-900 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (clientErrors.name) setClientErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-stone-900 placeholder-stone-400 bg-stone-50/50 focus:bg-white transition-colors duration-200 outline-none focus:ring-2 ${
                      clientErrors.name
                        ? "border-red-400 focus:ring-red-200"
                        : "border-stone-200 focus:border-[#b85d19] focus:ring-[#b85d19]/20"
                    }`}
                    aria-describedby={clientErrors.name ? "name-error" : undefined}
                    disabled={isLoading}
                  />
                  {clientErrors.name && (
                    <p id="name-error" className="mt-1 text-xs text-red-600 font-medium">
                      {clientErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={phoneInputId}
                    className="block text-xs font-semibold text-stone-900 mb-1"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500">
                      +91
                    </span>
                    <input
                      id={phoneInputId}
                      type="tel"
                      name="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        if (clientErrors.phone) setClientErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="98765 43210"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm text-stone-900 placeholder-stone-400 bg-stone-50/50 focus:bg-white transition-colors duration-200 outline-none focus:ring-2 ${
                        clientErrors.phone
                          ? "border-red-400 focus:ring-red-200"
                          : "border-stone-200 focus:border-[#b85d19] focus:ring-[#b85d19]/20"
                      }`}
                      aria-describedby={clientErrors.phone ? "phone-error" : undefined}
                      disabled={isLoading}
                    />
                  </div>
                  {clientErrors.phone && (
                    <p id="phone-error" className="mt-1 text-xs text-red-600 font-medium">
                      {clientErrors.phone}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-[#b85d19] hover:bg-[#9c4c11] text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-[#b85d19] outline-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <span>Claim ₹150 OFF</span>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-center text-stone-400 mt-4">
                Valid for 30 days on orders above ₹400. One redemption per table.
              </p>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-2 flex flex-col items-center" aria-live="polite">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-inner">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>

              <span className="text-xs font-semibold tracking-wider uppercase text-green-700 bg-green-50 px-2.5 py-1 rounded-md mb-2">
                ₹150 OFF Claimed
              </span>

              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Here is your voucher, {name.split(" ")[0]}!
              </h2>

              <p className="text-xs text-stone-600 mt-1 mb-5">
                Show this code to our barista during billing on your next visit.
              </p>

              {/* Voucher Ticket UI */}
              <div className="w-full bg-[#fdf8f4] border-2 border-dashed border-[#f2dbc5] rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-[10px] text-stone-500 uppercase font-semibold">Voucher Code</span>
                  <span className="font-mono text-xl font-bold tracking-wider text-stone-900">
                    {successData.claimCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-white border border-stone-200 hover:border-[#b85d19] text-stone-800 text-xs font-semibold rounded-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#b85d19]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                      <span className="text-green-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-50 rounded-xl p-3 text-left w-full border border-stone-200/60 mb-5">
                <p className="text-[11px] font-semibold text-stone-700 mb-1">Redemption Notes:</p>
                <ul className="text-[11px] text-stone-500 list-disc list-inside space-y-0.5">
                  <li>Show this screen or code at Morrow Café, Sector 104.</li>
                  <li>Takes ₹150 off total bill (min order ₹400).</li>
                  <li>Valid for 30 days from today.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setName("");
                  setPhone("");
                }}
                className="text-xs text-stone-500 hover:text-[#b85d19] underline underline-offset-2 transition-colors"
              >
                Claim another voucher
              </button>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <footer className="bg-stone-50 border-t border-stone-100 px-6 py-3 text-center">
          <p className="text-[11px] text-stone-400">
            Morrow Café & Roastery • Sector 104, Noida
          </p>
        </footer>
      </div>
    </main>
  );
}