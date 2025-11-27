import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/paymentCompletePage.css';

function PaymentCompletePage() {
  const navigate = useNavigate();
  
  const handleMain = () => {
    navigate('/ticket-purchase');
  };

  const handleMyTicket = () => {
    navigate('/my-ticket');
  };

  return (
    <>
      <Navbar />
      <div className="payment-complete-container">
        <div className="payment-complete-content">
          <h1 className="payment-complete-title">결제가 완료되었습니다.</h1>
          
          <div className="payment-complete-notice">
            학식을 수령할 때는 식판을 들고<br />
            해당하는 코너에 방문해 QR을 보여주세요.
          </div>
          
          <div className="payment-complete-buttons">
            <button className="payment-complete-main-btn" onClick={handleMain}>
              메인으로
            </button>
            <button className="payment-complete-ticket-btn" onClick={handleMyTicket}>
              My 식권
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentCompletePage; 