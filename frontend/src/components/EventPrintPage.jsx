import React, { useEffect } from 'react';
import '../styles/EventPrintPage.css';

function EventPrintPage({ event, participants }) {
  useEffect(() => {
    window.print();
  }, []);

  if (!event || !participants) return <div>Carregando...</div>;

  return (
    <div className="print-page-container">
      <h1 className="print-title">{event.name}</h1>
      <div className="print-details">
        <div><b>Data:</b> {event.dateFixedStart} {event.timeFixedStart}</div>
        <div><b>Local:</b> {event.localization}</div>
        <div><b>Descrição:</b> {event.description}</div>
      </div>
      <h2 className="print-subtitle">Participantes</h2>
      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>Usuário</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}</td>
              <td>{p.userName}</td>
              <td>{p.userUsername}</td>
              <td>{p.userEmail}</td>
              <td>{p.status === 'CONFIRMED' ? 'Confirmado' : p.status === 'PRESENT' ? 'Presente' : 'Não confirmado'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="print-footer">Impresso por EventSphere</div>
    </div>
  );
}

export default EventPrintPage;
