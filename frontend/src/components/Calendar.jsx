import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/calendar.css';
import { useNavigate } from 'react-router-dom';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar({ events = [], onMonthChange }) {
  const today = new Date();
  const navigate = useNavigate();  const [selected, setSelected] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
    open: false
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [isMonthClickArea, setIsMonthClickArea] = useState(false);

  const daysInMonth = getDaysInMonth(selected.year, selected.month);
  const firstDay = getFirstDayOfWeek(selected.year, selected.month);

  const weeks = [];
  let week = new Array(7).fill(null);
  let day = 1;
  for (let i = 0; i < firstDay; i++) week[i] = null;
  for (let i = firstDay; day <= daysInMonth; i++) {
    week[i] = day;
    day++;
    if (i === 6 || day > daysInMonth) {
      weeks.push(week);
      week = new Array(7).fill(null);
      i = -1;
    }
  }

  
  const eventMap = {};
  
  events.forEach(ev => {
    const rawDate = ev.dateFixedStart || ev.dateStart || '';
    let dateStr = '';
    
    if (rawDate) {
      if (typeof rawDate === 'string') {
        dateStr = rawDate.slice(0, 10);
      } else if (Array.isArray(rawDate) && rawDate.length >= 3) {
        const [year, month, day] = rawDate;
        dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
    
    if (dateStr) {
      const d = new Date(dateStr + 'T12:00:00');
      
      if (!isNaN(d.getTime()) && d.getFullYear() === selected.year && d.getMonth() === selected.month) {
        const day = d.getDate();
        if (!eventMap[day]) eventMap[day] = [];
        eventMap[day].push(ev);
      }
    }
  });

  function handleMonthChange(delta) {
    let m = selected.month + delta;
    let y = selected.year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelected(s => ({ ...s, month: m, year: y }));
    if (onMonthChange) onMonthChange(y, m);
  }  function handleOpen(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const isCalendarMonthElement = e.target.classList.contains('calendar-month') || 
                                   e.target.closest('.calendar-month');
    
    if (isCalendarMonthElement && isMonthClickArea) {
      setSelected(s => ({ ...s, open: !s.open }));
    }
  }

  function handleMonthMouseEnter(e) {
    setIsMonthClickArea(true);
  }

  function handleMonthMouseLeave(e) {
    setTimeout(() => setIsMonthClickArea(false), 100);
  }

  function handleCloseExpanded() {
    setSelected(s => ({ ...s, open: false }));
    setIsMonthClickArea(false);
  }
  function handleSelectMonth(y, m) {
    setSelected(s => ({ ...s, year: y, month: m, open: false }));
    if (onMonthChange) onMonthChange(y, m);
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    
    let d;
    
    if (Array.isArray(dateString) && dateString.length >= 3) {
      const [year, month, day] = dateString;
      d = new Date(year, month - 1, day);
    } else if (typeof dateString === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        d = new Date(dateString + 'T12:00:00');
      } else {
        d = new Date(dateString);
      }
    } else {
      d = new Date(dateString);
    }
    
    if (isNaN(d.getTime())) {
      return 'Data inválida';
    }
    
    return d.toLocaleDateString('pt-BR');
  };

  
  function handleDayClick(day) {
    if (day && eventMap[day] && eventMap[day].length > 0) {
      setDayEvents(eventMap[day]);
      setSelectedDay(day);
    }
  }

  function handleEventClick(event, e) {
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  }

  function handleCloseEventModal() {
    setSelectedDay(null);
    setDayEvents([]);
  }  function renderDayEventsModal() {
    const modalContent = (
      <div className="calendar-events-modal" onClick={handleCloseEventModal}>
        <div className="calendar-events-container" onClick={e => e.stopPropagation()}>
          <div className="calendar-events-header">
            <h3>Eventos do dia {selectedDay} de {monthNames[selected.month]}</h3>
            <button className="calendar-events-close" onClick={handleCloseEventModal}>×</button>
          </div>
          <div className="calendar-events-list">
            {dayEvents.map((event, index) => (
              <div 
                key={index} 
                className={`calendar-event-item ${event.acess === 'PUBLIC' ? 'event-public' : 'event-private'}`}
                onClick={(e) => handleEventClick(event, e)}
              >
                <div className="event-item-title">{event.name}</div>
                <div className="event-item-date">{formatDate(event.dateFixedStart || event.dateStart)}</div>
                <div className="event-item-info">
                  {(event.localization || event.local) && <div className="event-item-local">Local: {event.localization || event.local}</div>}
                  {event.description && <div className="event-item-description">{event.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }

  function renderExpanded() {
    const currentYear = today.getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
    
    const modalContent = (
      <div className="calendar-expanded-modal" onClick={handleCloseExpanded}>
        <div className="calendar-expanded" onClick={e => e.stopPropagation()}>
          <div className="calendar-expanded-header">
            <button onClick={() => handleMonthChange(-1)} disabled={selected.year === currentYear && selected.month === 0}>{'<'}</button>
            <span>{monthNames[selected.month]} {selected.year}</span>
            <button onClick={() => handleMonthChange(1)}>{'>'}</button>
            <button className="calendar-expanded-close" onClick={handleCloseExpanded}>×</button>
          </div>
          <div className="calendar-expanded-grid">
            {Array.from({ length: 12 }).map((_, m) => (
              <div
                key={m}
                className={m === selected.month ? 'calendar-expanded-month selected' : 'calendar-expanded-month'}
                onClick={() => handleSelectMonth(selected.year, m)}
                style={selected.year === currentYear && m < today.getMonth() ? { opacity: 0.4, pointerEvents: 'none', cursor: 'not-allowed' } : {}}
              >
                {monthNames[m]}
              </div>
            ))}
            <div className="calendar-expanded-year-select-wrapper">
              <select
                className="calendar-expanded-year-select"
                value={selected.year}
                onChange={e => handleSelectMonth(Number(e.target.value), selected.month)}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }

  return (
    <div 
      className="calendar-container glass-card" 
      onClick={(e) => {
        e.stopPropagation();
        
        const isCalendarMonth = e.target.classList.contains('calendar-month') || 
                               e.target.closest('.calendar-month');
        if (!isCalendarMonth) {
          
        }
      }}
      onMouseLeave={() => {
        setIsMonthClickArea(false);
      }}
      style={{ isolation: 'isolate' }}
    >
      <div className="calendar-header-wrapper">
        <div className="calendar-title">
          <span>CALENDÁRIO</span>
        </div>
        <div className="calendar-header">
          <button className="calendar-arrow" onClick={() => handleMonthChange(-1)}>{'<'}</button>
          <span 
            className="calendar-month" 
            onClick={handleOpen} 
            onMouseEnter={handleMonthMouseEnter}
            onMouseLeave={handleMonthMouseLeave}
            style={{ cursor: 'pointer', zIndex: 2, position: 'relative' }}
          >
            {monthNames[selected.month]} {selected.year}
          </span>
          <button className="calendar-arrow" onClick={() => handleMonthChange(1)}>{'>'}</button>
        </div>
      </div>
      <table className="calendar-table">
        <thead>
          <tr>
            <th>DOM</th><th>SEG</th><th>TER</th><th>QUA</th><th>QUI</th><th>SEX</th><th>SÁB</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                const isPastDay = d && (
                  selected.year < today.getFullYear() ||
                  (selected.year === today.getFullYear() && selected.month < today.getMonth()) ||
                  (selected.year === today.getFullYear() && selected.month === today.getMonth() && d < today.getDate())
                );
                
                let className = '';
                if (d && eventMap[d]) {
                  className = eventMap[d].some(ev => ev.acess === 'PUBLIC') ? 'calendar-public' : 'calendar-private';
                }
                if (isPastDay) {
                  className += ' calendar-past-day';
                }
                
                return (
                  <td 
                    key={j} 
                    className={className}
                    onClick={() => handleDayClick(d)}
                    style={isPastDay ? { opacity: 0.6 } : {}}
                  >
                    {d}
                    {d && eventMap[d] && <span className="calendar-dot" title={eventMap[d].map(ev => ev.name).join(', ')}></span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {selected.open && renderExpanded()}
      {selectedDay && renderDayEventsModal()}
    </div>
  );
}
