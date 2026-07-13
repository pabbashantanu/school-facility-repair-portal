import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminService.getAnalytics();
        setAnalytics(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics summaries');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading-state">Generating reports & charts...</div>;
  if (error) return <div className="error-alert">⚠️ {error}</div>;

  // --- CHART 1: Complaints per Month (Line Chart) ---
  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const lineLabels = analytics.monthlyCounts.map(item => `${monthNames[item._id.month]} ${item._id.year}`);
  const lineDataPoints = analytics.monthlyCounts.map(item => item.count);

  const lineChartData = {
    labels: lineLabels.length > 0 ? lineLabels : ['No Data'],
    datasets: [
      {
        label: 'Damage Reports',
        data: lineDataPoints.length > 0 ? lineDataPoints : [0],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // --- CHART 2: Pending vs Completed (Doughnut Chart) ---
  let pendingCount = 0;
  let completedCount = 0;
  analytics.statusCounts.forEach(item => {
    if (item._id === 'Resolved') {
      completedCount += item.count;
    } else if (item._id !== 'Rejected') {
      pendingCount += item.count;
    }
  });

  const doughnutChartData = {
    labels: ['Pending / Active Repairs', 'Completed Repairs'],
    datasets: [
      {
        data: [pendingCount, completedCount],
        backgroundColor: ['#f59e0b', '#10b981'],
        borderColor: ['#121420', '#121420'],
        borderWidth: 2
      }
    ]
  };

  // --- CHART 3: Facility-wise Reports (Bar Chart) ---
  const barLabels = analytics.facilityCounts.map(item => item.name);
  const barDataPoints = analytics.facilityCounts.map(item => item.count);

  const barChartData = {
    labels: barLabels.length > 0 ? barLabels : ['No Facilities'],
    datasets: [
      {
        label: 'Complaints',
        data: barDataPoints.length > 0 ? barDataPoints : [0],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 6
      }
    ]
  };

  // Common options for dark theme charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f3f4f6',
          font: { family: 'Inter' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f3f4f6',
          padding: 20,
          font: { family: 'Inter' }
        }
      }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '35px' }}>
        <h2>System Reports & Analytics</h2>
        <p>Real-time visual monitoring of infrastructure repairs and facility issue concentrations.</p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>👥</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>Active Users</span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{analytics.totalUsers}</h3>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '24px' }}>
          <div>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🏫</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>Total Facilities</span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{analytics.totalFacilities}</h3>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '24px' }}>
          <div>
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🚨</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>Total Logged Incidents</span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{analytics.totalComplaints}</h3>
          </div>
        </div>
      </div>

      {/* Visual Chart Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '35px' }}>
        {/* Line Chart */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>Complaints per Month</h3>
          <div style={{ height: 'calc(100% - 35px)' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>Repair Status Split</h3>
          <div style={{ height: 'calc(100% - 35px)' }}>
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', height: '350px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>Facility-wise Complaints Distribution</h3>
        <div style={{ height: 'calc(100% - 35px)' }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
