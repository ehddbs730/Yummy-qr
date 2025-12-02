import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/main.css';
import NewLoginPage from './pages/NewLoginPage';
import TicketPurchase from './pages/TicketPurchase';
import PaymentPage from './pages/PaymentPage';
import PaymentCompletePage from './pages/PaymentCompletePage';
import MyTicketPage from './pages/MyTicketPage';
import AdminPage from './pages/AdminPage';
import AdminMenuManage from './pages/AdminMenuManage';
import QRCodePage from './pages/QRCodePage';
import SignUp from './pages/SignUp';
import SocialSignUpPhone from './pages/SocialSignUpPhone';
import KioskMenuPage from './pages/KioskMenuPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<NewLoginPage />} />
          <Route path="/ticket-purchase" element={<TicketPurchase />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-complete" element={<PaymentCompletePage />} />
          <Route path="/my-ticket" element={<MyTicketPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin-menu-manage" element={<AdminMenuManage />} />
          <Route path="/qr-code" element={<QRCodePage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/social-signup-phone" element={<SocialSignUpPhone />} />
          <Route path="/kiosk" element={<KioskMenuPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
