import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MenuChartSection({ salesGraphData, expectedWaitTime }) {
  if (!salesGraphData || salesGraphData.length === 0) {
    return (
      <div className="menu-chart-section">
        <div className="menu-chart-placeholder">
          <span className="menu-chart-text">판매 데이터 없음</span>
        </div>
      </div>
    );
  }

  //현재 시간 기준 15분 단위 구간에서 8개 데이터 추출
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentQuarter = Math.floor(currentMinutes / 15) * 15; // 0, 15, 30, 45 중 하나
  
  const targetTime = new Date(now);
  targetTime.setMinutes(currentQuarter, 0, 0);
  
  //해당 시간에 가장 가까운 데이터 인덱스
  let closestIndex = salesGraphData.length - 1;
  let minDiff = Infinity;
  
  for (let i = salesGraphData.length - 1; i >= 0; i--) {
    const dataTime = new Date(
      salesGraphData[i].time.includes('Z') 
        ? salesGraphData[i].time 
        : salesGraphData[i].time + 'Z'
    );
    const diff = Math.abs(targetTime - dataTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  const recentData = [];
  for (let i = closestIndex; i >= 0 && recentData.length < 8; i -= 15) {
    recentData.unshift(salesGraphData[i]);
  }
  const filteredData = recentData;

  const chartData = {
    labels: filteredData.map(point => {
      //UTC 시간을 KST로 변환하여 HH:MM 형식으로 표시, 명시적 Z 추가
      const utcTime = point.time.includes('Z') ? point.time : point.time + 'Z';
      const date = new Date(utcTime);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }),
    datasets: [
      {
        label: '누적 판매',
        data: filteredData.map(point => point.cumulativeAtPoint),
        backgroundColor: '#6b5ace',
        borderColor: '#5a4ab8',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="menu-chart-section">
      <div className="chart-container">
        <h3 className="chart-title">오늘의 판매 추이</h3>
        <div className="chart-graph">
          <Bar data={chartData} options={options} />
        </div>
      </div>

      <div className="wait-time-section">
        <span className="wait-time-label">예상 대기 시간</span>
        {expectedWaitTime !== null && expectedWaitTime !== undefined ? (
          <span className="wait-time-value">{expectedWaitTime}분</span>
        ) : (
          <span className="wait-time-na">정보 없음</span>
        )}
      </div>
    </div>
  );
}

export default MenuChartSection;
