import { useState, useCallback } from 'react';
import { mockData } from '../data/mockData';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  const [members, setMembers] = useState(mockData.members || []);
  const [isSaving, setIsSaving] = useState(false);

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 画面からローカルの同期サーバー（私）にデータを送る
      const response = await fetch('http://localhost:3001/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: JSON.stringify({ units: currentUnits, members: currentMembers }, null, 2)
        })
      });

      if (response.ok) {
        alert('データを永久保存しました！全員の画面に自動的に反映されます。');
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      console.error('Save failed:', e);
      alert('保存に失敗しました。ローカルサーバーが起動しているか確認してください。');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  const updateMember = (updatedMember) => {
    if (!updatedMember) return;
    const memberToSave = { ...updatedMember };
    delete memberToSave.isNew;

    setMembers(prev => {
      const newMembers = prev.some(m => m.id === memberToSave.id)
        ? prev.map(m => m.id === memberToSave.id ? memberToSave : m)
        : [...prev, memberToSave];
      
      saveToGitHub(units, newMembers);
      return newMembers;
    });
    
    return memberToSave;
  };

  const createNewMember = (defaultUnitId) => {
    return {
      id: `m_${Date.now()}`,
      lastName: '',
      firstName: '',
      reading: '',
      position: '',
      unitId: defaultUnitId || '',
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      birthDate: '',
      joinDate: new Date().getFullYear().toString(),
      employeeId: '',
      birthplace: '',
      careerHistory: [],
      isNew: true
    };
  };

  return {
    units,
    members,
    updateMember,
    createNewMember,
    isSaving
  };
};




