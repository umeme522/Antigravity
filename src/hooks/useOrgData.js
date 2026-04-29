import { useState, useCallback } from 'react';
import { mockData } from '../data/mockData';

const OWNER = 'umeme522';
const REPO = 'Antigravity';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  const [members, setMembers] = useState(mockData.members || []);
  const [isSaving, setIsSaving] = useState(false);

  // トークンをブラウザに保存して、二度目からは入力を省く
  const [token, setToken] = useState(() => localStorage.getItem('GITHUB_SYNC_TOKEN') || '');

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    let activeToken = token;
    
    if (!activeToken) {
      const input = prompt('GitHubのアクセストークン(ghp_...)を入力してください。一度入力すればこのブラウザが記憶します：');
      if (input) {
        activeToken = input;
        setToken(input);
        localStorage.setItem('GITHUB_SYNC_TOKEN', input);
      } else {
        return;
      }
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
        alert('データを永久保存しました！全員に反映されるまで約1分かかります。');
      } else {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          alert('トークンの認証に失敗しました。もう一度入力し直してください。');
          localStorage.removeItem('GITHUB_SYNC_TOKEN');
          setToken('');
        } else {
          throw new Error(errorData.message || 'Failed to save');
        }
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('保存に失敗しました。ネット接続またはトークンを確認してください。');
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





