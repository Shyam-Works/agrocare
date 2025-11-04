// pages/otp-verify.js
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function OTPVerify() {
  const router = useRouter();
  const { email } = router.query;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("otp"); // 'otp' or 'password'
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("password");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Verification failed");
    }
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const otpCode = otp.join("");

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpCode,
          newPassword: passwords.new,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/login?message=Password reset successful");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Reset failed");
    }
    setLoading(false);
  };

  // Auto verify when OTP is complete
  useEffect(() => {
    if (otp.every((digit) => digit) && step === "otp") {
      verifyOTP();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {step === "otp" ? (
          <>
            <h1 className="text-2xl font-bold text-center mb-2">Enter OTP</h1>
            <p className="text-gray-600 text-center mb-6">
              We sent a code to {email}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-center space-x-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  disabled={loading}
                />
              ))}
            </div>

            {loading && (
              <div className="text-center text-gray-600">Verifying...</div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Set New Password
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={resetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
