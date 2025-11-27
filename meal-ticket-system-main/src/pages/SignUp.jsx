import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signUp.css';
import logo from '../assets/images/로고.png';
import googleLogo from '../assets/images/구글로고.png';
import naverLogo from '../assets/images/네이버로고.png';
import kakaoLogo from '../assets/images/카카오로고.png';
import { API_BASE_URL } from '../api';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    password: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      'signup2-name': 'name',
      'signup2-id': 'id',
      'signup2-pwd': 'password',
      'signup2-phone': 'phone'
    };
    
    setFormData(prev => ({
      ...prev,
      [fieldMap[id]]: value
    }));
    setError(''); // 입력 시 에러 메시지 초기화
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 입력값 검증
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.id.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.id,
          userPW: formData.password,
          name: formData.name,
          role: 'STUDENT',
          phone: formData.phone
        })
      });

      
        // 회원가입 성공
      if (response.ok) {
        alert('회원가입이 완료되었습니다.');
        navigate('/');
      } else {
        // 회원가입 실패
        // 서버에서 보내는 오류 메시지 출력
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const socialEndpoints = {
      Google: '/oauth2/authorization/google',
      Naver: '/oauth2/authorization/naver',
      Kakao: '/oauth2/authorization/kakao'
    };

    const endpoint = socialEndpoints[provider];

    if (endpoint) {
      window.location.href = `${API_BASE_URL}${endpoint}`;
      return;
    }
  };

  return (
    <div className="signup2-layout">
      <div className="signup2-left">
        <img src={logo} alt="로고" className="signup2-logo-image" />
      </div>

      <div className="signup2-right">
        <div className="signup2-form-container">
          <form className="signup2-form" onSubmit={handleSubmit}>
            <label className="signup2-label" htmlFor="signup2-name">NAME</label>
            <input 
              id="signup2-name" 
              className="signup2-input" 
              type="text" 
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
            />

            <label className="signup2-label" htmlFor="signup2-id">ID</label>
            <input 
              id="signup2-id" 
              className="signup2-input" 
              type="text" 
              value={formData.id}
              onChange={handleInputChange}
              disabled={isLoading}
            />

            <label className="signup2-label" htmlFor="signup2-pwd">PWD</label>
            <input 
              id="signup2-pwd" 
              className="signup2-input" 
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />

            <label className="signup2-label" htmlFor="signup2-phone">PHONE NUMBER</label>
            <input 
              id="signup2-phone" 
              className="signup2-input" 
              type="tel" 
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />

            {error && (
              <div className="signup2-error">
                {error}
              </div>
            )}

            <button 
              className="signup2-btn" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : 'SIGN UP'}
            </button>
          </form>

          <div className="divider">
            <span>또 다른 방법</span>
          </div>

          <div className="social-login">
            <button
              className="social-btn google"
              type="button"
              onClick={() => handleSocialLogin('Google')}
            >
              <img className="social-logo" alt="Google" src={googleLogo} />
              <span className="social-text">Google로 시작하기</span>
            </button>
            <button
              className="social-btn naver"
              type="button"
              onClick={() => handleSocialLogin('Naver')}
            >
              <img className="social-logo" alt="Naver" src={naverLogo} />
              <span className="social-text">Naver로 시작하기</span>
            </button>
            <button
              className="social-btn kakao"
              type="button"
              onClick={() => handleSocialLogin('Kakao')}
            >
              <img className="social-logo" alt="Kakao" src={kakaoLogo} />
              <span className="social-text">Kakao로 시작하기</span>
            </button>
          </div>

          <div className="signup2-login-link">
            <span>이미 회원이신가요?</span>
            <button className="signup2-login-btn" onClick={() => navigate('/')}>로그인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
