const DailyTab = {
  name: 'DailyTab',
  props: { cards: Array, cardExts: Object },
  setup(props) {
    const { ref } = Vue

    const drawn   = ref(false)
    const flipped = ref(false)
    const card    = ref(null)

    const DAY_ZH  = ['日','一','二','三','四','五','六']
    const now     = new Date()
    const dateStr = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日　週${DAY_ZH[now.getDay()]}`

function src(id) {
      const ext = props.cardExts[id]
      return ext ? `cards/${id}.${ext}` : ''
    }

    function draw() {
      if (drawn.value) return
      const idx    = Math.floor(Math.random() * props.cards.length)
      card.value   = { ...props.cards[idx], rev: Math.random() < 0.5 }
      drawn.value  = true
      setTimeout(() => { flipped.value = true }, 400)
    }

    function redraw() {
      drawn.value   = false
      flipped.value = false
      card.value    = null
    }

    return { drawn, flipped, card, dateStr, src, draw, redraw }
  },
  template: `
    <div class="daily-tab">
      <div class="daily-inner">
        <div class="daily-date">{{ dateStr }}</div>
        <div class="daily-title">今日塔羅運勢</div>
        <div class="daily-rule"></div>

        <div class="daily-card-area">
          <!-- Placeholder: click to draw -->
          <div v-if="!drawn" class="daily-placeholder" @click="draw">
            <span class="ph-symbol">✦</span>
            <span class="ph-text">開啟每日運勢</span>
          </div>

          <!-- Flip card after draw -->
          <div v-else class="daily-flip" :class="{'daily-revealed': flipped}">
            <div class="daily-flip-inner" :class="{flipped: flipped}">
              <div class="daily-flip-face">
                <img :src="src('back')" alt="">
              </div>
              <div class="daily-flip-face daily-flip-front" :class="{reversed: card.rev}">
                <img :src="src(card.id)" :alt="card.en">
              </div>
            </div>
          </div>
        </div>

        <!-- Card name appears after flip -->
        <div class="daily-card-info" :class="{ 'daily-info-hidden': !flipped || !card }">
          <div class="daily-card-zh">{{ card ? card.zh : '　' }}</div>
          <div class="daily-card-en">{{ card ? card.en : '　' }}</div>
          <div class="daily-card-rev" :style="{ visibility: card && card.rev ? 'visible' : 'hidden' }">逆位</div>
        </div>

        <button class="daily-redraw-btn" :class="{ 'daily-info-hidden': !drawn }" @click="redraw">↺ 重新占卜</button>
      </div>
    </div>
  `
}
