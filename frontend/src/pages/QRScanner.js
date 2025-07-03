import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton, LoadingSpinner, Message } from '../components';
import { IoQrCodeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlashOutline, IoFlashOffOutline, IoCameraReverseOutline } from 'react-icons/io5';
import { Html5Qrcode } from 'html5-qrcode';
import { buildUrl } from '../config/api';
import API_CONFIG from '../config/api';
import ParticipantService from '../services/ParticipantService';
import { useDialog } from '../contexts/DialogContext';
import '../styles/QRScanner.css';

const QRScanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scannerContainerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); 
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [scannedParticipants, setScannedParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const dialog = useDialog();

  
  const cleanup = useCallback(() => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(err => {
        console.error('Erro ao parar o scanner:', err);
      });
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  }, []);

  
  const loadEventData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.EVENT_GET, { eventID: id }), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const eventData = data.data;
        setEvent(eventData);
      } else {
        setError('Erro ao carregar dados do evento');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  
  const loadScannedParticipants = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PARTICIPANT_EVENT_PRESENT, { eventId: id }), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const participants = data.data || [];
        setScannedParticipants(participants);
      }
    } catch (err) {
      console.error('Erro ao carregar participantes:', err);
    }
  }, [id]);
  
  
  useEffect(() => {
    loadEventData();
    loadScannedParticipants();
    
    return () => {
      cleanup();
    };
  }, [id, loadEventData, loadScannedParticipants, cleanup]);

  
  useEffect(() => {
    initializeCamera();
    
    
    const style = document.createElement('style');
    style.innerHTML = `
      #reader {
        position: relative !important;
        min-height: 300px !important;
        border: 1px solid #ccc !important;
      }
      #reader video {
        height: 300px !important;
        object-fit: cover !important;
        border-radius: 12px !important;
      }
      #reader__scan_region {
        min-height: 200px !important;
      }
      #reader__dashboard {
        background: #f8f8f8 !important;
        padding: 5px !important;
      }
      #reader__dashboard_section_csr button {
        background: #2563eb !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 8px 16px !important;
      }
      #reader__dashboard_section_swaplink {
        color: #2563eb !important;
      }
      #reader__status_span {
        color: #333 !important;
        font-size: 14px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  
  const initializeCamera = async () => {
    try {
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Seu navegador não suporta acesso à câmera');
        return;
      }

      
      const browserSupport = 
        typeof HTMLCanvasElement !== 'undefined' && 
        !!HTMLCanvasElement.prototype.getContext && 
        typeof Worker !== 'undefined';
      
      if (!browserSupport) {
        setError('Seu navegador não suporta recursos necessários para o escaneamento de QR code');
        return;
      }

      
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        setError('Protocolo não seguro. Use HTTPS ou localhost para acessar a câmera.');
        return;
      }

      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }

      setAvailableCameras(videoDevices);
      setHasCamera(true);
    } catch (err) {
      setError('Erro ao verificar câmeras disponíveis');
    }
  };

  
  const startScanner = async () => {
    try {
      setError(null);
      setScanResult(null);
      
      
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }

      
      const readerElement = document.getElementById('reader');
      if (!readerElement) {
        setError('Elemento do leitor não encontrado');
        return;
      }

      
      readerElement.style.display = 'block';
      readerElement.style.width = '100%';
      readerElement.style.height = '300px';
      readerElement.style.minHeight = '300px';
      readerElement.style.maxHeight = '300px';

      
      html5QrCodeRef.current = new Html5Qrcode("reader");

      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        formatsToSupport: undefined
      };

      let cameraId;
      
      
      if (availableCameras.length > 0 && currentCameraIndex >= 0 && currentCameraIndex < availableCameras.length) {
        cameraId = availableCameras[currentCameraIndex].deviceId;
      } else {
        
        cameraId = { facingMode };
      }

      
      await html5QrCodeRef.current.start(
        cameraId, 
        config,
        handleScanSuccess,
        handleScanError
      );

      setIsScanning(true);
    } catch (err) {
      let errorMessage = 'Erro ao acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso nas configurações do navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada neste dispositivo.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configurações de câmera não suportadas. Tentando configuração básica...';
        
        
        try {
          html5QrCodeRef.current = new Html5Qrcode("reader");
          await html5QrCodeRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 5,
              qrbox: { width: 200, height: 200 }
            },
            handleScanSuccess,
            handleScanError
          );
          setIsScanning(true);
          return;
        } catch (simpleError) {
          errorMessage = `Erro mesmo com configuração básica: ${simpleError.message}`;
        }
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  };

  
  const handleScanError = (error) => {
    
    if (
      typeof error === 'string' && (
        error.includes('NotFoundException') || 
        error.includes('IndexSizeError') || 
        error.includes('source width is 0') ||
        error.includes('MultiFormatReader') ||
        error.includes('No MultiFormat Readers') ||
        error.includes('could not decode') ||
        error.includes('not found')
      )
    ) {
      
      return;
    }
  };

  
  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.pause();
      }
      
      
      let token = decodedText.trim();
      
      
      token = token.replace(/\D/g, '');
      
      
      if (token.length > 6) {
        token = token.slice(-6);
      }
      
      
      if (!/^\d{6}$/.test(token)) {
        dialog.alert('QR Code inválido. Esperado um token de 6 dígitos.');
        setScanResult({ success: false, message: 'QR Code inválido' });
        
        
        setTimeout(() => {
          if (html5QrCodeRef.current && isScanning) {
            html5QrCodeRef.current.resume();
          }
          setScanResult(null);
        }, 3000);
        return;
      }
      
      
      await markPresence(token);
      
      
      setTimeout(() => {
        if (html5QrCodeRef.current && isScanning) {
          html5QrCodeRef.current.resume();
        }
        setScanResult(null);
      }, 5000);
      
    } catch (err) {
      
      if (err.isParticipantAlreadyPresent || (err.message && err.message.includes('já está presente'))) {
        dialog.alert('Participante já está presente');
      } else {
        dialog.alert('Erro ao processar QR code');
      }
      
      
      setTimeout(() => {
        if (html5QrCodeRef.current && isScanning) {
          html5QrCodeRef.current.resume();
        }
      }, 3000);
    }
  };

  
  const markPresence = async (token) => {
    try {
      
      if (!/^\d{6}$/.test(token)) {
        dialog.alert('Token inválido. Deve conter exatamente 6 dígitos');
        setScanResult({ success: false, message: 'Token inválido' });
        return;
      }
      
      
      const result = await ParticipantService.markPresenceByToken(token);
      
      if (result.success) {
        
        const participant = result.data;
        const newParticipant = {
          id: participant.id,
          name: participant.user?.name || 'Participante',
          age: participant.user?.age || 'N/A',
          status: participant.status || 'PRESENTE',
          scannedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        
        setScannedParticipants(prev => {
          if (prev.find(p => p.id === newParticipant.id)) {
            dialog.alert('Participante já foi escaneado');
            setScanResult({ success: false, message: 'Participante já foi escaneado' });
            return prev;
          }
          dialog.alert('Presença confirmada!');
          setScanResult({ success: true, participant: newParticipant, message: 'Presença confirmada!' });
          return [newParticipant, ...prev];
        });
      } else {
        dialog.alert(result.message || 'Erro ao marcar presença');
        setScanResult({ success: false, message: result.message || 'Erro ao marcar presença' });
      }
    } catch (err) {
      
      if (err.isParticipantAlreadyPresent || (err.message && err.message.includes('já está presente'))) {
        dialog.alert('Participante já está presente');
        setScanResult({ success: false, message: 'Participante já está presente' });
      } else {
        
        dialog.alert('Erro ao marcar presença');
        setScanResult({ success: false, message: 'Erro ao marcar presença' });
      }
    }
  };

  
  const stopScanner = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setIsScanning(false);
        html5QrCodeRef.current = null;
        
        
        const readerElement = document.getElementById('reader');
        if (readerElement) {
          readerElement.style.display = 'none';
        }
      }).catch(err => {
        
        html5QrCodeRef.current = null;
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  
  const toggleFlash = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        console.error('Erro ao controlar flash:', err);
        setError('Flash não suportado neste dispositivo');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  
  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      setError('Apenas uma câmera disponível');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      
      
      const nextCamera = availableCameras[nextIndex];
      const newFacingMode = nextCamera.label.toLowerCase().includes('front') || 
                         nextCamera.label.toLowerCase().includes('user') ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      
      setTimeout(() => {
        startScanner();
      }, 1000);
      
    } catch (err) {
      setError('Erro ao trocar câmera');
      setTimeout(() => setError(null), 3000);
    }
  };

  
  const handleManualInput = async () => {
    const tokenInput = await dialog.prompt('Digite o token de 6 dígitos:', { label: 'Token', type: 'text' });
    if (tokenInput && tokenInput.trim()) {
      
      let cleanToken = tokenInput.trim();
      
      
      cleanToken = cleanToken.replace(/\D/g, '');
      
      
      if (cleanToken.length > 6) {
        cleanToken = cleanToken.slice(-6);
      }
      
      
      if (!/^\d{6}$/.test(cleanToken)) {
        dialog.alert('Token deve conter exatamente 6 dígitos');
        return;
      }
      
      
      await markPresence(cleanToken);
    }
  };

  const handleBack = () => {
    navigate(`/event/${id}`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="qr-scanner-container">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="qr-scanner-container">
          <Message 
            type="error" 
            title="Evento não encontrado" 
            message="Não foi possível carregar os dados do evento."
            actionText="Voltar"
            onAction={() => navigate('/events')}
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="qr-scanner-container">
        <div className="qr-scanner-main">
          <div className="scanner-header">
            <BackButton onClick={handleBack} />
            <div className="scanner-title">
              <IoQrCodeOutline className="scanner-icon" />
              <div>
                <h1>ESCANEAR QR CODE</h1>
                <span>NA TELA</span>
              </div>
            </div>
          </div>

          <div className="event-info-banner">
            <h2>{event.title || event.name}</h2>
            <p>{event.location || event.localization || 'Local não informado'}</p>
          </div>

          <div className="scanner-section">            
            <div className="camera-container">
              <div id="reader" style={{ 
                width: '100%', 
                height: '300px',
                minHeight: '300px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: isScanning ? 'block' : 'none'
              }} ref={scannerContainerRef}></div>
              
              {!isScanning && (
                <div className="camera-placeholder">
                  <IoQrCodeOutline className="placeholder-icon" />
                  <p>Câmera não iniciada</p>
                  {availableCameras.length > 0 && (
                    <p className="camera-info">
                      {availableCameras.length} câmera(s) detectada(s)
                      <br />
                      Atual: {currentCameraIndex >= 0 && availableCameras[currentCameraIndex] ? 
                        (availableCameras[currentCameraIndex].label || `Câmera ${currentCameraIndex + 1}`) : 
                        'Nenhuma selecionada'}
                    </p>
                  )}
                  <button 
                    className="start-camera-btn" 
                    onClick={startScanner}
                    disabled={!hasCamera}
                  >
                    {hasCamera ? 'INICIAR CÂMERA' : 'CÂMERA INDISPONÍVEL'}
                  </button>
                </div>
              )}
              
              {isScanning && (
                <div className="camera-controls">
                  <button 
                    className="control-btn" 
                    onClick={toggleFlash}
                    title="Toggle Flash"
                  >
                    {flashEnabled ? <IoFlashOffOutline /> : <IoFlashOutline />}
                  </button>
                  <button 
                    className="control-btn" 
                    onClick={switchCamera}
                    disabled={availableCameras.length <= 1}
                    title={`Switch Camera (${currentCameraIndex + 1}/${availableCameras.length})`}
                  >
                    <IoCameraReverseOutline />
                  </button>
                  <button 
                    className="control-btn stop-btn" 
                    onClick={stopScanner}
                    title="Stop Camera"
                  >
                    <IoCloseCircleOutline />
                  </button>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <IoCloseCircleOutline />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="manual-input-btn" onClick={handleManualInput}>
                DIGITE O TOKEN
              </button>
            </div>
          </div>

          {scanResult && (
            <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
              <div className="result-icon">
                {scanResult.success ? <IoCheckmarkCircleOutline /> : <IoCloseCircleOutline />}
              </div>
              <div className="result-text">
                {scanResult.success ? (
                  <>
                    <h3>{scanResult.message || 'Participante Confirmado!'}</h3>
                    {scanResult.participant && <p>{scanResult.participant.name}</p>}
                  </>
                ) : (
                  <>
                    <h3>Erro</h3>
                    <p>{scanResult.message || 'Código inválido'}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="scanned-participants">
            <h3>PARTICIPANTES ESCANEADOS - {scannedParticipants.length}</h3>
            <div className="participants-list">
              {scannedParticipants.length === 0 ? (
                <p className="no-participants">Nenhum participante escaneado ainda</p>
              ) : (
                scannedParticipants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                    </div>
                    <IoCheckmarkCircleOutline className="status-icon success" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QRScanner;