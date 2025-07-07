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

  // Função para limpar os recursos quando o componente é desmontado
  const cleanup = useCallback(() => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(err => {
        console.error('Erro ao parar o scanner:', err);
      });
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Carrega os dados do evento
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

  // Carrega a lista de participantes já escaneados
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
  
  // Inicializa os dados ao montar o componente
  useEffect(() => {
    loadEventData();
    loadScannedParticipants();
    
    return () => {
      cleanup();
    };
  }, [id, loadEventData, loadScannedParticipants, cleanup]);

  // Inicializa a verificação da câmera ao montar o componente
  useEffect(() => {
    initializeCamera();
  }, []);

  // Inicializa a verificação da câmera
  const initializeCamera = async () => {
    try {
      console.log('Inicializando câmera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Seu navegador não suporta acesso à câmera');
        return;
      }

      // Verifica se está em um contexto seguro (HTTPS ou localhost)
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        console.warn('Protocolo não seguro detectado - pode causar problemas com câmera');
      }

      // Enumera dispositivos de câmera disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log(`Encontradas ${videoDevices.length} câmeras:`, videoDevices.map(d => d.label || d.deviceId));
      
      if (videoDevices.length === 0) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }

      setAvailableCameras(videoDevices);
      setHasCamera(true);
      
      console.log('Camera inicializada com sucesso');

    } catch (err) {
      console.error('Erro ao inicializar câmera:', err);
      setError('Erro ao verificar câmeras disponíveis');
    }
  };

  // Inicia o scanner de QR code
  const startScanner = async () => {
    try {
      setError(null);
      setScanResult(null);
      
      // Para o scanner se já estiver em execução
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }

      // Cria um novo scanner Html5Qrcode
      html5QrCodeRef.current = new Html5Qrcode("reader");

      // Configurações otimizadas para leitura de QR code
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const config = {
        fps: 10,
        qrbox: isMobileDevice ? { width: 250, height: 250 } : { width: 300, height: 300 },
        disableFlip: false,
        aspectRatio: 1.0,
        formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE]
      };

      let cameraId;
      
      // Determina qual câmera usar
      if (availableCameras.length > 0 && currentCameraIndex >= 0 && currentCameraIndex < availableCameras.length) {
        cameraId = availableCameras[currentCameraIndex].deviceId;
      } else {
        // Usa a configuração de facingMode se não houver câmera específica selecionada
        cameraId = { facingMode };
      }

      // Inicia o scanner com as configurações definidas
      await html5QrCodeRef.current.start(
        cameraId, 
        config,
        handleScanSuccess,
        handleScanError
      );

      setIsScanning(true);
      console.log('Scanner iniciado com sucesso');

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
        
        // Tenta novamente com configurações mais simples
        try {
          console.log('Tentando configuração básica de câmera...');
          html5QrCodeRef.current = new Html5Qrcode("reader");
          await html5QrCodeRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 5,
              qrbox: 250
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

  // Tratamento de erro durante o escaneamento
  const handleScanError = (error) => {
    // Ignora erros de "não encontrado", pois são esperados quando não há QR code na frente da câmera
    if (error === 'QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.') {
      return;
    }
    
    // Log de erro apenas para fins de depuração
    console.debug('Erro de escaneamento:', error);
  };

  // Manipula quando um QR code é lido com sucesso
  const handleScanSuccess = async (decodedText, decodedResult) => {
    try {
      console.log('QR Code detectado:', decodedText);
      
      // Pausa o scanner temporariamente para evitar leituras duplicadas
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.pause();
      }
      
      // Processa o QR code lido
      const token = decodedText.trim();
      
      // Verifica se o token possui o formato esperado (6 dígitos)
      if (!/^\d{6}$/.test(token)) {
        dialog.alert('QR Code inválido. Esperado um token de 6 dígitos.');
        setScanResult({ success: false, message: 'QR Code inválido' });
        
        // Retoma o escaneamento após 3 segundos
        setTimeout(() => {
          if (html5QrCodeRef.current && isScanning) {
            html5QrCodeRef.current.resume();
          }
          setScanResult(null);
        }, 3000);
        return;
      }
      
      // Marca a presença do participante no evento
      await markPresence(token);
      
      // Retoma o escaneamento após 3 segundos
      setTimeout(() => {
        if (html5QrCodeRef.current && isScanning) {
          html5QrCodeRef.current.resume();
        }
        setScanResult(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      dialog.alert('Erro ao processar QR code');
      
      // Retoma o escaneamento após o erro
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.resume();
      }
    }
  };

  // Marca a presença do participante no evento
  const markPresence = async (token) => {
    try {
      console.log('Marcando presença com token:', token);
      const result = await ParticipantService.markPresenceByToken(id, token);
      
      if (result.success) {
        // Adiciona o participante à lista de escaneados
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
  };

  // Para o scanner de QR code
  const stopScanner = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setIsScanning(false);
        console.log('Scanner parado com sucesso');
      }).catch(err => {
        console.error('Erro ao parar o scanner:', err);
      });
    }
  };

  // Alterna o flash da câmera (se disponível)
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

  // Alterna entre as câmeras disponíveis
  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      setError('Apenas uma câmera disponível');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      // Para o scanner atual
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      // Muda para a próxima câmera
      const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(nextIndex);
      
      // Atualiza o facingMode com base no nome da câmera
      const nextCamera = availableCameras[nextIndex];
      const newFacingMode = nextCamera.label.toLowerCase().includes('front') || 
                         nextCamera.label.toLowerCase().includes('user') ? 'user' : 'environment';
      setFacingMode(newFacingMode);
      
      console.log(`Mudando para câmera ${nextIndex + 1}/${availableCameras.length}: ${nextCamera.label}`);
      
      // Reinicia o scanner com a nova câmera
      setTimeout(() => {
        startScanner();
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao trocar câmera:', err);
      setError('Erro ao trocar câmera');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Permite entrada manual do token
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
                height: '100%',
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
