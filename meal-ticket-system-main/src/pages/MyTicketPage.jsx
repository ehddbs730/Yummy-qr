import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';
import '../styles/myTicketPage.css';

function MyTicketPage() {
  const [activeTab, setActiveTab] = useState(0); // 0: 미사용, 1: 만료/사용됨
  const [unusedTickets, setUnusedTickets] = useState([]);
  const [expiredTickets, setExpiredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrImages, setQrImages] = useState({}); // qrCode -> imageUrl 매핑

  const EXPIRY_DURATION_MS = 24 * 60 * 60 * 1000; // 24시간

  const isTicketExpired = (purchaseTime) => {
    if (!purchaseTime) return false;
    const purchaseDate = new Date(purchaseTime);
    return Date.now() >= purchaseDate.getTime() + EXPIRY_DURATION_MS;
  };

  const splitTicketsByExpiry = (tickets = []) => {
    const valid = [];
    const expired = [];
    tickets.forEach((ticket) => {
      if (ticket.isUsed) {
        expired.push(ticket);
        return;
      }
      if (isTicketExpired(ticket.purchaseTime)) {
        expired.push({ ...ticket, isExpired: true });
      } else {
        valid.push(ticket);
      }
    });
    return { valid, expired };
  };

  const dedupeTickets = (tickets = []) => {
    const map = new Map();
    tickets.forEach((ticket) => {
      if (!ticket) return;
      const key = ticket.id ?? ticket.qrCode ?? `${ticket.menuName}-${ticket.purchaseTime}`;
      if (!map.has(key)) {
        map.set(key, ticket);
      }
    });
    return Array.from(map.values());
  };

  // 사용자별 티켓 필터
  const filterTicketsByUser = (tickets = [], userInfo = {}) => {
    if (!Array.isArray(tickets)) return [];
    const { userId, userName } = userInfo;

    if (!userId && !userName) {
      return [];
    }

    return tickets.filter(ticket => {
      if (userId && ticket.userId) {
        return ticket.userId === userId;
      }
      if (userName && ticket.userName) {
        return ticket.userName === userName;
      }
      return false;
    });
  };

  // 미사용 티켓 조회
  const fetchUnusedTickets = async (token, userInfo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/unused`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredTickets = filterTicketsByUser(data || [], userInfo);
        const { valid, expired } = splitTicketsByExpiry(filteredTickets);
        setUnusedTickets(valid);
        if (expired.length > 0) {
          setExpiredTickets((prev) => dedupeTickets([...prev, ...expired]));
        }
      } else if (response.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setError('미사용 티켓을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('미사용 티켓 조회 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  // 만료된 티켓 조회
  const fetchExpiredTickets = async (token, userInfo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/expired`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredTickets = filterTicketsByUser(data || [], userInfo);
        setExpiredTickets((prev) => dedupeTickets([...prev, ...filteredTickets]));
      } else if (response.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setExpiredTickets([]);
      }
    } catch (err) {
      console.error('만료된 티켓 조회 오류:', err);
      setExpiredTickets([]);
    }
  };

  // QR 정보 조회 (uuid로)
  const fetchQrInfo = async (uuid, token) => {
    try {
      console.log(`[QR 조회 시작] UUID: ${uuid}, Token: ${token ? '있음' : '없음'}`);
      
      const response = await fetch(`${API_BASE_URL}/api/qr/info?uuid=${uuid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        }
      });

      console.log(`[QR API 응답] Status: ${response.status}, UUID: ${uuid}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`[QR 파싱 성공] UUID: ${uuid}, ImageUrl: ${data.imageUrl}`);
        return data.imageUrl;
      } else {
        const errorText = await response.text();
        console.error(`[QR API 실패] Status: ${response.status}, UUID: ${uuid}, Message: ${errorText}`);
        return null;
      }
    } catch (err) {
      console.error(`[QR 조회 에러] UUID: ${uuid}, Error:`, err);
      return null;
    }
  };

  // 모든 티켓의 QR 이미지 로드
  const loadQrImages = async (tickets) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('[QR 이미지 로드] 토큰이 없습니다.');
      return;
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      console.warn('[QR 이미지 로드] 티켓 배열이 비어있습니다.');
      return;
    }

    const qrMap = {};
    console.log(`[QR 이미지 로드 시작] 총 ${tickets.length}개 티켓`);

    for (const ticket of tickets) {
      if (!ticket.qrCode) {
        console.warn('[QR 이미지 로드] QR 코드 없음:', ticket);
        continue;
      }

      // 이미 로드된 QR은 스킵
      if (qrImages[ticket.qrCode]) {
        console.log(`[QR 이미지 로드] 이미 로드됨 (스킵): ${ticket.qrCode}`);
        qrMap[ticket.qrCode] = qrImages[ticket.qrCode];
        continue;
      }

      try {
        console.log(`[QR 이미지 로드] 로드 중: ${ticket.qrCode}`);
        const imageUrl = await fetchQrInfo(ticket.qrCode, token);
        
        if (imageUrl) {
          qrMap[ticket.qrCode] = imageUrl;
          console.log(`[QR 이미지 로드] 성공: ${ticket.qrCode}`);
        } else {
          console.warn(`[QR 이미지 로드] 실패 (null): ${ticket.qrCode}`);
        }
      } catch (error) {
        console.error(`[QR 이미지 로드] 예외 발생 (${ticket.qrCode}):`, error);
      }
    }

    console.log('[QR 이미지 로드 완료] 매핑:', qrMap);
    setQrImages(prev => ({ ...prev, ...qrMap }));
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      const userInfo = {
        userId: localStorage.getItem('userId'),
        userName: localStorage.getItem('userName')
      };

      console.log('[초기 로드] Token:', token ? '있음' : '없음');
      console.log('[초기 로드] UserInfo:', userInfo);

      if (!token) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      if (!userInfo.userId && !userInfo.userName) {
        setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        setIsLoading(false);
        return;
      }

      await Promise.all([
        fetchUnusedTickets(token, userInfo),
        fetchExpiredTickets(token, userInfo)
      ]);
      
      console.log('[초기 로드 완료]');
      setIsLoading(false);
    };

    loadData();
  }, []);

  // 탭 변경 시 QR 이미지 로드
  useEffect(() => {
    const ticketsToLoad = activeTab === 0 ? unusedTickets : expiredTickets;
    console.log(`[탭 변경] activeTab: ${activeTab}, 로드할 티켓: ${ticketsToLoad.length}개`);
    
    if (ticketsToLoad.length > 0) {
      loadQrImages(ticketsToLoad);
    }
  }, [activeTab, unusedTickets, expiredTickets]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 만료 시간 계산 (구매일시 + 24시간)
  const getExpiryTime = (purchaseTime) => {
    if (!purchaseTime) return '-';
    const purchase = new Date(purchaseTime);
    const expiry = new Date(purchase.getTime() + 24 * 60 * 60 * 1000);
    return formatDate(expiry);
  };

  // 분류된 티켓
  const filtered = useMemo(() => {
    if (activeTab === 0) {
      return unusedTickets;
    }
    return expiredTickets;
  }, [activeTab, unusedTickets, expiredTickets]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="my-ticket-container">
          <h1 className="my-ticket-title">MY식권</h1>
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            로딩 중...
          </div>
        </div>
      </>
    );
  }

  const accessToken = localStorage.getItem('accessToken');
  
  if (error && !accessToken) {
    return (
      <>
        <Navbar />
        <div className="my-ticket-container">
          <h1 className="my-ticket-title">MY식권</h1>
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
      <div className="my-ticket-container">
        <h1 className="my-ticket-title">MY식권</h1>
        
        {/* 캡슐 탭 버튼 */}
        <div className="ticket-tab-container">
          <div className={`ticket-tab-slider ${activeTab === 1 ? 'active-1' : ''}`}>
            <button
              className={`ticket-tab-btn ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              미사용 식권
            </button>
            <button
              className={`ticket-tab-btn ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              만료된 식권
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444' }}>
            {error}
          </div>
        )}

        {/* 티켓 리스트 */}
        <div className="ticket-list">
          {!Array.isArray(filtered) || filtered.length === 0 ? (
            <div className="no-ticket-message">식권이 없습니다.</div>
          ) : (
            filtered.map((ticket) => {
              const isUsed = ticket.isUsed === true;
              const isExpiredTab = activeTab === 1;
              const statusText = isUsed ? '사용됨' : (isExpiredTab ? '만료' : '미사용');
              const qrImageUrl = ticket.qrCode ? qrImages[ticket.qrCode] : null;
              
              return (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-card-qr">
                    {qrImageUrl ? (
                      <img 
                        src={qrImageUrl} 
                        alt="QR Code"
                        crossOrigin="anonymous"
                        style={{ 
                          width: '261px', 
                          height: '261px',
                          borderRadius: '16px',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <div className="ticket-qr-placeholder">QR</div>
                    )}
                  </div>
                  <div className="ticket-item-table">
                    <div className="ticket-row ticket-row-head">
                      <span className="ticket-label">사용 여부</span>
                      <span className="ticket-value">{statusText}</span>
                    </div>
                    <div className="ticket-row">
                      <span className="ticket-label">상품명</span>
                      <div className="ticket-value">
                        <div className="ticket-line">
                          {ticket.menuName || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="ticket-row ticket-row-thick">
                      <span className="ticket-label">구매 일시</span>
                      <span className="ticket-value">{formatDate(ticket.purchaseTime)}</span>
                    </div>
                    <div className="ticket-row">
                      <span className="ticket-label">유효 기간</span>
                      <span className="ticket-value">{getExpiryTime(ticket.purchaseTime)}까지</span>
                    </div>
                    {ticket.receivedTime && (
                      <div className="ticket-row">
                        <span className="ticket-label">수령 일시</span>
                        <span className="ticket-value">{formatDate(ticket.receivedTime)}</span>
                      </div>
                    )}
                    {ticket.userName && (
                      <div className="ticket-row">
                        <span className="ticket-label">구매자</span>
                        <span className="ticket-value">{ticket.userName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default MyTicketPage;