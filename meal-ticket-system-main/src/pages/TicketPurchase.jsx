import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/ticketPurchase.css';
import { API_BASE_URL } from '../api';  // ← 추가
import 학생회관식당사진 from '../assets/images/학생회관식당 사진.png';
import 자연계식당사진 from '../assets/images/자연계식당 사진.png';
import 교직원식당사진 from '../assets/images/교직원식당 사진.png';

function TicketPurchase() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미지 매핑 (백엔드 응답의 name과 매칭)
  const imageMap = {
    '학생회관': 학생회관식당사진,
    '자연계': 자연계식당사진,
    '교직원': 교직원식당사진
  };

  const descriptionMap = {
    1: '학생회관에 위치한 식당입니다. 중앙도서관과 가깝습니다.',
    2: '이종우 과학도서관 근처에 위치한 식당입니다.',
    3: '교직원 식당입니다. 한 가지 메뉴만을 제공합니다.'
  };

  useEffect(() => {
    // 소셜 로그인 사용자는 자동으로 STUDENT role 설정
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      // role이 없으면 소셜 로그인 사용자로 간주하여 STUDENT로 설정
      localStorage.setItem('userRole', 'STUDENT');
    }
    
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // API 응답: [{ id: 1, name: "학생회관" }, ...]
        const formattedStores = data.map(restaurant => ({
          id: restaurant.id,  // 숫자 ID 사용
          name: `${restaurant.name} 식당`,  // "학생회관 식당" 형태로 표시
          image: imageMap[restaurant.name] || 학생회관식당사진,
          restaurantId: restaurant.id,  // 키오스크 페이지에서 메뉴 조회할 때 사용
          description: descriptionMap[restaurant.id] || '맛있는 식사를 제공합니다.'  // 설명 추가
        }));

        setStores(formattedStores);
      } else if (response.status === 404) {
        setError('등록된 식당 정보가 없습니다.');
      } else {
        setError('식당 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('식당 목록 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreClick = (store) => {
    navigate('/kiosk', { state: { store } });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="ticket-purchase-container">
          <h1 className="ticket-purchase-title">매장을 선택하세요.</h1>
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            로딩 중...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="ticket-purchase-container">
          <h1 className="ticket-purchase-title">매장을 선택하세요.</h1>
          <div style={{ textAlign: 'center', padding: '50px', color: '#ff4444' }}>
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="ticket-purchase-container">
        <h1 className="ticket-purchase-title">매장을 선택하세요.</h1>
        <div className="ticket-purchase-list">
          {stores.map((store) => (
            <div key={store.id} className="ticket-purchase-item" onClick={() => handleStoreClick(store)}>
              <img src={store.image} alt={store.name} className="ticket-purchase-img" />
              <div className="ticket-purchase-text">
                <div className="ticket-purchase-label">{store.name}</div>
                <div className="ticket-purchase-description">{store.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default TicketPurchase;