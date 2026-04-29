import { useState, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData';

const STORAGE_KEY = 'antigravity_org_data';
const OWNER = 'umeme522';
const REPO = 'Antigravity';

export const useOrgData = () => {
  // ブラウザの保存データとmockDataを統合して初期化
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.units || mockData.units;
      } catch (e) { return mockData.units; }
    }
    return mockData.units;
  });
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedMembers = parsed.members || [];
        const mergedMembers = [...mockData.members];
        
        savedMembers.forEach(savedM => {
          const index = mergedMembers.findIndex(m => m.id === savedM.id);
          if (index !== -1) { mergedMembers[index] = savedM; }
          else { mergedMembers.push(savedM); }
        });
        return mergedMembers;
      } catch (e) { return mockData.members; }
    }
    return mockData.members;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('GITHUB_SYNC_TOKEN') || '');

  // 変更があるたびにブラウザに一時保存（リロード対策）
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ units, members }));
  }, [units, members]);

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    let activeToken = token;
    if (!activeToken) {
      const input = prompt('GitHubのアクセストークンを入力してください（一度のみ）：');
      if (input) {
        activeToken = input;
        setToken(input);
        localStorage.setItem('GITHUB_SYNC_TOKEN', input);
      } else return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${activeToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'update-data',
          client_payload: {
            data: JSON.stringify({ units: currentUnits, members: currentMembers }, null, 2)
          }
        })
      });

      if (response.ok) {
        alert('データを永久保存しました！全員に反映されるまで約1分かかりますが、このブラウザでは今すぐ確認できます。');
      } else {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          alert('認証に失敗しました。トークンを再入力してください。');
          localStorage.removeItem('GITHUB_SYNC_TOKEN');
          setToken('');
        }
      }
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  }, [token]);

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
      lastName: '', firstName: '', reading: '', position: '',
      unitId: defaultUnitId || '',
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      birthDate: '', joinDate: new Date().getFullYear().toString(),
      employeeId: '', birthplace: '', careerHistory: [], isNew: true
    };
  };

  return { units, members, updateMember, createNewMember, isSaving };
};






