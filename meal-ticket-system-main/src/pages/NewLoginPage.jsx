import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/newLoginPage.css';
import googleLogo from '../assets/images/구글로고.png';
import naverLogo from '../assets/images/네이버로고.png';
import kakaoLogo from '../assets/images/카카오로고.png';
import { API_BASE_URL } from '../api';

function NewLoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // 입력값 검증
    if (!formData.id.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.id,
          userPW: formData.password
        })
      });

      const data = await response.json();

      // 로그인 성공
      if (response.ok && data.accessToken) {
        // Authorization 헤더에서 토큰 가져오기
        const authHeader = response.headers.get('Authorization');
        const token = authHeader || data.accessToken;
        
        // JWT 토큰 및 사용자 정보 저장
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userId', formData.id);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);

        // 역할에 따라 페이지로 이동
        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/ticket-purchase');
        }
      } else {
        // 로그인 실패
        // 서버에서 보내는 오류 메시지 출력
        setError(data.name);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRedirect = (provider) => {
    const socialEndpoints = {
      Google: '/oauth2/authorization/google',
      Naver: '/oauth2/authorization/naver',
      Kakao: '/oauth2/authorization/kakao'
    };

    const endpoint = socialEndpoints[provider];

    if (endpoint) {
      window.location.href = `${API_BASE_URL}${endpoint}`;
    }
  };

  const handleSignUp = () => {
    navigate('/sign-up');
  };

  return (
    <div className="new-login-container">
      <div className="new-login-left">
        <div className="content-section">
          <h1 className="main-title">학식 생활에<br />새로운 길을 열다</h1>
          <p className="subtitle">편리하고 빠른 온라인 식권 구매로 학식 이용을 더욱 간편하게</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-number">1</span>
              <div className="feature-content">
                <h3>스마트한 식권 관리</h3>
                <p>온라인으로 간편하게 식권을 구매하고 관리하세요. 언제든지 잔여 식권을 확인할 수 있습니다.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-number">2</span>
              <div className="feature-content">
                <h3>빠르고 편리한 구매</h3>
                <p>현장 대기 없이 온라인에서 바로 식권을 구매하고, QR코드로 간편하게 이용하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="new-login-right">
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="id">ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">PWD</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : 'LOGIN'}
            </button>
          </form>

          <div className="divider">
            <span>간편하게 시작하기</span>
          </div>

          <div className="social-login">
            <button
              className="social-btn google"
              type="button"
              onClick={() => handleSocialRedirect('Google')}
            >
              <img className="social-logo" alt="Google" src={googleLogo} />
              <span className="social-text">Google로 시작하기</span>
            </button>
            <button
              className="social-btn naver"
              type="button"
              onClick={() => handleSocialRedirect('Naver')}
            >
              <img className="social-logo" alt="Naver" src={naverLogo} />
              <span className="social-text">Naver로 시작하기</span>
            </button>
            <button
              className="social-btn kakao"
              type="button"
              onClick={() => handleSocialRedirect('Kakao')}
            >
              <img className="social-logo" alt="Kakao" src={kakaoLogo} />
              <span className="social-text">Kakao로 시작하기</span>
            </button>
          </div>

          <div className="signup-link">
            <span>아직 회원이 아니신가요?</span>
            <button className="signup-btn" onClick={handleSignUp}>회원가입</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewLoginPage;
