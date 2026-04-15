const GalleryTab = {
  name: 'GalleryTab',
  props: { cards: Array, cardExts: Object },
  setup(props) {
    const { computed } = Vue
    function src(id) {
      const ext = props.cardExts[id]
      return ext ? `cards/${id}.${ext}` : ''
    }
    function onImgErr(e) { e.target.style.opacity = '0.18' }
    const major  = computed(() => props.cards.filter(c => /^\d+$/.test(c.id)))
    const wands  = computed(() => props.cards.filter(c => c.id.startsWith('w')))
    const cups   = computed(() => props.cards.filter(c => c.id.startsWith('c')))
    const swords = computed(() => props.cards.filter(c => c.id.startsWith('s')))
    const pents  = computed(() => props.cards.filter(c => c.id.startsWith('p')))
    return { src, onImgErr, major, wands, cups, swords, pents }
  },
  template: `
    <div class="gallery-scroll">
      <div class="section-title">大阿爾克那 · Major Arcana</div>
      <div class="cards-grid">
        <div class="g-item" v-for="c in major" :key="c.id">
          <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
          <div class="en">{{ c.en }}</div>
          <div class="zh">{{ c.zh }}</div>
        </div>
      </div>
      <div class="section-title">權杖 · Wands</div>
      <div class="cards-grid">
        <div class="g-item" v-for="c in wands" :key="c.id">
          <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
          <div class="en">{{ c.en }}</div><div class="zh">{{ c.zh }}</div>
        </div>
      </div>
      <div class="section-title">聖杯 · Cups</div>
      <div class="cards-grid">
        <div class="g-item" v-for="c in cups" :key="c.id">
          <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
          <div class="en">{{ c.en }}</div><div class="zh">{{ c.zh }}</div>
        </div>
      </div>
      <div class="section-title">寶劍 · Swords</div>
      <div class="cards-grid">
        <div class="g-item" v-for="c in swords" :key="c.id">
          <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
          <div class="en">{{ c.en }}</div><div class="zh">{{ c.zh }}</div>
        </div>
      </div>
      <div class="section-title">錢幣 · Pentacles</div>
      <div class="cards-grid">
        <div class="g-item" v-for="c in pents" :key="c.id">
          <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
          <div class="en">{{ c.en }}</div><div class="zh">{{ c.zh }}</div>
        </div>
      </div>
    </div>
  `
}
