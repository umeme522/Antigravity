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
  if (pos.includes('支店長')) return '#FFD700'; // Gold
  if (pos.includes('部長')) return '#FF4B4B';   // Red
  if (pos.includes('所長') || pos.includes('課長')) return '#4B7BFF'; // Blue
  if (pos.includes('副長')) return '#FF9500'; // Orange
  if (pos.includes('係長')) return '#00E676'; // Green
  return '#A0AEC0'; // Gray (Staff)
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
    // Convert date to year string if needed
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
        // インデントをさらに強調 (全角スペースを増やしてズレを大きくする)
        const indent = '\u3000'.repeat(level); 
        results.push(
          <option key={unit.id} value={unit.id} style={{ background: '#1a202c', color: '#ffffff' }}>
            {level > 0 ? `${indent}└ ${unit.name}` : unit.name}
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

            {!showConcurrent && (
              <button 
                onClick={() => setShowConcurrent(true)}
                style={{
                  marginTop: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px dashed rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: 'fit-content'
                }}
              >
                <Plus size={14} /> 兼務を追加
              </button>
            )}
          </div>

          {showConcurrent && (
            <div style={{ border: '1px solid rgba(75, 123, 255, 0.3)', padding: '16px', borderRadius: '12px', background: 'rgba(75, 123, 255, 0.05)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4B7BFF' }}>兼務設定</span>
                <button onClick={() => setShowConcurrent(false)} style={{ background: 'transparent', border: 'none', color: '#FF4B4B', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)' }}>役職 (兼務)</label>
                <select name="additionalPosition" value={formData.additionalPosition || ''} onChange={handleChange} className="edit-input" style={{ color: '#ffffff', background: '#1a202c' }}>
                  <option value="" style={{ background: '#1a202c', color: '#ffffff' }}>選択してください</option>
                  {POSITIONS.map(p => <option key={p} value={p} style={{ background: '#1a202c', color: '#ffffff' }}>{p}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label style={{ color: 'var(--text-secondary)' }}>所属部署 (兼務)</label>
                <select 
                  value={formData.additionalUnitIds?.[0] || ''} 
                  onChange={handleConcurrentUnitChange} 
                  className="edit-input"
                  style={{ color: '#ffffff', background: '#1a202c' }}
                >
                  <option value="" style={{ background: '#1a202c', color: '#ffffff' }}>選択してください</option>
                  {renderUnitOptions()}
                </select>
              </div>
            </div>
          )}

          <div className="form-row-mobile-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>生年月日</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={formData.birthDate?.split('-')[0] || ''} 
                  onChange={(e) => {
                    const parts = (formData.birthDate || '--').split('-');
                    const newDate = `${e.target.value}-${parts[1] || '01'}-${parts[2] || '01'}`;
                    setFormData(prev => ({ ...prev, birthDate: newDate }));
                  }}
                  className="edit-input" 
                  style={{ color: '#ffffff', background: '#1a202c', flex: 2 }}
                >
                  <option value="">年</option>
                  {Array.from({ length: 85 }, (_, i) => 2024 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select 
                  value={formData.birthDate?.split('-')[1] || ''} 
                  onChange={(e) => {
                    const parts = (formData.birthDate || '1990--').split('-');
                    const newDate = `${parts[0] || '1990'}-${e.target.value.padStart(2, '0')}-${parts[2] || '01'}`;
                    setFormData(prev => ({ ...prev, birthDate: newDate }));
                  }}
                  className="edit-input" 
                  style={{ color: '#ffffff', background: '#1a202c', flex: 1 }}
                >
                  <option value="">月</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m.toString().padStart(2, '0')}>{m}</option>
                  ))}
                </select>
                <select 
                  value={formData.birthDate?.split('-')[2] || ''} 
                  onChange={(e) => {
                    const parts = (formData.birthDate || '1990-01-').split('-');
                    const newDate = `${parts[0] || '1990'}-${parts[1] || '01'}-${e.target.value.padStart(2, '0')}`;
                    setFormData(prev => ({ ...prev, birthDate: newDate }));
                  }}
                  className="edit-input" 
                  style={{ color: '#ffffff', background: '#1a202c', flex: 1 }}
                >
                  <option value="">日</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>年齢</label>
              <div className="read-only-field" style={{ color: '#ffffff', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{calculateAge(formData.birthDate)}</div>
            </div>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', marginTop: '12px' }}>
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


          <div className="form-group">
            <label style={{ color: 'var(--text-secondary)' }}>勤続年数</label>
            <div className="read-only-field" style={{ color: '#ffffff' }}>{calculateYearsOfService(formData.joinDate)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>性別</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange} className="edit-input" style={{ color: '#ffffff', background: '#1a202c' }}>
                <option value="">未設定</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ color: 'var(--text-secondary)' }}>出身地</label>
              <input
                name="birthplace"
                value={formData.birthplace || ''}
                onChange={handleChange}
                className="edit-input"
                placeholder="例: 東京都"
                style={{ color: '#ffffff' }}
              />
            </div>
          </div>


          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ color: 'var(--text-secondary)' }}>経歴</label>
              <button onClick={handleAddCareer} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ 追加</button>
            </div>
            {formData.careerHistory?.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input placeholder="期間 (例: 2018-2022)" value={c.period} onChange={(e) => handleCareerChange(c.id, 'period', e.target.value)} className="edit-input" style={{ flex: 1, color: '#ffffff' }} />
                <input placeholder="配属先・役職" value={c.department} onChange={(e) => handleCareerChange(c.id, 'department', e.target.value)} className="edit-input" style={{ flex: 2, color: '#ffffff' }} />
                <button onClick={() => handleRemoveCareer(c.id)} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={handleSave} className="save-btn" style={{ flex: 1 }}>保存</button>
            <button 
              onClick={() => {
                if (window.confirm(`${formData.lastName} ${formData.firstName} さんを削除してもよろしいですか？`)) {
                  onDelete(formData.id);
                }
              }} 
              style={{ 
                marginLeft: 'auto',
                background: 'rgba(255, 75, 75, 0.1)', 
                border: '1px solid #ff4b4b', 
                color: '#ff4b4b',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trash2 size={18} /> 削除
            </button>
          </div>



        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <img 
              src={member.photo} 
              alt={fullName} 
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${roleColor}`, marginBottom: '12px' }} 
            />
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{fullName}</h2>
            <p style={{ color: roleColor, fontWeight: '700' }}>
              {member.position}
              {member.additionalPosition && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}> / {member.additionalPosition}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Briefcase size={18} color="var(--accent-primary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>所属部署</div>
                <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                  {unit?.name}
                  {member.additionalUnitIds?.map(uid => {
                    const extraUnit = units.find(u => u.id === uid);
                    return extraUnit ? ` (兼) ${extraUnit.name}` : '';
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InfoRow icon={Hash} label="社員番号" value={member.employeeId} />
              <InfoRow icon={User} label="性別" value={member.gender} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InfoRow icon={User} label="年齢" value={calculateAge(member.birthDate)} />
              <InfoRow icon={Award} label="役職" value={member.position} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InfoRow icon={Clock} label="勤続年数" value={calculateYearsOfService(member.joinDate)} />
              <InfoRow icon={Calendar} label="入社年度" value={member.joinDate ? `${member.joinDate.toString().split('-')[0]} 年度` : '未設定'} />
            </div>
            {member.birthplace && (
              <InfoRow icon={MapPin} label="出身地" value={member.birthplace} />
            )}
            
            {member.careerHistory && member.careerHistory.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} /> 経歴
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: '5px', bottom: '5px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
                  {member.careerHistory.map((c, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-15px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid #0d1117' }}></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{c.period}</div>
                      <div style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '2px' }}>{c.department}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => setIsEditing(true)}
              className="glass edit-btn-trigger"
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
