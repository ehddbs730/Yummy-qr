import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';
import '../styles/ticketPurchase.css';
import 학생회관식당사진 from '../assets/images/학생회관식당 사진.png';
import 자연계식당사진 from '../assets/images/자연계식당 사진.png';
import 교직원식당사진 from '../assets/images/교직원식당 사진.png';

function AdminPage() {
  const navigate = useNavigate();
  
  // 상태 관리
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  // 식당 목록 조회 API 호출
  const fetchRestaurants = async () => {
    setLoading(true);
    
    const response = await fetch(`${API_BASE_URL}/api/restaurants`);
    const restaurantData = await response.json();
    
    // API 응답 데이터 변환
    const formattedRestaurants = restaurantData.map((restaurant) => {
      let restaurantImage;
      
      if (restaurant.name === '중앙도서관') {
        restaurantImage = 학생회관식당사진;
      } else if (restaurant.name === '이과대학') {
        restaurantImage = 자연계식당사진;
      } else if (restaurant.name === '교직원') {
        restaurantImage = 교직원식당사진;
      }
      
      return {
        id: restaurant.id,
        name: `${restaurant.name} 관리`,
        image: restaurantImage,
        originalName: restaurant.name
      };
    });
    
    setRestaurants(formattedRestaurants);
    setLoading(false);
  };

  // 컴포넌트 마운트 시 식당 목록 조회
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleStoreClick = (restaurant) => {
    navigate('/admin-menu-manage', { 
      state: { 
        store: { 
          id: restaurant.id,
          name: restaurant.originalName || restaurant.name.replace(' 관리', '')
        } 
      } 
    });
  };

  return (
    <>
      <Navbar />
      <div className="ticket-purchase-container">
        <h1 className="ticket-purchase-title">매장을 선택하세요.</h1>
        
        {/* 로딩 상태 */}
        {loading && <div className="loading-message">식당 목록을 불러오는 중...</div>}
        
        <div className="ticket-purchase-list">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="ticket-purchase-item" onClick={() => handleStoreClick(restaurant)}>
              <img src={restaurant.image} alt={restaurant.name} className="ticket-purchase-img" />
              <div className="ticket-purchase-label">{restaurant.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AdminPage; 