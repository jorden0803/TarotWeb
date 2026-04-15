const EXTS   = ['webp', 'jpg', 'jpeg', 'png', 'gif']
const CARD_W = 60

const CARDS = [
  // Major Arcana
  {id:'0',  en:'The Fool',           zh:'愚者'},
  {id:'1',  en:'The Magician',       zh:'魔術師'},
  {id:'2',  en:'The High Priestess', zh:'女祭司'},
  {id:'3',  en:'The Empress',        zh:'女皇'},
  {id:'4',  en:'The Emperor',        zh:'皇帝'},
  {id:'5',  en:'The Hierophant',     zh:'教皇'},
  {id:'6',  en:'The Lovers',         zh:'戀人'},
  {id:'7',  en:'The Chariot',        zh:'戰車'},
  {id:'8',  en:'Strength',           zh:'力量'},
  {id:'9',  en:'The Hermit',         zh:'隱士'},
  {id:'10', en:'Wheel of Fortune',   zh:'命運之輪'},
  {id:'11', en:'Justice',            zh:'正義'},
  {id:'12', en:'The Hanged Man',     zh:'倒吊人'},
  {id:'13', en:'Death',              zh:'死神'},
  {id:'14', en:'Temperance',         zh:'節制'},
  {id:'15', en:'The Devil',          zh:'惡魔'},
  {id:'16', en:'The Tower',          zh:'塔'},
  {id:'17', en:'The Star',           zh:'星星'},
  {id:'18', en:'The Moon',           zh:'月亮'},
  {id:'19', en:'The Sun',            zh:'太陽'},
  {id:'20', en:'Judgement',          zh:'審判'},
  {id:'21', en:'The World',          zh:'世界'},
  // Wands
  {id:'w1',  en:'Ace of Wands',    zh:'權杖王牌'},
  {id:'w2',  en:'Two of Wands',    zh:'權杖二'},
  {id:'w3',  en:'Three of Wands',  zh:'權杖三'},
  {id:'w4',  en:'Four of Wands',   zh:'權杖四'},
  {id:'w5',  en:'Five of Wands',   zh:'權杖五'},
  {id:'w6',  en:'Six of Wands',    zh:'權杖六'},
  {id:'w7',  en:'Seven of Wands',  zh:'權杖七'},
  {id:'w8',  en:'Eight of Wands',  zh:'權杖八'},
  {id:'w9',  en:'Nine of Wands',   zh:'權杖九'},
  {id:'w10', en:'Ten of Wands',    zh:'權杖十'},
  {id:'wp',  en:'Page of Wands',   zh:'權杖侍者'},
  {id:'wn',  en:'Knight of Wands', zh:'權杖騎士'},
  {id:'wq',  en:'Queen of Wands',  zh:'權杖皇后'},
  {id:'wk',  en:'King of Wands',   zh:'權杖國王'},
  // Cups
  {id:'c1',  en:'Ace of Cups',    zh:'聖杯王牌'},
  {id:'c2',  en:'Two of Cups',    zh:'聖杯二'},
  {id:'c3',  en:'Three of Cups',  zh:'聖杯三'},
  {id:'c4',  en:'Four of Cups',   zh:'聖杯四'},
  {id:'c5',  en:'Five of Cups',   zh:'聖杯五'},
  {id:'c6',  en:'Six of Cups',    zh:'聖杯六'},
  {id:'c7',  en:'Seven of Cups',  zh:'聖杯七'},
  {id:'c8',  en:'Eight of Cups',  zh:'聖杯八'},
  {id:'c9',  en:'Nine of Cups',   zh:'聖杯九'},
  {id:'c10', en:'Ten of Cups',    zh:'聖杯十'},
  {id:'cp',  en:'Page of Cups',   zh:'聖杯侍者'},
  {id:'cn',  en:'Knight of Cups', zh:'聖杯騎士'},
  {id:'cq',  en:'Queen of Cups',  zh:'聖杯皇后'},
  {id:'ck',  en:'King of Cups',   zh:'聖杯國王'},
  // Swords
  {id:'s1',  en:'Ace of Swords',    zh:'寶劍王牌'},
  {id:'s2',  en:'Two of Swords',    zh:'寶劍二'},
  {id:'s3',  en:'Three of Swords',  zh:'寶劍三'},
  {id:'s4',  en:'Four of Swords',   zh:'寶劍四'},
  {id:'s5',  en:'Five of Swords',   zh:'寶劍五'},
  {id:'s6',  en:'Six of Swords',    zh:'寶劍六'},
  {id:'s7',  en:'Seven of Swords',  zh:'寶劍七'},
  {id:'s8',  en:'Eight of Swords',  zh:'寶劍八'},
  {id:'s9',  en:'Nine of Swords',   zh:'寶劍九'},
  {id:'s10', en:'Ten of Swords',    zh:'寶劍十'},
  {id:'sp',  en:'Page of Swords',   zh:'寶劍侍者'},
  {id:'sn',  en:'Knight of Swords', zh:'寶劍騎士'},
  {id:'sq',  en:'Queen of Swords',  zh:'寶劍皇后'},
  {id:'sk',  en:'King of Swords',   zh:'寶劍國王'},
  // Pentacles
  {id:'p1',  en:'Ace of Pentacles',    zh:'錢幣王牌'},
  {id:'p2',  en:'Two of Pentacles',    zh:'錢幣二'},
  {id:'p3',  en:'Three of Pentacles',  zh:'錢幣三'},
  {id:'p4',  en:'Four of Pentacles',   zh:'錢幣四'},
  {id:'p5',  en:'Five of Pentacles',   zh:'錢幣五'},
  {id:'p6',  en:'Six of Pentacles',    zh:'錢幣六'},
  {id:'p7',  en:'Seven of Pentacles',  zh:'錢幣七'},
  {id:'p8',  en:'Eight of Pentacles',  zh:'錢幣八'},
  {id:'p9',  en:'Nine of Pentacles',   zh:'錢幣九'},
  {id:'p10', en:'Ten of Pentacles',    zh:'錢幣十'},
  {id:'pp',  en:'Page of Pentacles',   zh:'錢幣侍者'},
  {id:'pn',  en:'Knight of Pentacles', zh:'錢幣騎士'},
  {id:'pq',  en:'Queen of Pentacles',  zh:'錢幣皇后'},
  {id:'pk',  en:'King of Pentacles',   zh:'錢幣國王'},
]

