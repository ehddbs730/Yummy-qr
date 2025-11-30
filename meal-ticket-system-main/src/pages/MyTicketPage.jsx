import React, { useMemo, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';
import '../styles/myTicketPage.css';

function MyTicketPage() {
  const [activeTab, setActiveTab] = useState(0); // 0: 미사용, 1: 사용, 2: 만료
  const [unusedTickets, setUnusedTickets] = useState([]);
  const [usedTickets, setUsedTickets] = useState([]);
  const [expiredTickets, setExpiredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrImages, setQrImages] = useState({}); // qrCode -> imageUrl 매핑
  const [receivingTicket, setReceivingTicket] = useState(null); // 수령 처리 중인 티켓 ID

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
  const fetchUnusedTickets = async (token) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/unused`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드가 쿠키 기반으로 필터링해서 보내주므로 그대로 사용
        const { valid, expired } = splitTicketsByExpiry(data || []);
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
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  // 사용한 티켓 조회
  const fetchUsedTickets = async (token) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/used`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsedTickets(data || []);
      } else if (response.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setUsedTickets([]);
      }
    } catch (err) {
      setUsedTickets([]);
    }
  };

  // 만료된 티켓 조회
  const fetchExpiredTickets = async (token) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/expired`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // 백엔드가 쿠키 기반으로 필터링해서 보내주므로 그대로 사용
        setExpiredTickets((prev) => dedupeTickets([...prev, ...(data || [])]));
      } else if (response.status === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setExpiredTickets([]);
      }
    } catch (err) {
      setExpiredTickets([]);
    }
  };

  // QR 정보 조회 (uuid로)
  const fetchQrInfo = async (uuid, token) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/qr/info?uuid=${uuid}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  };

  // 모든 티켓의 QR 이미지 로드
  const loadQrImages = async (tickets) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return;
    }

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return;
    }

    const qrMap = {};

    for (const ticket of tickets) {
      if (!ticket.qrCode) {
        continue;
      }

      // 이미 로드된 QR은 스킵
      if (qrImages[ticket.qrCode]) {
        qrMap[ticket.qrCode] = qrImages[ticket.qrCode];
        continue;
      }

      try {
        const imageUrl = await fetchQrInfo(ticket.qrCode, token);
        
        if (imageUrl) {
          qrMap[ticket.qrCode] = imageUrl;
        }
      } catch (error) {
        // 오류 무시
      }
    }

    setQrImages(prev => ({ ...prev, ...qrMap }));
  };

  // 수령 확인 처리
  const handleReceive = async (ticketId) => {
    const token = localStorage.getItem('accessToken');

    if (!window.confirm('수령 확인하시겠습니까?')) {
      return;
    }

    setReceivingTicket(ticketId);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/receive`, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include'
      });

      if (response.ok) {
        alert('수령이 완료되었습니다.');
        // 티켓 목록 새로고침
        await Promise.all([
          fetchUnusedTickets(token),
          fetchUsedTickets(token),
          fetchExpiredTickets(token)
        ]);
      } else if (response.status === 400) {
        const errorMessage = await response.text();
        alert(errorMessage || '수령 처리에 실패했습니다.');
      } else {
        alert('수령 처리에 실패했습니다.');
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setReceivingTicket(null);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');

      // 쿠키 기반 인증으로 작동하므로 token 체크 제거
      // 백엔드가 쿠키로 사용자 확인
      await Promise.all([
        fetchUnusedTickets(token),
        fetchUsedTickets(token),
        fetchExpiredTickets(token)
      ]);
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // 탭 변경 시 QR 이미지 로드
  useEffect(() => {
    let ticketsToLoad = [];
    if (activeTab === 0) {
      ticketsToLoad = unusedTickets;
    } else if (activeTab === 1) {
      ticketsToLoad = usedTickets;
    } else {
      ticketsToLoad = expiredTickets;
    }
    
    if (ticketsToLoad.length > 0) {
      loadQrImages(ticketsToLoad);
    }
  }, [activeTab, unusedTickets, usedTickets, expiredTickets]);

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
    } else if (activeTab === 1) {
      return usedTickets;
    }
    return expiredTickets;
  }, [activeTab, unusedTickets, usedTickets, expiredTickets]);

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
          <div className={`ticket-tab-slider active-${activeTab}`}>
            <button
              className={`ticket-tab-btn ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              미사용
            </button>
            <button
              className={`ticket-tab-btn ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              사용
            </button>
            <button
              className={`ticket-tab-btn ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              만료
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
              let statusText = '미사용';
              if (activeTab === 1) {
                statusText = '사용됨';
              } else if (activeTab === 2) {
                statusText = '만료';
              }
              const qrImageUrl = ticket.qrCode ? qrImages[ticket.qrCode] : null;
              // S3 직접 URL 생성
              const s3DirectUrl = ticket.qrCode 
                ? `https://yummypass-bucket.s3.ap-northeast-2.amazonaws.com/qr-images/${ticket.qrCode}.png`
                : null;
              
              return (
                <div key={ticket.id} className="ticket-item">
                  <div 
                    className="ticket-card-qr" 
                    onClick={() => {
                      const urlToOpen = qrImageUrl || s3DirectUrl;
                      if (urlToOpen) {
                        window.open(urlToOpen, '_blank');
                      }
                    }}
                    style={{ cursor: (qrImageUrl || s3DirectUrl) ? 'pointer' : 'default', position: 'relative', zIndex: 10 }}
                    title="클릭하여 QR 코드 이미지 보기"
                  >
                    {qrImageUrl ? (
                      <img 
                        src={qrImageUrl} 
                        alt="QR Code"
                        crossOrigin="anonymous"
                        style={{ 
                          width: '261px', 
                          height: '261px',
                          borderRadius: '16px',
                          objectFit: 'contain',
                          pointerEvents: 'none'
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
                  
                  {/* 수령 확인 버튼 - 사용 탭에서만 표시 */}
                  {activeTab === 1 && !ticket.receivedTime && (
                    <button
                      className="ticket-receive-btn"
                      onClick={() => handleReceive(ticket.id)}
                      disabled={receivingTicket === ticket.id}
                    >
                      {receivingTicket === ticket.id ? '처리 중...' : '수령 확인'}
                    </button>
                  )}
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