import { useAuth } from "../../hooks/useAuth";

export default function Container({ children }) {
  const { hasBanner } = useAuth();
  return (
    <div className={`md:ml-64 p-4 md:p-8 min-h-screen bg-[#F5F6FA] ${hasBanner ? "pt-36 md:pt-44" : "pt-24 md:pt-32"}`}>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-gray-100">
        {children}
      </div>
    </div>
  );
}