import React from 'react';
import '../styles/EventPrintPage.css';

function EventAttendancePrintPage({ event, attendanceReport }) {
  if (!event || !attendanceReport) return <div>Carregando...</div>;

  return (
    <div className="print-page-container">
      <h1 className="print-title">{event.name}</h1>
      <div className="print-details">
        <div><b>Data:</b> {event.dateFixedStart} {event.timeFixedStart}</div>
        <div><b>Local:</b> {event.localization}</div>
        <div><b>Descrição:</b> {event.description}</div>
      </div>
      <h2 className="print-subtitle">Relatório de Presença</h2>
      <div className="print-stats">
        <span className="stat-item present">Presentes: {attendanceReport.presentCount}</span>
        <span className="stat-item absent">Ausentes: {attendanceReport.absentCount}</span>
        <span className="stat-item total">Total: {attendanceReport.totalParticipants}</span>
      </div>
      <h3 className="print-section-title">Participantes Presentes</h3>
      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Colaborador</th>
          </tr>
        </thead>
        <tbody>
          {attendanceReport.presentParticipants.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td>{p.userName}</td>
              <td>{p.userEmail}</td>
              <td>{p.isCollaborator ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="print-section-title">Participantes Ausentes</h3>
      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Colaborador</th>
          </tr>
        </thead>
        <tbody>
          {attendanceReport.absentParticipants.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td>{p.userName}</td>
              <td>{p.userEmail}</td>
              <td>{p.isCollaborator ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="print-footer">Impresso por EventSphere</div>
    </div>
  );
}

export default EventAttendancePrintPage;
