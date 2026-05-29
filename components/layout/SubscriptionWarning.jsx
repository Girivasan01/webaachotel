import { useEffect, useState } from "react";
import { AlertTriangle, Lock, X } from "lucide-react";
import auth from "../../auth/axiosInstance";

const WARNING_SHOWN_KEY = "subscription_warning_shown_date";

export default function SubscriptionWarning() {
  const [status, setStatus] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await auth.get("/auth/subscription-status");
        const { isActive, warningLevel, expiry_date, daysLeft } = res.data;

        const today = new Date().toISOString().slice(0, 10);
        const _lastShown = localStorage.getItem(WARNING_SHOWN_KEY);

        // Expired or deactivated
        if (!isActive || warningLevel === "expired") {
          setStatus({ type: "locked", expiry_date, daysLeft });
          return;
        }

        if (!warningLevel) return;

        // critical (≤ 7 days)
        if (warningLevel === "critical") {
          setStatus({ type: "critical", expiry_date, daysLeft });
          setShowPopup(true);
          localStorage.setItem(WARNING_SHOWN_KEY, today);
          setShowBanner(true);
          return;
        }

        // warning (≤ 30 days) → banner only (no popup)
        if (warningLevel === "warning") {
          setStatus({ type: "warning", expiry_date, daysLeft });
          setShowBanner(true);
        }
      } catch (err) {
        console.error("Failed to check subscription:", err);
      }
    };

    checkSubscription();
  }, []);

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  if (!status) return null;

  if (status.type === "locked") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/95 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <Lock size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Subscription Expired
          </h2>
          <p className="text-gray-500 text-sm mb-1">
            Your subscription
            {status.expiry_date
              ? ` expired on ${status.expiry_date}`
              : " is no longer active"}
            .
          </p>
          <p className="text-gray-500 text-sm">
            Please contact{" "}
            <span className="font-semibold text-gray-700">
              Webaac Solutions
            </span>{" "}
            to renew your plan.
          </p>
        </div>
      </div>
    );
  }

  const isCritical = status.type === "critical";

  return (
    <>
      {/* Popup modal on every login/refresh */}
      {showPopup && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div
              className={`px-6 py-4 flex items-center justify-between ${isCritical ? "bg-red-600" : "bg-yellow-400"}`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={20}
                  className={isCritical ? "text-white" : "text-yellow-900"}
                />
                <h3
                  className={`font-bold text-base ${isCritical ? "text-white" : "text-yellow-900"}`}
                >
                  Subscription {isCritical ? "Expiring Soon!" : "Notice"}
                </h3>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className={`p-1 rounded-full hover:bg-black/10 transition-colors ${isCritical ? "text-white" : "text-yellow-900"}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 text-center">
              <div
                className={`text-5xl font-bold mb-1 ${isCritical ? "text-red-600" : "text-yellow-500"}`}
              >
                {status.daysLeft}
              </div>
              <p className="text-gray-500 text-sm mb-3">
                {status.daysLeft === 1 ? "day" : "days"} remaining
              </p>
              <p className="text-gray-600 text-sm">
                Your subscription expires on{" "}
                <span className="font-semibold text-gray-800">
                  {status.expiry_date}
                </span>
                .
              </p>
              {isCritical && (
                <p className="mt-2 text-red-500 text-xs font-medium">
                  Please renew immediately to avoid losing access.
                </p>
              )}
              <p className="mt-1 text-gray-400 text-xs">
                Contact <span className="font-semibold">Webaac Solutions</span>{" "}
                to renew.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowPopup(false)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isCritical
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                }`}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner below header */}
      {showBanner && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium ${
            isCritical
              ? "bg-red-600 text-white"
              : "bg-yellow-400 text-yellow-900"
          }`}
          style={{
            marginLeft: "16rem",
            width: "calc(100% - 16rem)",
            marginTop: "6rem",
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle size={18} className="shrink-0" />
            <span>
              {isCritical
                ? `⚠️ Your subscription expires on ${status.expiry_date}! Only ${status.daysLeft} day${status.daysLeft === 1 ? "" : "s"} left — please renew immediately.`
                : `ℹ️ Your subscription expires on ${status.expiry_date}. ${status.daysLeft} days left — please renew soon.`}
            </span>
          </div>
          <button
            onClick={handleCloseBanner}
            className={`p-1.5 rounded-full transition-colors shrink-0 ml-2 ${
              isCritical
                ? "hover:bg-red-700 text-white"
                : "hover:bg-yellow-500 text-yellow-900"
            }`}
            aria-label="Close warning"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
