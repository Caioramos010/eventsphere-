import React, { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

const CameraDebugger = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    initializeCameras();
    readerRef.current = new BrowserQRCodeReader();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const initializeCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError(`Erro ao listar câmeras: ${err.message}`);
    }
  };

  const startStream = async () => {
    try {
      setError(null);
      cleanup();

      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = streamRef.current;
      
      await videoRef.current.play();
      setIsStreaming(true);

      
      const track = streamRef.current.getVideoTracks()[0];
      const settings = track.getSettings();
      const capabilities = track.getCapabilities();
      
      setStreamInfo({
        settings,
        capabilities,
        label: track.label
      });

      
      startScanning();

    } catch (err) {
      setError(`Erro ao iniciar stream: ${err.message}`);
    }
  };

  const startScanning = () => {
    const scanFrame = async () => {
      if (!videoRef.current || !readerRef.current || !isStreaming) return;

      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const result = await readerRef.current.decodeFromImageElement(canvas);
        
        if (result && result.text) {
          setScanResult({
            text: result.text,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        
      }
    };

    const interval = setInterval(scanFrame, 1000);
    
    return () => clearInterval(interval);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#2c3e50', color: 'white', minHeight: '100vh' }}>
      <h2>🔧 Camera Debugger</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Protocolo de Segurança:</h3>
        <p>Protocolo: {window.location.protocol}</p>
        <p>Host: {window.location.hostname}</p>
        <p style={{ color: window.location.protocol === 'https:' ? '#27ae60' : '#e74c3c' }}>
          {window.location.protocol === 'https:' ? '✅ HTTPS - OK para mobile' : '⚠️ HTTP - Pode não funcionar em mobile'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Câmeras Detectadas: {cameras.length}</h3>
        {cameras.length > 0 ? (
          <select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
          >
            {cameras.map((camera, index) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                Câmera {index + 1}: {camera.label || `Dispositivo ${camera.deviceId.substr(0, 8)}...`}
              </option>
            ))}
          </select>
        ) : (
          <p>Nenhuma câmera encontrada</p>
        )}
        
        <button 
          onClick={startStream}
          disabled={cameras.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isStreaming ? 'Reiniciar Stream' : 'Iniciar Stream'}
        </button>
        
        <button 
          onClick={cleanup}
          style={{
            padding: '10px 20px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Parar
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#e74c3c', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3>Preview da Câmera:</h3>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '300px',
              backgroundColor: '#34495e',
              borderRadius: '10px',
              objectFit: 'cover'
            }}
          />
        </div>

        {streamInfo && (
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3>Informações do Stream:</h3>
            <div style={{ backgroundColor: '#34495e', padding: '15px', borderRadius: '5px' }}>
              <p><strong>Label:</strong> {streamInfo.label}</p>
              <p><strong>Resolução:</strong> {streamInfo.settings.width}x{streamInfo.settings.height}</p>
              <p><strong>Frame Rate:</strong> {streamInfo.settings.frameRate}</p>
              <p><strong>Facing Mode:</strong> {streamInfo.settings.facingMode}</p>
              
              <h4>Capacidades:</h4>
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(streamInfo.capabilities, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {scanResult && (
        <div style={{ marginTop: '20px', backgroundColor: '#27ae60', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 QR Code Detectado!</h3>
          <p><strong>Conteúdo:</strong> {scanResult.text}</p>
          <p><strong>Horário:</strong> {scanResult.timestamp}</p>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', opacity: '0.8' }}>
        <h4>Dicas de Troubleshooting:</h4>
        <ul>
          <li>Para dispositivos móveis, HTTPS é obrigatório</li>
          <li>Verifique se as permissões de câmera estão habilitadas</li>
          <li>Teste em diferentes navegadores (Chrome, Safari, Firefox)</li>
          <li>Feche outros aplicativos que possam estar usando a câmera</li>
          <li>No iOS Safari, interação do usuário pode ser necessária antes de acessar a câmera</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraDebugger;
