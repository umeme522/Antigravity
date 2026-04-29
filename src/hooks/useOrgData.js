import { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';

export const useOrgData = () => {
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('org-units');
    const localUnits = saved ? JSON.parse(saved) : [];
    // プログラム側のユニット定義が更新されている場合はそちらを優先（またはマージ）
    if (mockData.units && mockData.units.length > localUnits.length) {
      return mockData.units;
    }
    return localUnits.length > 0 ? localUnits : (mockData.units || []);
  });
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('org-members');
    const localMembers = saved ? JSON.parse(saved) : [];
    
    // キャッシュ問題の解決: 
    // プログラム側のデータ(mockData)の方がメンバー数が多い場合は、自動で最新版を読み込む
    if (mockData.members && mockData.members.length > localMembers.length) {
      console.log('Program data is newer than local storage. Updating...');
      return mockData.members;
    }
    
    return localMembers.length > 0 ? localMembers : (mockData.members || []);
  });

  // データが変更されるたびにブラウザに保存
  useEffect(() => {
    localStorage.setItem('org-units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('org-members', JSON.stringify(members));
  }, [members]);

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
