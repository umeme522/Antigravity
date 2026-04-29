import { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';

const STORAGE_KEY = 'antigravity_org_data';

export const useOrgData = () => {
  // Initialize state with a function to merge mockData and localStorage
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.units || mockData.units;
      } catch (e) {
        return mockData.units;
      }
    }
    return mockData.units;
  });
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge mockData members with saved members to ensure new mock members are included
        // while preserving edits to existing members.
        const savedMembers = parsed.members || [];
        const mergedMembers = [...mockData.members];
        
        savedMembers.forEach(savedM => {
          const index = mergedMembers.findIndex(m => m.id === savedM.id);
          if (index !== -1) {
            mergedMembers[index] = savedM;
          } else {
            mergedMembers.push(savedM);
          }
        });
        return mergedMembers;
      } catch (e) {
        return mockData.members;
      }
    }
    return mockData.members;
  });

  // Persist to localStorage whenever units or members change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ units, members }));
  }, [units, members]);

  const updateMember = (updatedMember) => {
    if (!updatedMember) return;
    
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
      careerHistory: [],
      isNew: true
    };
  };

  const resetData = () => {
    if (window.confirm('すべての編集内容を破棄して、初期データに戻しますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      setUnits(mockData.units);
      setMembers(mockData.members);
      window.location.reload();
    }
  };

  return {
    units,
    setUnits,
    members,
    setMembers,
    updateMember,
    createNewMember,
    resetData
  };
};

