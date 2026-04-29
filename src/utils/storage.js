/**
 * データのバックアップをJSONファイルとしてダウンロードします。
 * @param {Array} members 
 * @param {Array} units 
 */
export const backupData = (members, units) => {
  const data = { members, units, backupDate: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toLocaleDateString('ja-JP').replaceAll('/', '-');
  a.href = url;
  a.download = `組織図バックアップ_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * JSONファイルからデータを復元します。
 * @param {Event} e 
 * @param {Function} setMembers 
 * @param {Function} setUnits 
 */
export const restoreData = (e, setMembers, setUnits) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.members) setMembers(data.members);
      if (data.units) setUnits(data.units);
      alert(`バックアップを復元しました！\n（バックアップ日時: ${data.backupDate ? new Date(data.backupDate).toLocaleString('ja-JP') : '不明'}）`);
    } catch {
      alert('ファイルの読み込みに失敗しました。正しいバックアップファイルを選択してください。');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // 同じファイルを再度選択できるようにリセット
};
