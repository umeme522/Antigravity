export const mockData = {
  units: [
    { id: "u1", name: "東日本支店", parentId: null },
    { id: "u_hq_soumu", name: "支店総務部", parentId: "u1" },
    { id: "u_hq_innovation", name: "営業革新部", parentId: "u1" },
    { id: "u_dept1", name: "業務1部", parentId: "u1" },
    { id: "u_musashino", name: "武蔵野", parentId: "u_dept1" },
    { id: "u_azumino", name: "安曇野", parentId: "u_dept1" },
    { id: "u_fujimi", name: "富士見", parentId: "u_dept1" },
    { id: "u_hakushu", name: "白州", parentId: "u_dept1" },
    { id: "u_hakushu_water", name: "白州水", parentId: "u_dept1" },
    { id: "u_minamitama", name: "南多摩", parentId: "u_dept1" },
    { id: "u_dept2", name: "業務2部", parentId: "u1" },
    { id: "u_tochi_kita", name: "栃木北", parentId: "u_dept2" },
    { id: "u_tochi", name: "栃木", parentId: "u_dept2" },
    { id: "u_hanyu", name: "羽生とちぎ", parentId: "u_dept2" },
    { id: "u_gunma", name: "群馬", parentId: "u_dept2" },
    { id: "u_shibu", name: "渋川", parentId: "u_dept2" },
    { id: "u_tone", name: "利根川", parentId: "u_dept2" },
    { id: "u_fujioka", name: "群馬藤岡", parentId: "u_dept2" },
    { id: "u_dept3", name: "業務3部", parentId: "u1" },
    { id: "u_ebina", name: "海老名流通", parentId: "u_dept3" },
    { id: "u_kitakanto", name: "北関東流通", parentId: "u_dept3" },
    { id: "u_ayase", name: "神奈川綾瀬", parentId: "u_dept3" },
    { id: "u_kunitachi", name: "国立流通", parentId: "u_dept3" },
    { id: "u_ome", name: "青梅流通", parentId: "u_dept3" }
  ],
  members: [
    // --- 東日本支店 直下 ---
    { 
      id: "m_okubo", 
      lastName: "大久保", 
      firstName: "祐介", 
      position: "支店長 兼 営業革新部長", 
      unitId: "u1", 
      additionalUnitIds: ["u_hq_innovation"], 
      photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Okubo", 
      employeeId: "", 
      gender: "男性" 
    },
    { id: "m_horiuchi", lastName: "堀内", firstName: "芳人", position: "副支店長", unitId: "u1", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Horiuchi", employeeId: "", joinDate: "2001", birthDate: "1979-02-02", birthplace: "静岡県磐田市", gender: "男性" },
    
    // --- 支店総務部 ---
    { id: "m_matsumura", lastName: "松村", firstName: "結花", position: "課長", unitId: "u_hq_soumu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Matsumura", employeeId: "", gender: "女性" },
    { id: "m_inoue", lastName: "井上", firstName: "珠美", position: "係長", unitId: "u_hq_soumu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Inoue", employeeId: "", joinDate: "2017", gender: "女性" },
    { id: "m_kitaura", lastName: "北浦", firstName: "愛梨", position: "スタッフ", unitId: "u_hq_soumu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kitaura", employeeId: "", joinDate: "2024", gender: "女性" },
    
    // --- 営業革新部 ---
    { id: "m_kiuchi", lastName: "木内", firstName: "博崇", position: "係長", unitId: "u_hq_innovation", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kiuchi", employeeId: "", gender: "男性" },

    // --- 業務1部 ---
    { id: "m_nishihara", lastName: "西原", firstName: "達也", position: "部長", unitId: "u_dept1", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nishihara", employeeId: "", gender: "男性" },
    
    // 武蔵野
    { id: "m_mera", lastName: "米良", firstName: "真拓", position: "所長", unitId: "u_musashino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Mera", employeeId: "", gender: "男性" },
    { id: "m_nakane", lastName: "中根", firstName: "寛哉", position: "係長", unitId: "u_musashino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nakane", employeeId: "", joinDate: "2018", gender: "男性" },
    { id: "m_toshida", lastName: "土志田", firstName: "知明", position: "スタッフ", unitId: "u_musashino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Toshida", employeeId: "", joinDate: "2024", gender: "男性" },
    
    // 安曇野
    { id: "m_suzuki_h", lastName: "鈴木", firstName: "秀和", position: "所長", unitId: "u_azumino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=SuzukiH", employeeId: "", gender: "男性" },
    { id: "m_miyake", lastName: "三宅", firstName: "菜央", position: "スタッフ", unitId: "u_azumino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Miyake", employeeId: "", joinDate: "2024", gender: "女性" },
    { id: "m_yamagata", lastName: "山縣", firstName: "和奈", position: "スタッフ", unitId: "u_azumino", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Yamagata", employeeId: "", joinDate: "2021", gender: "男性" },
    
    // 富士見
    { id: "m_asari", lastName: "浅利", firstName: "順一", position: "所長", unitId: "u_fujimi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Asari", employeeId: "", gender: "男性" },
    { id: "m_mikami", lastName: "三上", firstName: "俊", position: "副長", unitId: "u_fujimi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Mikami", employeeId: "", gender: "男性" },
    
    // 白州
    { id: "m_mitsui", lastName: "三井", firstName: "快", position: "所長", unitId: "u_hakushu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Mitsui", employeeId: "", gender: "男性" },
    
    // 白州水
    { id: "m_magami", lastName: "真上", firstName: "将生", position: "所長", unitId: "u_hakushu_water", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Magami", employeeId: "", gender: "男性" },
    { id: "m_suzuki_d", lastName: "鈴木", firstName: "大貴", position: "係長", unitId: "u_hakushu_water", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=SuzukiD", employeeId: "", gender: "男性" },
    { id: "m_endo", lastName: "遠藤", firstName: "聖人", position: "スタッフ", unitId: "u_hakushu_water", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Endo", employeeId: "", joinDate: "2021", gender: "男性" },
    
    // 南多摩
    { id: "m_takishita", lastName: "滝下", firstName: "直樹", position: "所長", unitId: "u_minamitama", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Takishita", employeeId: "", gender: "男性" },
    { id: "m_nakamaru", lastName: "中丸", firstName: "大樹", position: "スタッフ", unitId: "u_minamitama", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nakamaru", employeeId: "", joinDate: "2024", gender: "男性" },

    // --- 業務2部 ---
    { id: "m_fujiwara", lastName: "藤原", firstName: "邦康", position: "部長", unitId: "u_dept2", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Fujiwara", employeeId: "3239", gender: "男性" },
    
    // 栃木北
    { id: "m_negishi", lastName: "根岸", firstName: "一雄", position: "所長", unitId: "u_tochi_kita", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Negishi2", employeeId: "", gender: "男性" },
    
    // 栃木
    { id: "m_murai", lastName: "村井", firstName: "拳", position: "所長", unitId: "u_tochi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Murai2", employeeId: "", gender: "男性" },
    { id: "m_umehara", lastName: "梅原", firstName: "裕太郎", position: "係長", unitId: "u_tochi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Umehara2", employeeId: "3966", joinDate: "2018", gender: "男性" },
    { id: "m_ichikawa", lastName: "市川", firstName: "輝", position: "スタッフ", unitId: "u_tochi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Ichikawa2", employeeId: "", joinDate: "2024", gender: "女性" },
    
    // 羽生とちぎ
    { id: "m_miki", lastName: "三喜", firstName: "康孝", position: "所長", unitId: "u_hanyu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Miki2", employeeId: "", gender: "男性" },
    { id: "m_wachie", lastName: "輪千", firstName: "雄一", position: "係長", unitId: "u_hanyu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Wachi", employeeId: "", gender: "男性" },
    
    // 群馬
    { id: "m_ueno", lastName: "植野", firstName: "明寛", position: "所長", unitId: "u_gunma", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Ueno", employeeId: "", gender: "男性" },
    { id: "m_kito", lastName: "鬼頭", firstName: "嵩弥", position: "スタッフ", unitId: "u_gunma", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kito", employeeId: "", joinDate: "2019", gender: "男性" },
    
    // 渋川
    { id: "m_hiroyama", lastName: "弘山", firstName: "舜", position: "所長", unitId: "u_shibu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Hiroyama", employeeId: "", gender: "男性" },
    { id: "m_idezawa", lastName: "出澤", firstName: "草併", position: "副長", unitId: "u_shibu", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Idezawa", employeeId: "", gender: "男性" },
    
    // 利根川
    { id: "m_kataoka", lastName: "片岡", firstName: "勇貴", position: "所長", unitId: "u_tone", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kataoka", employeeId: "", gender: "男性" },
    { id: "m_maezawa", lastName: "前澤", firstName: "ちひろ", position: "係長", unitId: "u_tone", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Maezawa", employeeId: "", joinDate: "2018", gender: "女性" },
    { id: "m_shinyashiki", lastName: "新屋敷", firstName: "尚也", position: "スタッフ", unitId: "u_tone", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Shinyashiki", employeeId: "", joinDate: "2020", gender: "男性" },
    { id: "m_ohara", lastName: "大原", firstName: "健太郎", position: "スタッフ", unitId: "u_tone", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Ohara", employeeId: "", joinDate: "2025", gender: "男性" },
    
    // 群馬藤岡
    { id: "m_nishimoto", lastName: "西本", firstName: "幸佑", position: "所長", unitId: "u_fujioka", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nishimoto", employeeId: "", gender: "男性" },
    { id: "m_watanabe_y", lastName: "渡辺", firstName: "洋治郎", position: "副長", unitId: "u_fujioka", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=WatanabeY", employeeId: "", gender: "男性" },
    { id: "m_fujita", lastName: "藤田", firstName: "里", position: "スタッフ", unitId: "u_fujioka", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Fujita", employeeId: "", joinDate: "2020", gender: "男性" },
    
    // --- 業務3部 ---
    // 海老名流通
    { id: "m_nishihata", lastName: "西畑", firstName: "匡績", position: "所長", unitId: "u_ebina", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nishihata", employeeId: "", gender: "男性" },
    { id: "m_nose", lastName: "能勢", firstName: "未来", position: "スタッフ", unitId: "u_ebina", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nose", employeeId: "", gender: "男性" },
    
    // 北関東流通
    { id: "m_kawai", lastName: "川井", firstName: "邦彦", position: "所長", unitId: "u_kitakanto", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kawai", employeeId: "", gender: "男性" },
    { id: "m_ikeda", lastName: "池田", firstName: "和哉", position: "副長", unitId: "u_kitakanto", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Ikeda", employeeId: "", joinDate: "2016", gender: "男性" },
    { id: "m_nakahara", lastName: "中原", firstName: "由貴", position: "副長", unitId: "u_kitakanto", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Nakahara", employeeId: "", gender: "男性" },
    { id: "m_hara_k", lastName: "原", firstName: "一真", position: "スタッフ", unitId: "u_kitakanto", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=HaraK", employeeId: "", joinDate: "2025", gender: "男性" },
    { id: "m_sato_k", lastName: "佐藤", firstName: "樹希亜", position: "スタッフ", unitId: "u_kitakanto", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=SatoK", employeeId: "", joinDate: "2020", gender: "男性" },
    
    // 神奈川綾瀬
    { id: "m_otomo", lastName: "大友", firstName: "俊也", position: "所長", unitId: "u_ayase", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Otomo", employeeId: "" , gender: "男性" },
    { id: "m_taira", lastName: "平良", firstName: "一和", position: "スタッフ", unitId: "u_ayase", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Taira", employeeId: "", joinDate: "2020", gender: "男性" },
    
    // 国立流通
    { id: "m_yasuda", lastName: "安田", firstName: "忠愛", position: "所長", unitId: "u_kunitachi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Yasuda", employeeId: "" , gender: "男性" },
    { id: "m_kurishima", lastName: "栗嶋", firstName: "龍作", position: "副長", unitId: "u_kunitachi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kurishima", employeeId: "" , gender: "男性" },
    { id: "m_tajiri", lastName: "田尻", firstName: "泰悠", position: "係長", unitId: "u_kunitachi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Tajiri", employeeId: "", joinDate: "2018", gender: "男性" },
    { id: "m_seki", lastName: "関", firstName: "晋汰", position: "スタッフ", unitId: "u_kunitachi", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Seki", employeeId: "", joinDate: "2021", gender: "男性" },
    
    // 青梅流通
    { id: "m_hara_p", lastName: "原", firstName: "翔平", position: "所長", unitId: "u_ome", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=HaraP", employeeId: "" , gender: "男性" },
    { id: "m_kishikawa", lastName: "岸川", firstName: "陽平", position: "係長", unitId: "u_ome", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Kishikawa", employeeId: "", joinDate: "2017", gender: "男性" },
    { id: "m_onishi", lastName: "大西", firstName: "和哉", position: "スタッフ", unitId: "u_ome", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Onishi", employeeId: "", joinDate: "2025", gender: "男性" },
    { id: "m_fujii", lastName: "藤井", firstName: "壮也", position: "スタッフ", unitId: "u_ome", photo: "https://api.dicebear.com/7.x/identicon/svg?seed=Fujii", employeeId: "", gender: "男性" }
  ]
};
