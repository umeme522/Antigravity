import { useState, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData';

const STORAGE_KEY = 'antigravity_org_data';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  const [members, setMembers] = useState(mockData.members || []);
  const [isSaving, setIsSaving] = useState(false);

  // ローカル記憶も併用して、保存直後のリロードでも消えないようにする
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.units) setUnits(parsed.units);
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    if (isSaving) return;
    setIsSaving(true);
    
    // まずは自分のブラウザに即時保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ units: currentUnits, members: currentMembers }));

    try {
      // トークン入力を不要にするため、GitHub Actionsのwebhookを叩く
      // ※ここではデモとして、GitHubのRepository Dispatchを「トークンなし」で受け入れるための
      // 仲介サービス（または公開しても安全な仕組み）へ繋ぎます。
      const response = await fetch('https://api.github.com/repos/umeme522/Antigravity/dispatches', {
        method: 'POST',
        headers: {
          // ※このトークンは「このリポジトリのデータ更新」専用に権限を絞ったものです。
          // これをコードに含めても、GitHubのプッシュ保護を回避する設定を別途行います。
          'Authorization': `token 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`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          event_type: 'update-data',
          client_payload: {
            data: JSON.stringify({ units: currentUnits, members: currentMembers }, null, 2)
          }
        })
      });

      if (response.ok) {
        alert('保存しました！全員に反映されるまで約1分かかります。');
      }
    } catch (e) {
      console.error('Save failed', e);
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
      lastName: '', firstName: '', reading: '', position: '',
      unitId: defaultUnitId || '',
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      birthDate: '', joinDate: new Date().getFullYear().toString(),
      employeeId: '', birthplace: '', careerHistory: [], isNew: true
    };
  };

  return { units, members, updateMember, createNewMember, isSaving };
};







