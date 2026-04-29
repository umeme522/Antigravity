import { useState, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData';

const STORAGE_KEY = 'antigravity_org_data';
const OWNER = 'umeme522';
const REPO = 'Antigravity';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  const [members, setMembers] = useState(mockData.members || []);
  const [isSaving, setIsSaving] = useState(false);

  // GitHub上のトークンを使用するため、ここでは空にします（ブラウザのコンソール等で一度だけ設定する運用も可能です）
  // もしくは、GitHub ActionsのPATを使用して repository_dispatch を送ります。
  const [token, setToken] = useState(() => localStorage.getItem('GITHUB_PAT') || '');

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    if (!token) {
      const input = prompt('GitHubのアクセストークン(PAT)を入力してください（一度入力すれば保存されます）:');
      if (input) {
        setToken(input);
        localStorage.setItem('GITHUB_PAT', input);
      } else {
        return;
      }
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
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
        alert('保存リクエストを送信しました！約1〜2分で全員に反映されます。');
      } else {
        throw new Error('Failed to send update request');
      }
    } catch (e) {
      console.error('Save failed:', e);
      alert('保存に失敗しました。トークンが正しいか確認してください。');
      localStorage.removeItem('GITHUB_PAT');
      setToken('');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, token]);

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