// x / y are percentages of the layout container (card CENTER point)
const SPREADS = [
  {
    id: 'mirror', name: '此刻之鏡', count: 1,
    tagline: '靜心一刻，映照此刻真實的你',
    containerH: 250,
    positions: [
      { id:'p1', label:'現況', desc:'映照你此刻真實的能量狀態，如實看見當下的自己正站在哪個位置', x:50, y:50 },
    ]
  },
  {
    id: 'guide', name: '前行指引', count: 2,
    tagline: '看見現況，找到前行的方向',
    containerH: 250,
    positions: [
      { id:'p1', label:'現況', desc:'你目前所處的能量與正在面對的核心課題，誠實看見當下', x:30, y:50 },
      { id:'p2', label:'建議', desc:'宇宙為你指引的前行方向，行動前可借力的智慧與提示', x:70, y:50 },
    ]
  },
  {
    id: 'mind-flow', name: '心思之流', count: 3,
    tagline: '探索對方內心深處的流動',
    containerH: 250,
    positions: [
      { id:'p1', label:'對方的想法', desc:'對方此刻內心深處真實的想法與感受，可能連對方自己都未必察覺', x:20, y:50 },
      { id:'p2', label:'對方的期待', desc:'對方在這段關係或當前情境中最深的渴望，他們真正期盼發生的事', x:50, y:50 },
      { id:'p3', label:'互動建議',   desc:'促進彼此理解、讓關係能量更流動的相處方式與溝通切入點', x:80, y:50 },
    ]
  },
  {
    id: 'restart', name: '重啟之路', count: 3,
    tagline: '找到突破困境、重新出發的力量',
    containerH: 250,
    positions: [
      { id:'p1', label:'現況', desc:'你目前所站立的位置與正在經歷的真實處境，是整個解讀的起點', x:20, y:50 },
      { id:'p2', label:'阻礙', desc:'阻止你前進的核心障礙，或尚未完全覺察的內在恐懼與限制性信念', x:50, y:50 },
      { id:'p3', label:'建議', desc:'突破困境、重新啟動生命能量的具體行動方向與內在態度調整', x:80, y:50 },
    ]
  },
  {
    id: 'time-flow', name: '時間之流', count: 3,
    tagline: '過去、現在與未來的能量流動',
    containerH: 250,
    positions: [
      { id:'p1', label: '過去', desc:'過去的能量——已發生的事件、曾做的選擇，以及它們如何塑造了現在', x:20, y:50 },
      { id:'p2', label: '現在', desc:'現在的能量——此刻你所站立的位置，當下的核心課題與真實狀態', x:50, y:50 },
      { id:'p3', label: '未來', desc:'未來的能量——若延續目前的軌跡，可能展開的方向與潛在的機會', x:80, y:50 },
    ]
  },
  {
    id: 'love-pyramid', name: '戀人金字塔', count: 5,
    tagline: '深探兩人關係的立體面貌',
    containerH: 560,
    positions: [
      { id:'p1', label:'建議',     desc:'為這段關係注入正向能量、讓愛流動的最佳行動建議',             x:20, y:25 },
      { id:'p2', label:'未來狀況', desc:'若延續目前軌跡，這段關係可能走向的未來發展與潛在走向',       x:50, y:25 },
      { id:'p3', label:'個案狀態', desc:'你在這段關係中的能量狀態、情緒底色與內心真實的處境',         x:20, y:75 },
      { id:'p4', label:'現況',     desc:'這段關係目前的整體氛圍、兩人之間的動態與互動走向',           x:50, y:75 },
      { id:'p5', label:'對方狀態', desc:'對方在這段關係中的能量狀態、心境，以及他們帶入關係的課題',   x:80, y:75 },
    ]
  },
  {
    id: 'choice', name: '二擇一牌陣', count: 5,
    tagline: '站在十字路口，看見兩條路的真相',
    containerH: 720,
    positions: [
      { id:'p1', label:'個案心態',  desc:'你面對這個抉擇時的內心狀態、潛在傾向，以及你尚未意識到的渴望', x:50, y:84 },
      { id:'p2', label:'A — 核心',  desc:'選擇A時所觸碰的核心能量，這條路帶給你的主要機遇與挑戰', x:28, y:50 },
      { id:'p3', label:'A — 發展',  desc:'選擇A後可能的深層發展方向，以及你需要做好準備的內在功課', x:14, y:16 },
      { id:'p4', label:'B — 核心',  desc:'選擇B時所觸碰的核心能量，這條路帶給你的主要機遇與挑戰', x:72, y:50 },
      { id:'p5', label:'B — 發展',  desc:'選擇B後可能的深層發展方向，以及你需要做好準備的內在功課', x:86, y:16 },
    ]
  },
  {
    id: 'seasons', name: '四季牌陣', count: 5,
    tagline: '全方位檢視生命四個核心面向',
    containerH: 820,
    positions: [
      { id:'p1', label:'當季總能量', desc:'此季節為你帶來的整體能量主題與核心課題，是其他四張的基礎底色', x:50, y:18 },
      { id:'p2', label:'事業',       desc:'事業、目標與行動力的能量狀態，指引你在職涯或計畫上的前進方向', x:22, y:50 },
      { id:'p3', label:'感情',       desc:'親密關係與重要人際互動的能量流動，看見連結的質地與課題', x:78, y:50 },
      { id:'p4', label:'財富',       desc:'財富、物質豐盛與資源運用的能量指引，看見你與金錢的關係', x:22, y:82 },
      { id:'p5', label:'健康',       desc:'身心健康、活力與自我照顧的能量狀態，身體想對你說的話', x:78, y:82 },
    ]
  },
  {
    id: 'unlock', name: '解鎖核心牌陣', count: 4,
    tagline: '照見問題根源，解鎖前行之路',
    containerH: 540,
    positions: [
      { id:'p1', label:'問題核心', desc:'這個困境或議題最根本的核心所在，看見真正需要被處理的是什麼', x:50, y:24 },
      { id:'p2', label:'障礙',     desc:'阻擋你看見答案或向前走的主要障礙，可能是外在環境或內在信念', x:20, y:76 },
      { id:'p3', label:'對策',     desc:'突破障礙、化解核心問題的具體行動方向與調整視角', x:50, y:76 },
      { id:'p4', label:'資源與長處', desc:'你已擁有卻尚未充分運用的內在資源、天賦與潛能', x:80, y:76 },
    ]
  },
]
