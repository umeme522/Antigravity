import { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  
  const [members, setMembers] = useState(mockData.members || []);

  // データの自動保存を停止

  const updateMember = (updatedMember) => {
    if (!updatedMember) return;
    
    // isNewフラグを削除（保存用）
    const memberToSave = { ...updatedMember };
    delete memberToSave.isNew;

    setMembers(prev => {
      const exists = prev.some(m => m.id === memberToSave.id);
      if (exists) {
        return prev.map(m => m.id === memberToSave.id ? memberToSave : m);
      } else {
        return [...prev, memberToSave];
      }
    });
    
    return memberToSave;
  };

  const createNewMember = (defaultUnitId) => {
    return {
      id: `m_new_${Date.now()}`,
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
      isNew: true
    };
  };

  return {
    units,
    setUnits,
    members,
    setMembers,
    updateMember,
    createNewMember
  };
};
