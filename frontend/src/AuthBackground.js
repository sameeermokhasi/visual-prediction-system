import React from 'react';
import './AuthBackground.css';
import { GiMetalBar, GiGearHammer, GiMetalDisc } from 'react-icons/gi';

const AuthBackground = () => {
  return (
    <div className="floating-bg">
      <GiMetalBar className="floating-object" style={{ top: '10%', left: '10%', fontSize: '5rem', animationDelay: '0s' }} />
      <GiGearHammer className="floating-object" style={{ top: '20%', left: '80%', fontSize: '7rem', animationDelay: '1s' }} />
      <GiMetalDisc className="floating-object" style={{ top: '70%', left: '20%', fontSize: '6rem', animationDelay: '2s' }} />
      <GiMetalBar className="floating-object" style={{ top: '80%', left: '70%', fontSize: '4rem', animationDelay: '3s' }} />
      <GiGearHammer className="floating-object" style={{ top: '40%', left: '40%', fontSize: '8rem', animationDelay: '4s' }} />
      <div className="light" style={{ top: '0%', left: '0%' }} />
      <div className="light" style={{ top: '50%', left: '50%' }} />
    </div>
  );
};

export default AuthBackground;
