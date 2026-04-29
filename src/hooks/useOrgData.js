import { useState, useEffect, useCallback } from 'react';
import { mockData } from '../data/mockData';

const STORAGE_KEY = 'antigravity_org_data';
// 取得したトークン（※実際の実装では環境変数や安全な手段で管理しますが、今回はご要望の自動化のためここに定義します）
const GITHUB_TOKEN = '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'; 
const OWNER = 'umeme522';
const REPO = 'Antigravity';
const FILE_PATH = 'src/data/mockData.js';

export const useOrgData = () => {
  const [units, setUnits] = useState(mockData.units || []);
  const [members, setMembers] = useState(mockData.members || []);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // 初回読み込み時に最新データを強制取得（キャッシュ対策）
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // GitHubから直接最新のファイルを取得
        const response = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE_PATH}?t=${Date.now()}`);
        if (response.ok) {
          const content = await response.text();
          // JSファイルからオブジェクトを抽出（簡易的な実装）
          const match = content.match(/export const mockData = ([\s\S]*?);/);
          if (match) {
            // 安全に評価するために Function を使用（※本来はAPIからJSONで取得するのが理想）
            const data = new Function(`return ${match[1]}`)();
            if (data.units) setUnits(data.units);
            if (data.members) setMembers(data.members);
            setLastSynced(new Date());
          }
        }
      } catch (e) {
        console.error('Failed to fetch latest data:', e);
      }
    };
    fetchLatestData();
  }, []);

  const saveToGitHub = useCallback(async (currentUnits, currentMembers) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. 最新のファイルのSHAを取得（更新に必要）
      const getFileResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      const fileData = await getFileResponse.json();
      const sha = fileData.sha;

      // 2. 新しいファイル内容を作成
      const newContent = `export const mockData = ${JSON.stringify({ units: currentUnits, members: currentMembers }, null, 2)};`;
      const encodedContent = btoa(unescape(encodeURIComponent(newContent)));

      // 3. GitHubを更新
      const updateResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Data update from web interface',
          content: encodedContent,
          sha: sha
        })
      });

      if (updateResponse.ok) {
        console.log('GitHub updated successfully');
        setLastSynced(new Date());
        alert('データを永久保存しました！全員に反映されるまで数分かかります。');
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error('Save failed:', e);
      alert('保存に失敗しました。ネット接続を確認してください。');
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
      
      // 自動保存（GitHubへ）
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
    isSaving,
    lastSynced
  };
};


