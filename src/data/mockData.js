export const mockData = {
  units: [
    { id: "u1", name: "東日本支店", parentId: null },
    { id: "u_dept2", name: "業務一部", parentId: "u1" },
    { id: "u_tochi_kita", name: "栃木北", parentId: "u_dept2" },
    { id: "u_tochi", name: "栃木", parentId: "u_dept2" },
    { id: "u_hanyu", name: "羽生とちぎ", parentId: "u_dept2" },
    { id: "u_gunma", name: "群馬", parentId: "u_dept2" },
    { id: "u_shibu", name: "渋川", parentId: "u_dept2" },
    { id: "u_tone", name: "利根川", parentId: "u_dept2" },
    { id: "u_fujioka", name: "群馬藤岡", parentId: "u_dept2" },
    { id: "u_dept3", name: "業務二部", parentId: "u1" },
    { id: "u_ebina", name: "海老名海老", parentId: "u_dept3" }
  ],
  members: [
    {
      id: "m_dept2_chief",
      lastName: "佐藤",
      firstName: "健太",
      position: "部長",
      unitId: "u_dept2",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Sato",
      employeeId: "10000"
    },
    {
      id: "m1",
      lastName: "根岸",
      firstName: "一雄",
      position: "所長",
      unitId: "u_tochi_kita",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Negishi",
      employeeId: "10001"
    },
    {
      id: "m2",
      lastName: "村井",
      firstName: "拳",
      position: "所長",
      unitId: "u_tochi",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Murai",
      employeeId: "10002"
    },
    {
      id: "m3",
      lastName: "三喜",
      firstName: "康孝",
      position: "所長",
      unitId: "u_hanyu",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Miki",
      employeeId: "10003"
    },
    {
      id: "m4",
      lastName: "梅原",
      firstName: "裕太郎",
      position: "係長",
      unitId: "u_tochi",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Umehara",
      employeeId: "10004"
    },
    {
      id: "m5",
      lastName: "市川",
      firstName: "輝",
      position: "スタッフ",
      unitId: "u_tochi",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Ichikawa",
      employeeId: "10005"
    },
    {
      id: "m6",
      lastName: "大久保",
      firstName: "祐介",
      position: "所長",
      unitId: "u_gunma",
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Okubo",
      employeeId: "10006"
    }
  ]
};
