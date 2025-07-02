import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MyQRCode from '../components/MyQRCode';
import API_CONFIG, { buildUrl } from '../config/api';

const MyQRCodePage = () => {
  const { eventId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_QR_CODE, { eventId }), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setQrData(data.data);
        } else {
          setError('Erro ao gerar QR Code');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchQrCode();
  }, [eventId]);

  if (loading) return <div>Carregando QR Code...</div>;
  if (error) return <div>{error}</div>;
  if (!qrData) return <div>Nenhum dado de QR Code encontrado.</div>;

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', textAlign: 'center' }}>
      <h2>Seu QR Code de Presença</h2>
      <MyQRCode value={qrData.qrCodeText} />
      <div style={{ marginTop: 16, wordBreak: 'break-all' }}>
        <strong>Código:</strong> <span>{qrData.qrCodeText}</span>
      </div>
    </div>
  );
};

export default MyQRCodePage;