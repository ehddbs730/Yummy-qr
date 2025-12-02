import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/socialSignUpPhone.css';
import logo from '../assets/images/로고.png';
import { API_BASE_URL } from '../api';

function SocialSignUpPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 소셜 로그인에서 전달받은 사용자 정보
  const socialProvider = location.state?.provider || 'Social';
  const userName = location.state?.name || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 전화번호 형식 검증 (숫자 11자리)
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 11) {
      setError('전화번호는 숫자 11자리여야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 서버에 저장된 Authorization 쿠키로 인증됨
      const response = await fetch(`${API_BASE_URL}/api/auth/initial-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          role: 'STUDENT',
          phone: digitsOnly
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 서버가 새 JWT를 Set-Cookie로 내려줌
        if (typeof data.id !== 'undefined') {
          localStorage.setItem('userId', String(data.id));
        }
        if (data.role) {
          localStorage.setItem('userRole', data.role);
        }
        if (userName) {
          localStorage.setItem('userName', userName);
        }
        if (data.token) {
          localStorage.setItem('accessToken', data.token);
        }
        navigate('/ticket-purchase');
      } else {
        setError(data.error || data.message || '설정에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="social-phone-layout">
      <div className="social-phone-left">
        <img src={logo} alt="로고" className="social-phone-logo-image" />
      </div>

      <div className="social-phone-right">
        <div className="social-phone-form-container">
          <div className="social-phone-header">
            <h2 className="social-phone-title">추가 정보 입력</h2>
            <p className="social-phone-subtitle">
              {socialProvider} 로그인이 완료되었습니다.
              {userName && (
              <>
                  <br />
                  안녕하세요, {userName}님!
              </>
              )}
            </p>
            <p className="social-phone-description">
              서비스 이용을 위해 전화번호를 입력해주세요.
            </p>
          </div>

          <form className="social-phone-form" onSubmit={handleSubmit}>
            <label className="social-phone-label" htmlFor="social-phone-number">
              전화번호
            </label>
            <input 
              id="social-phone-number" 
              className="social-phone-input" 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-1234-5678"
            />

            <div className="social-phone-buttons">
              {error && (
                <div className="social-phone-error">
                  {error}
                </div>
              )}
              <button className="social-phone-btn primary" type="submit" disabled={isLoading}>
                회원가입 완료
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SocialSignUpPhone;