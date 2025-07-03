import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

const CameraDebugger = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    initializeCameras();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    
    setIsStreaming(false);
  };

  const initializeCameras = async () => {
    try {
      // Verifica se há suporte a câmera
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('Nenhuma câmera encontrada neste dispositivo');
        return;
      }

      // Lista câmeras disponíveis
      const videoDevices = await QrScanner.listCameras(true);
      setCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].id);
      }
    } catch (err) {
      setError(`Erro ao listar câmeras: ${err.message}`);
    }
  };

  const startStream = async () => {
    try {
      setError(null);
      cleanup();

      if (!videoRef.current) {
        setError('Elemento de vídeo não encontrado');
        return;
      }

      // Cria novo scanner
      scannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          console.log('QR Code detectado:', result.data);
          setScanResult({
            text: result.data,
            timestamp: new Date().toLocaleTimeString()
          });
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCamera,
          maxScansPerSecond: 1 // Limite para debug
        }
      );

      // Inicia o scanner
      await scannerRef.current.start();
      setIsStreaming(true);

      // Obtém informações do stream
      setTimeout(() => {
        if (videoRef.current && videoRef.current.srcObject) {
          streamRef.current = videoRef.current.srcObject;
          const track = streamRef.current.getVideoTracks()[0];
          
          if (track) {
            const settings = track.getSettings();
            const capabilities = track.getCapabilities();
            
            setStreamInfo({
              settings,
              capabilities,
              label: track.label
            });
          }
        }
      }, 1000);

    } catch (err) {
      setError(`Erro ao iniciar stream: ${err.message}`);
    }
  };

  const startScanning = () => {
    if (!scannerRef.current || !videoRef.current) {
      setError('Scanner não inicializado');
      return;
    }
    
    // Ao usar qr-scanner, o escaneamento já é contínuo
    // Não precisamos implementar um loop manual
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
          <          select 
            value={selectedCamera} 
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{ padding: '10px', marginRight: '10px', borderRadius: '5px' }}
          >
            {cameras.map((camera, index) => (
              <option key={camera.id} value={camera.id}>
                Câmera {index + 1}: {camera.label || `Dispositivo ${index}`}
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
