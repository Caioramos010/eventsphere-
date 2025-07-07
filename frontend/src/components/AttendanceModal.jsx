import React from 'react';
import StandardModal from './StandardModal';
import PropTypes from 'prop-types';

const AttendanceModal = ({ 
  isOpen, 
  onClose, 
  attendanceReport,
  onPrintReport,
  className = ''
}) => {
  if (!isOpen || !attendanceReport) return null;

  const { presentList = [], absentList = [], eventName } = attendanceReport;
  const totalParticipants = presentList.length + absentList.length;
  const attendancePercentage = totalParticipants > 0 ? 
    ((presentList.length / totalParticipants) * 100).toFixed(1) : 0;

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório de Presença"
      variant="attendance"
      size="large"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      className={className}
      actions={
        onPrintReport && (
          <button 
            className="modern-btn"
            onClick={onPrintReport}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Imprimir Relatório
          </button>
        )
      }
    >
      <div>
        {/* Summary */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {eventName && (
            <h4 style={{
              color: 'var(--color-primary)',
              fontSize: '20px',
              marginBottom: '10px',
              margin: '0 0 16px 0'
            }}>
              {eventName}
            </h4>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '12px 18px',
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-success)',
                lineHeight: 1,
                marginBottom: '4px'
              }}>
                {presentList.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Presentes
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '12px 18px',
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-danger)',
                lineHeight: 1,
                marginBottom: '4px'
              }}>
                {absentList.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Ausentes
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '12px 18px',
              minWidth: '100px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-primary)',
                lineHeight: 1,
                marginBottom: '4px'
              }}>
                {attendancePercentage}%
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Presença
              </div>
            </div>
          </div>
        </div>
        
        {/* Lists */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* Present List */}
          <div style={{ flex: 1 }}>
            <h5 style={{
              color: 'var(--color-success)',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Presentes ({presentList.length})
            </h5>
            <div style={{
              background: 'rgba(39, 174, 96, 0.1)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {presentList.length > 0 ? (
                presentList.map((participant, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '8px 0',
                      borderBottom: index < presentList.length - 1 ? '1px solid rgba(39, 174, 96, 0.2)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: 'var(--color-text-white)',
                      fontSize: '14px'
                    }}>
                      {participant.userName || participant.userEmail || participant.name || 'Participante'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{
                  color: 'var(--color-text-light)',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  Nenhum participante presente
                </div>
              )}
            </div>
          </div>
          
          {/* Absent List */}
          <div style={{ flex: 1 }}>
            <h5 style={{
              color: 'var(--color-danger)',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Ausentes ({absentList.length})
            </h5>
            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {absentList.length > 0 ? (
                absentList.map((participant, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '8px 0',
                      borderBottom: index < absentList.length - 1 ? '1px solid rgba(231, 76, 60, 0.2)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-danger)',
                      flexShrink: 0
                    }}></div>
                    <span style={{
                      color: 'var(--color-text-white)',
                      fontSize: '14px'
                    }}>
                      {participant.userName || participant.userEmail || participant.name || 'Participante'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{
                  color: 'var(--color-text-light)',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  Todos os participantes estão presentes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StandardModal>
  );
};

AttendanceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  attendanceReport: PropTypes.shape({
    eventName: PropTypes.string,
    presentList: PropTypes.array,
    absentList: PropTypes.array
  }),
  onPrintReport: PropTypes.func,
  className: PropTypes.string
};

export default AttendanceModal;
