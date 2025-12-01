import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/main.css';
import logo from '../assets/images/yummy_png.png';
import { API_BASE_URL } from '../api';

// 상단 네비게이션 바
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // 컴포넌트 마운트 및 경로 변경 시 사용자 정보 업데이트
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    setUserName(storedUserName || '');
    setUserRole(storedUserRole || '');
  }, [location.pathname]);

  const clearLocalStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUserName('');
    setUserRole('');
    navigate('/');
  };

  const handleLogout = async () => {

    const token = localStorage.getItem('accessToken');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: headers,
        credentials: 'include'
      });
    } catch (err) {
      // 에러 우시
    }
    
    clearLocalStorage();
  };

  // 현재 경로가 해당 링크와 일치하는지 확인하는 함수
  const isActive = (menuType) => {
    const currentPath = location.pathname;
    
    switch (menuType) {
      case 'ticket-purchase':
        return ['/ticket-purchase', '/kiosk', '/payment', '/payment-complete'].includes(currentPath);
      case 'my-ticket':
        return currentPath === '/my-ticket';
      case 'admin':
        return ['/admin', '/admin-menu-manage'].includes(currentPath);
      case 'qr-code':
        return currentPath === '/qr-code';
      default:
        return false;
    }
  };

  // 역할별 메뉴 렌더링 함수
  const renderMenuByRole = () => {
    if (userRole === 'STUDENT') {
      return (
        <>
          <li><Link to="/ticket-purchase" className={`navbar__menu-link ${isActive('ticket-purchase') ? 'active' : ''}`}>식권 구매</Link></li>
          <li><Link to="/my-ticket" className={`navbar__menu-link ${isActive('my-ticket') ? 'active' : ''}`}>My 식권</Link></li>
        </>
      );
    } else if (userRole === 'ADMIN') {
      return (
        <>
          <li><Link to="/admin" className={`navbar__menu-link ${isActive('admin') ? 'active' : ''}`}>관리자 페이지</Link></li>
          <li><Link to="/qr-code" className={`navbar__menu-link ${isActive('qr-code') ? 'active' : ''}`}>QR 처리</Link></li>
        </>
      );
    }
  };

  return (
    <nav className="navbar">
      <Link to="/ticket-purchase" className="navbar__site-name">
        <img src={logo} alt="Yummy Pass 로고" className="navbar__logo" />
      </Link>
      <ul className="navbar__menu">
        {renderMenuByRole()}
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {userName && (
          <span style={{ 
            fontSize: '14px', 
            color: '#666',
            fontWeight: '500'
          }}>
            {userName}
          </span>
        )}
        <button className="navbar__logout" onClick={handleLogout}>로그아웃</button>
      </div>
    </nav>
  );
}

export default Navbar;