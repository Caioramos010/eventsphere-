import React from 'react';
import QRCode from 'qrcode.react';

const MyQRCode = ({ value }) => {
  return (
    <div style={{ textAlign: 'center', margin: '32px 0' }}>
      <QRCode value={value} size={220} level="H" includeMargin={true} />
      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 16 }}>
        Apresente este QR Code para o organizador ou colaborador do evento
      </div>
    </div>
  );
};

export default MyQRCode;
