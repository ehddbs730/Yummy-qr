import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api';
import '../styles/qrCodePage.css';

function QRCodePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 입력 관련 상태
  const [uuid, setUuid] = useState('');
  
  // 스캔 관련 상태
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  // UI 관련 상태
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem('accessToken');

  // 카메라 시작
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      // 비디오 엘리먼트가 마운트된 이후에 srcObject를 할당하기 위해 스트림을 상태로 보관
      setCameraStream(stream);
      setCameraActive(true);
      setIsScanning(true);
    } catch (err) {
      setError('카메라 접근을 허용해주세요.');
    }
  };

  // 카메라 종료
  const stopCamera = () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      } else if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      // 오류 무시
    }
    if (videoRef.current) {
      try { videoRef.current.srcObject = null; } catch(e) {}
    }
    setCameraStream(null);
    setCameraActive(false);
    setIsScanning(false);
    setScannedData(null);
  };

  // cameraStream 또는 cameraActive 변경 시 비디오에 srcObject 할당 및 재생 시도
  useEffect(() => {
    const attachStream = async () => {
      if (cameraActive && cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        try {
          if (videoRef.current.play) {
            await videoRef.current.play();
          }
        } catch (playErr) {
          // 오류 무시
        }
      }
    };

    attachStream();
    return () => {};
  }, [cameraActive, cameraStream]);

  // API를 통해 QR 사용 처리
  const handleUseQR = async (qrUuid) => {
    const uuidToUse = qrUuid || uuid.trim();
    
    if (!uuidToUse) {
      setMessage('UUID를 입력해주세요.');
      setMessageType('error');
      return;
    }

    // UUID를 명시적으로 문자열로 변환
    const uuidString = String(uuidToUse).trim();

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/qr/use?uuid=${encodeURIComponent(uuidString)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken || ''
        }
      });

      const responseText = await response.text();

      if (response.ok) {
        setMessage(responseText || 'QR 사용이 완료되었습니다.');
        setMessageType('success');
        setUuid(''); // 성공 시 입력 필드 초기화
        setScannedData(null);
        stopCamera(); // 성공 시 카메라 종료
      } else if (response.status === 404) {
        setMessage(responseText || '존재하지 않는 QR입니다.');
        setMessageType('error');
        stopCamera(); // 에러 시에도 카메라 종료
      } else if (response.status === 401) {
        setMessage('로그인이 필요합니다.');
        setMessageType('error');
        stopCamera(); // 에러 시에도 카메라 종료
      } else {
        setMessage(responseText || 'QR 사용 처리에 실패했습니다.');
        setMessageType('error');
        stopCamera(); // 에러 시에도 카메라 종료
      }
    } catch (err) {
      setMessage('네트워크 오류가 발생했습니다.');
      setMessageType('error');
      stopCamera(); // 에러 시에도 카메라 종료
    } finally {
      setIsLoading(false);
    }
  };

  // QR 코드 스캔
  useEffect(() => {
    const scanQRCode = () => {
      if (videoRef.current && canvasRef.current && isScanning && !isLoading) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code && !isLoading) {
            setScannedData(code.data);
            setIsScanning(false); // 즉시 스캔 중지하여 중복 인식 방지
            setUuid(code.data);
            // QR 코드 스캔 즉시 API 호출
            handleUseQR(code.data);
            return; // 추가 스캔 방지
          }
        }
      }

      if (isScanning && !isLoading) {
        requestAnimationFrame(scanQRCode);
      }
    };

    if (isScanning && !isLoading) {
      scanQRCode();
    }
  }, [isScanning, isLoading]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleUseQR();
    }
  };

  // 다시 스캔
  const handleRescan = () => {
    setScannedData(null);
    setUuid('');
    setMessage('');
    setMessageType('');
    setIsScanning(true);
  };

  return (
    <>
      <Navbar />
      <div className="qr-code-container">
        <div className="qr-code-card">
          <h1 className="qr-code-title">QR코드 승인 페이지</h1>
          <p className="qr-code-instruction">
            QR 코드를 카메라로 스캔하거나 UUID를 직접 입력해주세요.
          </p>

          {/* 에러 메시지 */}
          {error && <div className="error-message">{error}</div>}

          {/* 카메라 영역 */}
          <div className="qr-section">
            <h2 className="section-title">카메라 스캔</h2>
            {!cameraActive ? (
              <div className="qr-code-camera-area">
                <button className="camera-start-btn" onClick={startCamera}>
                  카메라 시작
                </button>
              </div>
            ) : (
              <div className="qr-code-camera-area">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button className="camera-stop-btn" onClick={stopCamera}>
                  카메라 종료
                </button>
              </div>
            )}

            {scannedData && (
              <div className="qr-result">
                <h3>QR 코드 인식 완료!</h3>
                <p className="result-data">{scannedData}</p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="divider">또는</div>

          {/* 수동 입력 영역 */}
          <div className="qr-section">
            <h2 className="section-title">UUID 직접 입력</h2>
            <div className="qr-code-input-area">
              <input
                type="text"
                className="qr-code-input"
                placeholder="QR UUID를 입력하세요"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="qr-code-submit-btn"
                onClick={handleUseQR}
                disabled={isLoading || !uuid.trim()}
              >
                {isLoading ? '처리 중...' : 'QR 사용 처리'}
              </button>
            </div>
          </div>

          {/* 결과 메시지 */}
          {message && (
            <div className={`qr-code-message ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {/* 다시 스캔 버튼 */}
          {scannedData && (
            <button className="rescan-btn" onClick={handleRescan}>
              다시 스캔
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default QRCodePage;
