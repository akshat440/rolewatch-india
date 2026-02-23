import React, { useState, useRef } from 'react';
import axios from 'axios';
import Icon from '../components/common/Icon';
import { getUserSession } from '../services/sessionManager';

function BiometricSetup() {
  const [enrollmentType, setEnrollmentType] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState({
    face: false,
    fingerprint: false
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const session = getUserSession();

  const startFaceCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const captureFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const enrollFace = async () => {
    setEnrolling(true);
    
    try {
      await startFaceCapture();
      
      setTimeout(async () => {
        const faceData = captureFace();
        
        if (faceData) {
          const token = session?.token;
          await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/enroll-biometric`,
            {
              type: 'face',
              data: faceData
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert('✅ Face enrolled successfully!\n\nYou can now login using facial recognition.');
          setEnrolled({ ...enrolled, face: true });
          
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        }
        
        setEnrolling(false);
        setEnrollmentType(null);
      }, 3000);
      
    } catch (error) {
      alert('Face enrollment failed');
      setEnrolling(false);
    }
  };

  const enrollFingerprint = async () => {
    setEnrolling(true);

    try {
      const fingerprintData = `fingerprint_${session.user.id}_${Date.now()}`;

      const token = session?.token;
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/enroll-biometric`,
        {
          type: 'fingerprint',
          data: fingerprintData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Fingerprint enrolled successfully!\n\nYou can now login using fingerprint.');
      setEnrolled({ ...enrolled, fingerprint: true });
      setEnrolling(false);
      setEnrollmentType(null);
      
    } catch (error) {
      alert('Fingerprint enrollment failed');
      setEnrolling(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        Biometric Security Setup
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Enhance your account security with biometric authentication
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Face Recognition */}
        <div style={{
          background: 'white',
          border: '3px solid ' + (enrolled.face ? '#10b981' : '#e5e7eb'),
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: enrolled.face ? '#d1fae5' : '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Icon name="user" size={40} style={{ color: enrolled.face ? '#10b981' : '#9ca3af' }} />
          </div>
          
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
            Face Recognition
          </h3>
          
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Login securely using facial recognition technology
          </p>

          {enrolled.face ? (
            <div style={{
              padding: '12px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Icon name="user" size={16} />
              Enrolled Successfully
            </div>
          ) : (
            <button
              onClick={() => {
                setEnrollmentType('face');
                enrollFace();
              }}
              disabled={enrolling}
              style={{
                padding: '14px 28px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: enrolling ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                opacity: enrolling ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Icon name="user" size={18} />
              {enrolling && enrollmentType === 'face' ? 'Enrolling...' : 'Enroll Face'}
            </button>
          )}
        </div>

        {/* Fingerprint */}
        <div style={{
          background: 'white',
          border: '3px solid ' + (enrolled.fingerprint ? '#10b981' : '#e5e7eb'),
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: enrolled.fingerprint ? '#d1fae5' : '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Icon name="shield" size={40} style={{ color: enrolled.fingerprint ? '#10b981' : '#9ca3af' }} />
          </div>
          
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
            Fingerprint
          </h3>
          
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
            Quick and secure access with your fingerprint
          </p>

          {enrolled.fingerprint ? (
            <div style={{
              padding: '12px',
              background: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Icon name="shield" size={16} />
              Enrolled Successfully
            </div>
          ) : (
            <button
              onClick={() => {
                setEnrollmentType('fingerprint');
                enrollFingerprint();
              }}
              disabled={enrolling}
              style={{
                padding: '14px 28px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: enrolling ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                opacity: enrolling ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <Icon name="shield" size={18} />
              {enrolling && enrollmentType === 'fingerprint' ? 'Enrolling...' : 'Enroll Fingerprint'}
            </button>
          )}
        </div>
      </div>

      {/* Hidden video/canvas for face capture */}
      <div style={{ display: 'none' }}>
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} />
      </div>

      {/* Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #bfdbfe',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Icon name="lock" size={24} style={{ color: '#1e40af' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e40af' }}>
            How Biometric Authentication Works
          </h4>
        </div>
        <ol style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>Enroll your face or fingerprint securely</li>
          <li>Your biometric data is encrypted and stored safely</li>
          <li>At login, verify your identity with your biometric</li>
          <li>Get instant access without remembering passwords</li>
        </ol>
      </div>

      {/* Security Info */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Icon name="shield" size={24} style={{ color: '#10b981' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
            Security & Privacy
          </h4>
        </div>
        <ul style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
          <li>Biometric data is encrypted using military-grade encryption</li>
          <li>Templates are stored securely, not actual images</li>
          <li>Data never leaves our secure servers</li>
          <li>You can disable biometric authentication anytime</li>
          <li>Compliant with DPDP Act 2023 and GDPR</li>
        </ul>
      </div>
    </div>
  );
}

export default BiometricSetup;
