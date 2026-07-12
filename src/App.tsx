import { useState } from "react";

import LandingPage from "./components/LandingPage";
import ChatSandbox from "./components/ChatSandbox";
import PaymentPage from "./components/PaymentPage";
import AdminPanel from "./components/AdminPanel";
import UserConsole from "./components/UserConsole";

type Page =
  | "landing"
  | "payment"
  | "chat"
  | "console"
  | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  const renderPage = () => {
    switch (page) {
      case "landing":
        return (
          <LandingPage
            onStart={() => setPage("payment")}
          />
        );

      case "payment":
        return (
          <PaymentPage
            onPaymentSuccess={() => setPage("console")}
            onBack={() => setPage("landing")}
          />
        );

      case "chat":
        return (
          <ChatSandbox
            onBack={() => setPage("console")}
          />
        );

      case "console":
        return (
          <UserConsole
            onOpenChat={() => setPage("chat")}
            onOpenAdmin={() => setPage("admin")}
            onLogout={() => setPage("landing")}
          />
        );

      case "admin":
        return (
          <AdminPanel
            onBack={() => setPage("console")}
          />
        );

      default:
        return (
          <LandingPage
            onStart={() => setPage("payment")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}
