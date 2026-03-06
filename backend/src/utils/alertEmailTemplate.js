/**
 * Format date to Vietnamese format: dd/MM/yyyy HH:mm:ss
 */
const formatDate = (date, includeYear = true) => {
    const d = new Date(date);
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
 * @param {Array} alerts - Array of { logidx, tc_name, value_0, value_1, log_date, sensorType, tempStatus, humStatus }
 * @param {Object} thresholds - { fridgeTempMin, fridgeTempMax, fridgeHumMin, fridgeHumMax, roomTempMin, roomTempMax, roomHumMin, roomHumMax }
 * @param {string} userName - Name of the recipient user
 * @param {string} factoryName - Factory code (e.g. V4, V5)
 * @returns {Object} { subject, html }
 */
const buildAlertEmail = (alerts, thresholds, userName, factoryName) => {
    const now = formatDate(new Date());
    const totalAlerts = alerts.length;

    const tableRows = alerts.map((a, i) => {
        const logDate = a.log_date ? formatDate(a.log_date, false) : '—';
        const tempBg = a.tempStatus !== 'normal' ? '#fef2f2' : '#f0fdf4';
        const tempColor = a.tempStatus !== 'normal' ? '#dc2626' : '#16a34a';
        const humBg = a.humStatus !== 'normal' ? '#fef2f2' : '#f0fdf4';
        const humColor = a.humStatus !== 'normal' ? '#dc2626' : '#16a34a';

        const typeLabel = a.sensorType === 'FRIDGE' ? '🧊 Tủ lạnh' : '🏠 Phòng';

        const tempLabel = a.tempStatus === 'high' ? '🔴 Vượt UCL'
            : a.tempStatus === 'low' ? '🔵 Dưới LCL'
                : '✅ Bình thường';

        const humLabel = a.humStatus === 'high' ? '🔴 Vượt UCL'
            : a.humStatus === 'low' ? '🔵 Dưới LCL'
                : '✅ Bình thường';

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 16px; font-size: 14px; color: #374151; text-align: center;">${i + 1}</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1f2937;">${a.logidx}</td>
            <td style="padding: 12px 16px; font-size: 14px; color: #374151;">${a.tc_name || '—'}</td>
            <td style="padding: 12px 16px; font-size: 13px; color: #374151; text-align: center;">${typeLabel}</td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: ${tempColor}; text-align: center;">${a.value_0 != null ? a.value_0.toFixed(1) : '—'}°C</td>
            <td style="padding: 12px 16px; font-size: 12px; text-align: center;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background: ${tempBg}; color: ${tempColor}; font-weight: 600;">${tempLabel}</span>
            </td>
            <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: ${humColor}; text-align: center;">${a.value_1 != null ? a.value_1.toFixed(1) : '—'}%</td>
            <td style="padding: 12px 16px; font-size: 12px; text-align: center;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background: ${humBg}; color: ${humColor}; font-weight: 600;">${humLabel}</span>
            </td>
            <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; text-align: center;">${logDate}</td>
        </tr>`;
    }).join('');

    const subject = `⚠️ [EnviroMonitor] Cảnh báo ${factoryName} — ${totalAlerts} cảm biến vượt ngưỡng (${now})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 960px; margin: 0 auto; padding: 24px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626, #f97316); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">⚠️ CẢNH BÁO MÔI TRƯỜNG</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Hệ thống EnviroMonitor phát hiện cảm biến vượt ngưỡng an toàn</p>
        </div>

        <!-- User & Factory Info -->
        <div style="background: #ffffff; padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #6b7280;">Người nhận:</span>
                        <strong style="color: #1f2937; margin-left: 8px;">${userName || '—'}</strong>
                    </td>
                    <td style="padding: 6px 0; text-align: right;">
                        <span style="font-size: 13px; color: #6b7280;">Nhà máy:</span>
                        <strong style="color: #1f2937; margin-left: 8px;">${factoryName || '—'}</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0;">
                        <span style="font-size: 13px; color: #6b7280;">Thời gian kiểm tra:</span>
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

        <!-- Alert Table -->
        <div style="background: #ffffff; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; min-width: 780px;" cellpadding="0" cellspacing="0">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">STT</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 2px solid #e5e7eb;">Mã vị trí</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 2px solid #e5e7eb;">Tên vị trí</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Loại</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Nhiệt độ</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Trạng thái</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Độ ẩm</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Trạng thái</th>
                        <th style="padding: 14px 16px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #e5e7eb;">Thời gian đo</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <!-- Threshold Reference — split Fridge / Room -->
        <div style="background: #fffbeb; padding: 20px 32px; border-top: 1px solid #fde68a;">
            <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #92400e;">📋 Ngưỡng an toàn cá nhân của bạn:</p>
            <table style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                    <td colspan="2" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #78350f;">🧊 Tủ lạnh (Fridge)</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0 4px 16px; font-size: 13px; color: #78350f;">
                        🌡️ Nhiệt độ: <strong>${thresholds.fridgeTempMin}°C — ${thresholds.fridgeTempMax}°C</strong>
                    </td>
                    <td style="padding: 4px 0; font-size: 13px; color: #78350f;">
                        💧 Độ ẩm: <strong>${thresholds.fridgeHumMin}% — ${thresholds.fridgeHumMax}%</strong>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 10px 0 6px; font-size: 13px; font-weight: 600; color: #78350f;">🏠 Phòng (Room)</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0 4px 16px; font-size: 13px; color: #78350f;">
                        🌡️ Nhiệt độ: <strong>${thresholds.roomTempMin}°C — ${thresholds.roomTempMax}°C</strong>
                    </td>
                    <td style="padding: 4px 0; font-size: 13px; color: #78350f;">
                        💧 Độ ẩm: <strong>${thresholds.roomHumMin}% — ${thresholds.roomHumMax}%</strong>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Email này được gửi tự động bởi hệ thống <strong style="color: #60a5fa;">EnviroMonitor</strong>
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #6b7280;">
                Vui lòng không trả lời email này. Để thay đổi ngưỡng cảnh báo, vào phần Cài đặt trên hệ thống.
            </p>
        </div>

    </div>
</body>
</html>`;

    return { subject, html };
};

module.exports = { buildAlertEmail };
