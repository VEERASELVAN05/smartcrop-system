import jsPDF from 'jspdf';

const generateReport = (user, profile, predictions) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-IN');

  // Header
  doc.setFillColor(27, 42, 74);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartCrop System', 15, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Crop Failure Prediction Report', 15, 28);
  doc.text(`Generated: ${today}`, 140, 28);

  // Farmer Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Farmer Information', 15, 50);

  doc.setFillColor(245, 247, 250);
  doc.rect(15, 55, 180, 45, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const farmerInfo = [
    [`Name:`, user.name || 'N/A'],
    [`Phone:`, user.phone || 'N/A'],
    [`District:`, user.district || 'N/A'],
  ];
  farmerInfo.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, 65 + i * 10);
    doc.setFont('helvetica', 'normal');
    doc.text(val, 60, 65 + i * 10);
  });

  // Farm Profile
  if (profile) {
    const profileInfo = [
      [`Crop Type:`, profile.crop_type || 'N/A'],
      [`Land Size:`, `${profile.land_size} acres`],
      [`Soil Type:`, profile.soil_type || 'N/A'],
    ];
    profileInfo.forEach(([label, val], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 115, 65 + i * 10);
      doc.setFont('helvetica', 'normal');
      doc.text(val, 155, 65 + i * 10);
    });
  }

  // Risk Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Assessment Summary', 15, 115);

  if (predictions && predictions.length > 0) {
    const latest = predictions[0];
    const riskColor = latest.risk_score >= 60
      ? [220, 38, 38]
      : latest.risk_score >= 30
      ? [217, 119, 6]
      : [5, 150, 105];

    // Risk score box
    doc.setFillColor(...riskColor);
    doc.rect(15, 120, 80, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`${latest.risk_score}%`, 35, 140);
    doc.setFontSize(12);
    doc.text(latest.risk_status, 20, 150);

    // Status box
    doc.setFillColor(245, 247, 250);
    doc.rect(105, 120, 90, 35, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Insurance Status:', 110, 133);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const insuranceText = latest.risk_score >= 60
      ? 'ELIGIBLE - Claim can be filed'
      : 'Not eligible at this time';
    doc.text(insuranceText, 110, 143);

    doc.setTextColor(0, 0, 0);
  }

  // Prediction History Table
  if (predictions && predictions.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Prediction History (Last 10)', 15, 175);

    // Table header
    doc.setFillColor(27, 42, 74);
    doc.rect(15, 180, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Date & Time', 18, 187);
    doc.text('Risk Score', 90, 187);
    doc.text('Status', 140, 187);

    // Table rows
    predictions.slice(0, 8).forEach((p, i) => {
      const y = 195 + i * 10;
      const bg = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
      doc.setFillColor(...bg);
      doc.rect(15, y - 5, 180, 10, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      const date = new Date(p.date).toLocaleString('en-IN');
      doc.text(date, 18, y + 2);

      const scoreColor = p.risk_score >= 60
        ? [220, 38, 38]
        : p.risk_score >= 30
        ? [217, 119, 6]
        : [5, 150, 105];
      doc.setTextColor(...scoreColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${p.risk_score}%`, 90, y + 2);

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(p.risk_status, 140, y + 2);
    });
  }

  // Footer
  doc.setFillColor(27, 42, 74);
  doc.rect(0, 277, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(
    'Sri Krishna College of Technology | SmartCrop v2.0 | Confidential',
    15, 287
  );
  doc.text(`Page 1`, 185, 287);

  // Save
  doc.save(`SmartCrop_Report_${user.name}_${today}.pdf`);
};

export default generateReport;