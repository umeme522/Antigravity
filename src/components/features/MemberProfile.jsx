import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Briefcase, Hash, User, Clock, Award, Plus, Trash2, History, MapPin } from 'lucide-react';

const POSITIONS = [
  '支店長',
  '副支店長',
  '部長',
  '所長',
  '課長',
  '副長',
  '係長',
  'スタッフ'
];

const getPositionColor = (pos) => {
  if (!pos) return '#A0AEC0';
  const p = String(pos);
  if (p.includes('支店長')) return '#FFD700'; 
  if (p.includes('部長')) return '#FF4B4B';   
  if (p.includes('所長') || p.includes('課長')) return '#4B7BFF'; 
  if (p.includes('副長')) return '#FF9500'; 
  if (p.includes('係長')) return '#00E676'; 
  return '#A0AEC0'; 
};

const calculateAge = (birthDate) => {
  if (!birthDate) return '未設定';
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return '無効な日付';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} 歳`;
};

const calculateYearsOfService = (joinYear) => {
  if (!joinYear) return '未設定';
  const currentYear = new Date().getFullYear();
  const year = parseInt(joinYear);
  if (isNaN(year)) return '無効な数値';
  
  const years = currentYear - year;
  return `${Math.max(0, years)} 年`;
};

const MemberProfile = ({ member, unit, units, onUpdate, onDelete, onClose, isPermanent }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(member || {});
  const [showConcurrent, setShowConcurrent] = useState(!!member?.additionalUnitIds?.length);

  useEffect(() => {
    if (!member) return;
    const joinYear = member.joinDate && typeof member.joinDate === 'string' && member.joinDate.includes('-') 
      ? member.joinDate.split('-')[0] 
      : member.joinDate;

    setFormData({ ...member, joinDate: joinYear });
    setIsEditing(member.isNew || false);
    setShowConcurrent(!!member.additionalUnitIds?.length);
  }, [member]);

  if (!member) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConcurrentUnitChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      additionalUnitIds: value ? [value] : []
    }));
  };

  const handleAddCareer = () => {
    setFormData(prev => ({
      ...prev,
      careerHistory: [...(prev.careerHistory || []), { id: `career_${Date.now()}`, period: '', department: '' }]
    }));
  };

  const handleCareerChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      careerHistory: prev.careerHistory.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleRemoveCareer = (id) => {
    setFormData(prev => ({
      ...prev,
      careerHistory: prev.careerHistory.filter(c => c.id !== id)
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, photo: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const dataToSave = { ...formData };
    if (!showConcurrent) {
      delete dataToSave.additionalUnitIds;
      delete dataToSave.additionalPosition;
    }
    onUpdate(dataToSave);
    setIsEditing(false);
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Icon size={18} color="var(--accent-primary)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{value || '-'}</div>
      </div>
    </div>
  );

  const renderUnitOptions = () => {
    const getUnitTree = (parentId = null, level = 0) => {
      let results = [];
      const children = units.filter(u => u.parentId === parentId);
      
      children.forEach(unit => {
        const indent = '\u3000'.repeat(level); 
        results.push(
          <option key={unit.id} value={unit.id} style={{ background: '#1a202c', color: '#ffffff' }}>
            {level > 0 ? `${indent}└─ ${unit.name}` : unit.name}
          </option>
        );
        results = [...results, ...getUnitTree(unit.id, level + 1)];
      });
      return results;
    };
    return getUnitTree();
  };

  const renderYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
      years.push(<option key={y} value={y}>{y}年度</option>);
    }
    return years;
  };

  const roleColor = getPositionColor(member.position);
  const fullName = `${member.lastName || ''} ${member.firstName || ''}`;

  return (
    <motion.div
      initial={isPermanent ? false : { x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
      className={isPermanent ? "profile-panel-permanent" : "profile-panel"}
      style={{
        background: 'rgba(26, 32, 44, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 100000
      }}
    >
      {!isPermanent && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            zIndex: 100
          }}
        >
          <X size={20} />
        </button>
      )}

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: isPermanent ? '0' : '20px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#ffffff' }}>プロフィール編集</h2>
          
          <div className="form-group" style={{ textAlign: 'center' }}>
            <img 
              src={formData.photo} 
              alt="Preview" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: `2px solid ${getPositionColor(formData.position)}` }} 
            />
            <label className="photo-upload-btn" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              写真をアップロード
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>姓</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="edit-input" style={{ color: '#ffffff' }} />
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>名</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className="edit-input" style={{ color: '#ffffff' }} />
            </div>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>役職</label>
              <select name="position" value={formData.position} onChange={handleChange} className="edit-input" style={{ color: '#ffffff', background: '#1a202c' }}>
                <option value="" style={{ background: '#1a202c', color: '#ffffff' }}>選択してください</option>
                {POSITIONS.map(p => <option key={p} value={p} style={{ background: '#1a202c', color: '#ffffff' }}>{p}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label style={{ color: 'var(--text-secondary)' }}>所属部署</label>
              <select name="unitId" value={formData.unitId} onChange={handleChange} className="edit-input" style={{ color: '#ffffff', background: '#1a202c' }}>
                <option value="" style={{ background: '#1a202c', color: '#ffffff' }}>選択してください</option>
                {renderUnitOptions()}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>社員番号</label>
              <input name="employeeId" value={formData.employeeId || ''} onChange={handleChange} className="edit-input" style={{ color: '#ffffff' }} />
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>入社年度</label>
              <select name="joinDate" value={formData.joinDate || ''} onChange={handleChange} className="edit-input" style={{ color: '#ffffff', background: '#1a202c' }}>
                <option value="">選択してください</option>
                {renderYearOptions()}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={handleSave} className="save-btn" style={{ flex: 1 }}>保存</button>
            <button onClick={() => setIsEditing(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer' }}>キャンセル</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={member.photo} 
              alt={fullName} 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${roleColor}`, marginBottom: '12px' }} 
            />
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{fullName}</h2>
            <p style={{ color: roleColor, fontWeight: '700' }}>{member.position}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <InfoRow icon={Briefcase} label="所属部署" value={unit?.name} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InfoRow icon={Hash} label="社員番号" value={member.employeeId} />
              <InfoRow icon={Clock} label="勤続年数" value={calculateYearsOfService(member.joinDate)} />
            </div>
            
            {member.careerHistory && member.careerHistory.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} /> 経歴
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {member.careerHistory.map((c, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--accent-primary)', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{c.period}</div>
                      <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>{c.department}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => setIsEditing(true)}
              className="glass"
              style={{ width: '100%', padding: '12px', background: 'var(--accent-secondary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              プロフィールを編集
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MemberProfile;
