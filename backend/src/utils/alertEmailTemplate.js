/**
 * Format date to Vietnamese format: dd/MM/yyyy HH:mm:ss
 */
const formatDate = (date, includeYear = true) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    
    if (includeYear) return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return `${day}/${month} ${hours}:${minutes}:${seconds}`;
};

/**
 * Build personalized HTML email template for environment alert
 * @param {Array} alerts - Array of { sensorId, temperature, humidity, logDate, sensorType, tempStatus, humStatus, limits }
 * @param {string} userName - Name of the recipient user
 * @param {string} factoryName - Factory code (e.g. V4, All)
 * @returns {Object} { subject, html }
 */
const buildAlertEmail = (alerts, userName, factoryName) => {
    const now = formatDate(new Date());
    const totalAlerts = alerts.length;

    const tableRows = alerts.map((a, i) => {
        const logDate = a.logDate ? formatDate(a.logDate, false) : '—';
        
        // Status checks
        const tempIsNormal = a.tempStatus === 'normal';
        const humIsNormal = a.humStatus === 'normal';

        // Styling
        const tempBg = !tempIsNormal ? '#fef2f2' : '#f0fdf4';
        const tempColor = !tempIsNormal ? '#dc2626' : '#16a34a';
        const humBg = !humIsNormal ? '#fef2f2' : '#f0fdf4';
        const humColor = !humIsNormal ? '#dc2626' : '#16a34a';

        // Labels
        const tempLabel = a.tempStatus === 'high' ? 'Vượt ngưỡng' : a.tempStatus === 'low' ? 'Dưới ngưỡng' : 'Bình thường';
        const humLabel = a.humStatus === 'high' ? 'Vượt ngưỡng' : a.humStatus === 'low' ? 'Dưới ngưỡng' : 'Bình thường';

        // Values
        const tempVal = a.temperature != null ? a.temperature.toFixed(1) : '—';
        const humVal = a.humidity != null ? a.humidity.toFixed(1) : '—';
        const limits = a.limits || {};

        return `
        <tr style="border-bottom: 1px solid #e5e7eb; background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: center;">${i + 1}</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #111827;">${a.sensorId || '—'}</td>
            <td style="padding: 12px 16px; font-size: 13px; color: #4b5563; text-align: center;">${a.sensorType || '—'}</td>
            
            <td style="padding: 12px 16px; text-align: center;">
                <div style="font-size: 15px; font-weight: 700; color: ${tempColor};">${tempVal}°C</div>
                ${!tempIsNormal ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px; white-space: nowrap;">(Cho phép: ${limits.tempMin} - ${limits.tempMax})</div>` : ''}
            </td>
            <td style="padding: 12px 16px; text-align: center;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background: ${tempBg}; color: ${tempColor}; font-weight: 600; font-size: 12px; white-space: nowrap;">${tempLabel}</span>
            </td>
            
            <td style="padding: 12px 16px; text-align: center;">
                <div style="font-size: 15px; font-weight: 700; color: ${humColor};">${humVal}%</div>
                ${!humIsNormal ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px; white-space: nowrap;">(Cho phép: ${limits.humMin} - ${limits.humMax})</div>` : ''}
            </td>
            <td style="padding: 12px 16px; text-align: center;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background: ${humBg}; color: ${humColor}; font-weight: 600; font-size: 12px; white-space: nowrap;">${humLabel}</span>
            </td>
            
            <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; text-align: center;">${logDate}</td>
        </tr>`;
    }).join('');

    const displayFactory = factoryName === 'All' ? 'Tất cả các xưởng' : factoryName;
    const subject = `[Temperature & Humidity Monitoring] Cảnh báo ${displayFactory} — ${totalAlerts} vị trí bất thường (${now})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 960px; margin: 0 auto; padding: 24px;">
        
        <div style="background-color: #dc2626; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">CẢNH BÁO MÔI TRƯỜNG</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Hệ thống Giám sát nhiệt độ và độ ẩm phát hiện cảm biến vượt ngưỡng an toàn</p>
        </div>

        <div style="background: #ffffff; padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #6b7280;">Kính gửi:</span>
                        <strong style="color: #1f2937; margin-left: 8px; font-size: 15px;">${userName || 'Quản trị viên'}</strong>
                    </td>
                    <td style="padding: 6px 0; text-align: right;">
                        <span style="font-size: 13px; color: #6b7280;">Khu vực:</span>
                        <strong style="color: #1f2937; margin-left: 8px; font-size: 15px;">${displayFactory}</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #6b7280;">Thời điểm kiểm tra:</span>
                        <strong style="color: #1f2937; margin-left: 8px;">${now}</strong>
                    </td>
                    <td style="padding: 6px 0; text-align: right;">
                        <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: #fef2f2; color: #dc2626; font-weight: 700; font-size: 14px;">
                            ${totalAlerts} cảm biến cảnh báo
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <div style="background: #ffffff; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 800px;" cellpadding="0" cellspacing="0">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">STT</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: left; border-bottom: 2px solid #e5e7eb;">Sensor</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Loại</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Nhiệt độ</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Cảnh báo</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Độ ẩm</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Cảnh báo</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #4b5563; font-weight: 700; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e5e7eb;">Cập nhật cuối</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div style="background: #1f2937; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Email này được gửi tự động bởi hệ thống giám sát <strong style="color: #60a5fa;">EnviroMonitor</strong>
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #6b7280;">
                Bạn nhận được email này vì tài khoản được phân quyền giám sát khu vực tương ứng.<br>
                Ngưỡng an toàn được thiết lập riêng trên cấu hình của từng thiết bị cảm biến.
            </p>
        </div>

    </div>
</body>
</html>`;

    return { subject, html };
};

module.exports = { buildAlertEmail };