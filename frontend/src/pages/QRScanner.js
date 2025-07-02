import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton, LoadingSpinner, Message } from '../components';
import { IoQrCodeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlashOutline, IoFlashOffOutline, IoCameraReverseOutline } from 'react-icons/io5';
import { BrowserQRCodeReader } from '@zxing/library';
import { buildUrl } from '../config/api';
import API_CONFIG from '../config/api';
import ParticipantService from '../services/ParticipantService';
import { useDialog } from '../contexts/DialogContext';
import '../styles/QRScanner.css';

const QRScanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const scanIntervalRef = useRef(null);
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
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
  }, [loadEventData, loadScannedParticipants, cleanup]);

  
  useEffect(() => {
    initializeCamera();
  }, []);

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Seu navegador não suporta acesso à câmera');
        return;
      }

      
      const isSecure = window.location.protocol === 'http:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        console.warn('Protocolo não seguro detectado - pode causar problemas em mobile');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }

      setAvailableCameras(videoDevices);
      setHasCamera(true);

      readerRef.current = new BrowserQRCodeReader();

    } catch (err) {
      console.error('Erro ao inicializar câmera:', err);
      setError('Erro ao verificar câmeras disponíveis');
    }
  };

  const startScanner = async () => {
    try {
      setError(null);

      if (!videoRef.current) {
        setError('Elemento de vídeo não encontrado');
        return;
      }

      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      
      let constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30 }
        }
      };

      
      if (facingMode) {
        constraints.video.facingMode = facingMode;
      }

      
      if (availableCameras.length > 0 && currentCameraIndex >= 0 && availableCameras[currentCameraIndex]) {
        constraints.video.deviceId = { exact: availableCameras[currentCameraIndex].deviceId };
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);

      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('Nenhuma track de vídeo encontrada no stream');
      }

      videoRef.current.srcObject = streamRef.current;
      
      
      videoRef.current.style.display = 'block';
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;

      const playPromise = new Promise((resolve, reject) => {
        const onLoadedMetadata = () => {
          videoRef.current.play()
            .then(() => {
              resolve();
            })
            .catch(reject);
        };

        const onError = (error) => {
          console.error('Erro no vídeo:', error);
          reject(error);
        };

        videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        videoRef.current.addEventListener('error', onError, { once: true });

        setTimeout(() => {
          reject(new Error('Timeout ao carregar vídeo'));
        }, 10000);
      });

      await playPromise;

      setIsScanning(true);

      if (!readerRef.current) {
        readerRef.current = new BrowserQRCodeReader();
      }

      startContinuousScanning();

    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);
      
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
          streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
          setIsScanning(true);
          startContinuousScanning();
          return;
        } catch (simpleError) {
          errorMessage = `Erro mesmo com configuração básica: ${simpleError.message}`;
        }
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsScanning(false);
      
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const startContinuousScanning = () => {
    if (!readerRef.current || !videoRef.current) return;

    const scanFrame = async () => {
      if (!isScanning || !videoRef.current || !readerRef.current) return;

      try {
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const result = await readerRef.current.decodeFromImageElement(canvas);
        
        if (result && result.text) {
          handleScanSuccess(result.text);
        }
      } catch (err) {
        
        if (err.name !== 'NotFoundException') {
          console.debug('Erro de scan:', err.message);
        }
      }
    };

    
    scanIntervalRef.current = setInterval(scanFrame, 500);
  };
  const stopScanner = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (e) {
        console.warn('Erro ao resetar reader:', e);
      }
    }
  };

  const handleScanSuccess = async (qrCodeData) => {
    try {
      const cleanData = qrCodeData.trim();
      
      if (!/^\d{6}$/.test(cleanData)) {
        setScanResult({ 
          success: false, 
          message: 'QR Code deve conter um token de 6 dígitos' 
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      await markPresence(cleanData);
      
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      setScanResult({ 
        success: false, 
        message: 'Erro ao processar QR code' 
      });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const markPresence = async (token) => {
    try {
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
      console.error('Erro ao marcar presença:', err);
      dialog.alert('Erro de conexão');
      setScanResult({ success: false, message: 'Erro de conexão' });
    }
    setTimeout(() => setScanResult(null), 3000);
  };
  const toggleFlash = async () => {
    if (!streamRef.current) {
      setError('Câmera não está ativa');
      return;
    }

    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) {
        setError('Track de vídeo não encontrado');
        return;
      }

      const capabilities = track.getCapabilities();
      if (!capabilities.torch) {
        setError('Flash não suportado neste dispositivo');
        return;
      }

      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled }]
      });

      setFlashEnabled(!flashEnabled);

    } catch (err) {
      console.error('Erro ao controlar flash:', err);
      setError('Erro ao controlar flash');
      setTimeout(() => setError(null), 3000);
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      setError('Apenas uma câmera disponível');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      stopScanner();
      
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      
      const nextCamera = availableCameras[nextIndex];
      const newFacingMode = nextCamera.label.toLowerCase().includes('front') || 
                           nextCamera.label.toLowerCase().includes('user') ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      setTimeout(() => {
        startScanner();
      }, 500);
      
    } catch (err) {
      console.error('Erro ao trocar câmera:', err);
      setError('Erro ao trocar câmera');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleManualInput = async () => {
    const token = await dialog.prompt('Digite o token de 6 dígitos:', { label: 'Token', type: 'text' });
    if (token && token.trim()) {
      const cleanToken = token.trim();
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
          <div className="loading-container">
            <p>Carregando...</p>
          </div>
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
          <div className="error-container">
            <p>Evento não encontrado</p>
            <button onClick={handleBack}>Voltar</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="qr-scanner-container">
        <div className="qr-scanner-main">          {}
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

          {}
          <div className="event-info-banner">
            <h2>{event.title || event.name}</h2>
            <p>{event.location || event.localization || 'Local não informado'}</p>
          </div>

          {}
          <div className="scanner-section">            
            <div className="camera-container">
              <div className="camera-view">
                {}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    display: isScanning ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
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
                  <>
                    {}
                    <div className="scan-overlay">
                      <div className="scan-frame">
                        <div className="scan-corner top-left"></div>
                        <div className="scan-corner top-right"></div>
                        <div className="scan-corner bottom-left"></div>
                        <div className="scan-corner bottom-right"></div>
                        <div className="scan-line"></div>
                      </div>
                    </div>                    {}
                    <div className="camera-controls">
                      <button 
                        className="control-btn" 
                        onClick={toggleFlash}
                        disabled={!streamRef.current}
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
                  </>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <IoCloseCircleOutline />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {}
            <button className="manual-input-btn" onClick={handleManualInput}>
              OU DIGITE O TOKEN
            </button>
          </div>

          {}
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

          {}
          <div className="scanned-participants">
            <h3>PARTICIPANTES ESCANEADOS - {scannedParticipants.length}</h3>
            <div className="participants-list">              {scannedParticipants.length === 0 ? (
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
