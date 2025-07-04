import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Check, AlertCircle } from 'lucide-react';
import '../styles/calendar.css';

const CalendarAnimation = () => {
  const [step, setStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setStep((prevStep) => (prevStep + 1) % 3);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isHovered]);  return (
    <div 
      style={{
        width: '100%',
        maxWidth: 350,
        height: 350,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 10px 40px rgba(228, 111, 175, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        position: 'relative',
        border: '3px solid #E46FAF',
        overflow: 'hidden',
        flexDirection: 'column',
        transform: isHovered ? 'perspective(1000px) rotateY(0deg) scale(1.02)' : 'perspective(1000px) rotateY(5deg)',
        transition: 'all 0.5s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: 7,
        width: `${(step + 1) * 33.33}%`,
        background: 'linear-gradient(90deg, #E46FAF 0%, #E82E9B 100%)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        transition: 'width 0.7s cubic-bezier(.4,2,.6,1)',
        zIndex: 2,
      }} />      {step === 0 && (
        <motion.div
          className="calendar-container"
          style={{ 
            background: 'none', 
            boxShadow: 'none', 
            width: '90%', 
            maxWidth: 300, 
            height: 300, 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >          <Calendar className="calendar-icon" style={{ color: '#E82E9B', width: 40, height: 40, marginBottom: 8 }} />          <motion.div className="calendar-grid" style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            gap: '2%', 
            marginTop: 6,
            width: '90%',
            maxWidth: '100%'
          }}>
            {Array.from({ length: 30 }, (_, i) => (
              <motion.div
                key={i}
                className={`day-box ${i === 14 ? 'highlight-day' : ''}`}
                style={{
                  width: 24,
                  height: 24,
                  background: i === 14 ? 'linear-gradient(135deg, #E46FAF 60%, #E82E9B 100%)' : '#fce4ef',
                  color: i === 14 ? '#fff' : '#E82E9B',
                  fontWeight: 700,
                  fontSize: 12,
                  border: i === 14 ? '2px solid #E82E9B' : '1px solid #E46FAF',
                  boxShadow: i === 14 ? '0 2px 8px #E46FAF55' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                whileHover={{ scale: 1.13 }}
              >
                {i + 1}
              </motion.div>
            ))}
          </motion.div>
          <div style={{ marginTop: 10, color: '#E46FAF', fontWeight: 600, fontFamily: 'Lexend Deca', fontSize: 15, letterSpacing: 1 }}>Selecione uma data</div>
        </motion.div>
      )}      {step === 1 && (
        <motion.div
          className="confirmation-screen"
          style={{ 
            background: 'none', 
            boxShadow: 'none', 
            width: '90%', 
            maxWidth: 300, 
            height: 300, 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar className="calendar-icon" style={{ color: '#E82E9B', width: 40, height: 40, marginBottom: 8 }} />
          <h3 style={{ color: '#E82E9B', fontWeight: 700, fontFamily: 'Lexend Deca', fontSize: 17, marginBottom: 8, textAlign: 'center' }}>Confirme sua escolha</h3>
          <p style={{ color: '#423742', fontWeight: 600, fontFamily: 'Lexend Deca', fontSize: 15, textAlign: 'center' }}>Data selecionada: <span style={{ color: '#E82E9B' }}>15</span></p>
        </motion.div>
      )}      {step === 2 && (
        <motion.div
          className="event-card"
          style={{ 
            background: 'none', 
            boxShadow: 'none', 
            width: '90%', 
            maxWidth: 300, 
            height: 300, 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="event-title" style={{ color: '#E82E9B', fontWeight: 700, fontFamily: 'Lexend Deca', fontSize: 17, marginBottom: 8, textAlign: 'center' }}>Evento Confirmado</h3>
          <p className="event-detail" style={{ color: '#E82E9B', fontWeight: 600, fontFamily: 'Lexend Deca', fontSize: 15, margin: 0, textAlign: 'center' }}>
            <Clock className="icon" style={{ marginRight: 8, verticalAlign: 'middle' }} /> 10:00 - 12:00
          </p>
          <p className="event-detail" style={{ color: '#E82E9B', fontWeight: 600, fontFamily: 'Lexend Deca', fontSize: 15, margin: 0, textAlign: 'center' }}>
            <MapPin className="icon" style={{ marginRight: 8, verticalAlign: 'middle' }} /> Sala 101
          </p>
          <div className="user-icons" style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
            {Array.from({ length: 3 }, (_, i) => (
              <User key={i} className="user-icon" style={{ width: 24, height: 24, color: '#E82E9B', margin: '0 6px', background: '#fce4ef', borderRadius: '50%', padding: 4, boxShadow: '0px 2px 8px #E46FAF33' }} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CalendarAnimation;