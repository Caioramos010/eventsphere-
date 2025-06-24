import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BackButton } from '../components';
import { IoArrowBack, IoQrCodeOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlashOutline, IoFlashOffOutline, IoCameraReverseOutline } from 'react-icons/io5';
import { BrowserQRCodeReader } from '@zxing/library';
import API_CONFIG, { buildUrl } from '../config/api';
import './QRScanner.css';

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
  useEffect(() => {
    loadEventData();
    loadScannedParticipants();
    
    return () => {
      cleanup();
    };
  }, [id]);

  
  useEffect(() => {
    initializeCamera();
  }, []);

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

  const initializeCamera = async () => {
    try {
      console.log('Inicializando câmera...');
      
      
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
      
      console.log(`Encontradas ${videoDevices.length} câmeras:`, videoDevices);
      
      if (videoDevices.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }

      setAvailableCameras(videoDevices);
      setHasCamera(true);

      
      readerRef.current = new BrowserQRCodeReader();
      console.log('BrowserQRCodeReader inicializado');

    } catch (err) {
      console.error('Erro ao inicializar câmera:', err);
      setError('Erro ao verificar câmeras disponíveis');
    }
  };

  const loadEventData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildUrl(`/api/event/${id}`), {
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
  };

  const loadScannedParticipants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildUrl(`/api/participant/event/${id}/present`), {
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
  };  const startScanner = async () => {
    try {
      setError(null);
      console.log('Iniciando scanner...');

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

      console.log('Tentando obter câmera com constraints:', constraints);

      
      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtido com sucesso:', streamRef.current);

      
      const videoTracks = streamRef.current.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('Nenhuma track de vídeo encontrada no stream');
      }

      console.log('Video track info:', videoTracks[0].getSettings());

      
      videoRef.current.srcObject = streamRef.current;
      
      
      videoRef.current.style.display = 'block';
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.autoplay = true;

      
      const playPromise = new Promise((resolve, reject) => {
        const onLoadedMetadata = () => {
          console.log('Video metadata carregada:', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            readyState: videoRef.current.readyState
          });
          
          videoRef.current.play()
            .then(() => {
              console.log('Vídeo reproduzindo com sucesso');
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

      console.log('Vídeo carregado e reproduzindo, iniciando scanner...');
      setIsScanning(true);

      
      if (!readerRef.current) {
        readerRef.current = new BrowserQRCodeReader();
        console.log('BrowserQRCodeReader inicializado');
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

    console.log('Iniciando scan contínuo...');
    
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
          console.log('QR Code detectado:', result.text);
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
    console.log('Parando scanner...');
    setIsScanning(false);
    
    
    if (streamRef.current) {
      console.log('Parando stream de vídeo...');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track parada:', track.kind);
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

    console.log('Scanner parado com sucesso');
  };

  const handleScanSuccess = async (qrCodeData) => {
    try {
      console.log('QR Code detectado:', qrCodeData);
      
      
      const cleanData = qrCodeData.trim();
      
      
      let participantId;
      let eventId;
      
      
      if (cleanData.includes('http') && cleanData.includes('/participant/')) {
        const urlParts = cleanData.split('/');
        const participantIndex = urlParts.findIndex(part => part === 'participant');
        if (participantIndex !== -1 && participantIndex + 1 < urlParts.length) {
          participantId = urlParts[participantIndex + 1];
          
          const eventIndex = urlParts.findIndex(part => part === 'event');
          if (eventIndex !== -1 && eventIndex + 1 < urlParts.length) {
            eventId = urlParts[eventIndex + 1];
          }
        }
      }
      
      else if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
        try {
          const data = JSON.parse(cleanData);
          participantId = data.participantId || data.participant;
          eventId = data.eventId || data.event;
        } catch (e) {
          console.warn('Erro ao parsear JSON do QR code:', e);
        }
      }
      
      else if (cleanData.includes(':')) {
        const parts = cleanData.split(':');
        participantId = parts[0];
        eventId = parts[1];
      }
      
      else if (/^\d+$/.test(cleanData)) {
        participantId = cleanData;
        eventId = id; 
      }
      
      else if (cleanData.toLowerCase().includes('eventsphere') || 
               cleanData.toLowerCase().includes('participant')) {
        
        const numbers = cleanData.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          participantId = numbers[0];
          eventId = numbers.length > 1 ? numbers[1] : id;
        }
      }
      
      
      if (!participantId) {
        setScanResult({ 
          success: false, 
          message: 'QR Code não contém dados válidos do participante' 
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      
      if (eventId && eventId !== id) {
        setScanResult({ 
          success: false, 
          message: 'QR Code é de outro evento' 
        });
        setTimeout(() => setScanResult(null), 3000);
        return;
      }

      
      await markPresence(participantId);
      
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      setScanResult({ 
        success: false, 
        message: 'Erro ao processar QR code' 
      });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const markPresence = async (participantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildUrl(`/api/participant/${participantId}/presence`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId: id })
      });

      if (response.ok) {
        const data = await response.json();
        const participant = data.data;
        
        
        const newParticipant = {
          id: participant.id,
          name: participant.user?.name || 'Participante',
          age: participant.user?.age || 'N/A',
          status: participant.status || 'PRESENTE',
          scannedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        
        setScannedParticipants(prev => {
          
          if (prev.find(p => p.id === newParticipant.id)) {
            setScanResult({ 
              success: false, 
              message: 'Participante já foi escaneado' 
            });
            return prev;
          }
          
          setScanResult({ 
            success: true, 
            participant: newParticipant,
            message: 'Presença confirmada!' 
          });
          
          return [newParticipant, ...prev];
        });
        
      } else if (response.status === 404) {
        setScanResult({ 
          success: false, 
          message: 'Participante não encontrado' 
        });
      } else if (response.status === 400) {
        const errorData = await response.json();
        setScanResult({ 
          success: false, 
          message: errorData.message || 'Erro ao marcar presença' 
        });
      } else {
        setScanResult({ 
          success: false, 
          message: 'Erro interno do servidor' 
        });
      }
    } catch (err) {
      console.error('Erro ao marcar presença:', err);
      setScanResult({ 
        success: false, 
        message: 'Erro de conexão' 
      });
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
      console.log(`Flash ${!flashEnabled ? 'ligado' : 'desligado'}`);

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
      console.log('Trocando câmera...');
      
      
      stopScanner();
      
      
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      
      
      const nextCamera = availableCameras[nextIndex];
      const newFacingMode = nextCamera.label.toLowerCase().includes('front') || 
                           nextCamera.label.toLowerCase().includes('user') ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      console.log(`Trocando para câmera ${nextIndex}: ${nextCamera.label}`);
      
      
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
    const code = prompt('Digite o código do participante:');
    if (code && code.trim()) {
      await markPresence(code.trim());
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
            <p>{event.location} • {new Date(event.date).toLocaleDateString('pt-BR')}</p>
          </div>

          {}
          <div className="scanner-section">            <div className="camera-container">
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
              OU DIGITE O CÓDIGO
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
            <div className="participants-list">
              {scannedParticipants.length === 0 ? (
                <p className="no-participants">Nenhum participante escaneado ainda</p>
              ) : (
                scannedParticipants.map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      <span className="participant-details">
                        {participant.age !== 'N/A' ? `${participant.age} • ` : ''}{participant.status}
                      </span>
                    </div>
                    <span className="scan-time">{participant.scannedAt}</span>
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
