const DrawTab = {
  name: 'DrawTab',
  props: { cards: Array, cardExts: Object },
  setup(props) {
    const { ref, computed, nextTick, onMounted, onUnmounted } = Vue

    const fan        = ref([])
    const spread     = ref(false)
    const animating  = ref(false)
    const hov        = ref(null)
    const pickedCards  = ref([])
    const activeDrag   = ref(null)
    const showPicker   = ref(false)
    const selectedIds  = ref(new Set())
    const spreadRef    = ref(null)
    const resultRef    = ref(null)
    const spreadW      = ref(0)
    const fanCollapsed = ref(false)

    function src(id) {
      const ext = props.cardExts[id]
      return ext ? `cards/${id}.${ext}` : ''
    }
    function onImgErr(e) { e.target.style.opacity = '0.18' }

    const availableCards = computed(() =>
      props.cards.filter(c => !pickedCards.value.some(p => p.id === c.id))
    )

    function shuffle(arr) {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    function initFan() {
      fan.value = shuffle(props.cards).map(c => ({
        ...c,
        randY:   (Math.random() - 0.5) * 4,
        randRot: (Math.random() - 0.5) * 2,
      }))
      spread.value    = false
      animating.value = true
      hov.value       = null
      pickedCards.value = []

      nextTick(() => {
        if (spreadRef.value) spreadW.value = spreadRef.value.clientWidth
        setTimeout(() => {
          spread.value = true
          const done = (props.cards.length - 1) * 10 + 450
          setTimeout(() => { animating.value = false }, done)
        }, 60)
      })
    }

    function spreadStyle(i, card) {
      const w       = spreadW.value || 800
      const n       = fan.value.length
      const PADDING = 60
      const halfSpan = w / 2 - PADDING - CARD_W / 2
      const step     = (2 * halfSpan) / (n - 1)
      const finalX   = step * i - halfSpan
      const normT    = (i / (n - 1)) * 2 - 1
      const arcY     = spread.value ? -44 * (1 - normT * normT) + card.randY : 0
      const rot      = spread.value ?  14 * normT               + card.randRot : 0
      const isHov    = !animating.value && hov.value === card.id
      const isPicked = pickedCards.value.some(p => p.id === card.id)
      return {
        transform:       `translateX(${finalX * (spread.value ? 1 : 0)}px) translateY(${arcY + (isHov ? -18 : 0)}px) rotate(${rot}deg)`,
        transitionDelay: (spread.value && animating.value) ? `${i * 10}ms` : '0ms',
        zIndex:          isHov ? 200 : i,
        opacity:         isPicked ? 0 : 1,
        cursor:          animating.value ? 'default' : 'pointer',
      }
    }

    function onEnter(id) { if (!animating.value) hov.value = id }
    function onLeave()   { hov.value = null }

    function pick(card) {
      if (animating.value || !spread.value) return
      if (pickedCards.value.some(p => p.id === card.id)) return
      hov.value = null
      const ra  = resultRef.value
      const idx = pickedCards.value.length
      const col = idx % 5
      const row = Math.floor(idx / 5)
      const startX = ra ? Math.max(10, (ra.clientWidth - 5 * 148) / 2) : 10
      const entry = {
        ...card,
        rev: Math.random() < 0.5,
        x: startX + col * 148,
        y: 50 + row * 265,
        flipped: false,
        uid: Date.now() + Math.random(),
      }
      pickedCards.value.push(entry)
    }

    function reset() { initFan() }

    function onDown(e, pc) {
      const r         = resultRef.value?.getBoundingClientRect() ?? { left:0, top:0 }
      const scrollTop = resultRef.value?.scrollTop ?? 0
      activeDrag.value = {
        uid:  pc.uid,
        offX: e.clientX - r.left - pc.x,
        offY: e.clientY - r.top  - pc.y + scrollTop,
      }
      e.preventDefault()
    }
    function onMove(e) {
      if (!activeDrag.value) return
      const r         = resultRef.value?.getBoundingClientRect() ?? { left:0, top:0 }
      const scrollTop = resultRef.value?.scrollTop ?? 0
      const pc        = pickedCards.value.find(p => p.uid === activeDrag.value.uid)
      if (!pc) return
      pc.x = e.clientX - r.left - activeDrag.value.offX
      pc.y = e.clientY - r.top  - activeDrag.value.offY + scrollTop
    }
    function onUp() { activeDrag.value = null }
    function flipCard(pc) { if (!pc.flipped) pc.flipped = true }
    function toggleRev(pc) { if (pc.flipped) pc.rev = !pc.rev }

    function openPicker()  { selectedIds.value = new Set(); showPicker.value = true }
    function closePicker() { showPicker.value = false }
    function toggleSelect(id) {
      const s = new Set(selectedIds.value)
      s.has(id) ? s.delete(id) : s.add(id)
      selectedIds.value = s
    }
    function confirmPick() {
      const ra  = resultRef.value
      const ids = [...selectedIds.value]
      ids.forEach((id, i) => {
        const card = props.cards.find(c => c.id === id)
        if (!card) return
        const base   = pickedCards.value.length
        const col    = base % 5
        const row    = Math.floor(base / 5)
        const startX = ra ? Math.max(10, (ra.clientWidth - 5 * 148) / 2) : 10
        pickedCards.value.push({
          ...card,
          rev: false,
          x: startX + col * 148,
          y: 50 + row * 265,
          flipped: false,
          uid: Date.now() + Math.random() + i,
        })
      })
      closePicker()
    }

    function onResize() {
      if (spreadRef.value) spreadW.value = spreadRef.value.clientWidth
    }

    onMounted(() => {
      window.addEventListener('resize', onResize)
      initFan()
    })
    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })

    return {
      fan, spread, pickedCards, activeDrag,
      spreadRef, resultRef,
      src, onImgErr,
      spreadStyle, onEnter, onLeave, pick, reset,
      onDown, onMove, onUp, toggleRev,
      showPicker, selectedIds, availableCards,
      openPicker, closePicker, toggleSelect, confirmPick,
      flipCard, fanCollapsed,
    }
  },
  template: `
    <div class="draw-content">
      <!-- Fan spread area -->
      <div class="spread-area" ref="spreadRef" :class="{ 'fan-collapsed': fanCollapsed }">
        <div
          v-for="(c, i) in fan" :key="c.id"
          class="spread-card"
          :style="spreadStyle(i, c)"
          @mouseenter="onEnter(c.id)"
          @mouseleave="onLeave"
          @click="pick(c)"
        >
          <img :src="src('back')" alt="">
        </div>
      </div>

      <!-- Fan toggle bar -->
      <div class="fan-toggle-bar">
        <button class="fan-toggle-btn" @click="fanCollapsed = !fanCollapsed">
          {{ fanCollapsed ? '▼ 展開抽牌區' : '▲ 收起抽牌區' }}
        </button>
      </div>

      <!-- Result area -->
      <div class="result-area" ref="resultRef"
        @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp"
      >
        <div class="result-inner">
          <div class="toolbar">
            <button class="btn-refresh" @click="reset">↺ 重新整理</button>
            <button class="btn-picker"  @click="openPicker">⊞ 直接取牌</button>
          </div>
          <span class="result-hint" v-if="pickedCards.length === 0">點選上方任意一張牌</span>
          <div
            v-for="(pc, idx) in pickedCards" :key="pc.uid"
            class="drawn-card"
            :style="{
              left:   pc.x + 'px',
              top:    pc.y + 'px',
              zIndex: activeDrag && activeDrag.uid === pc.uid ? 200 : 10 + idx,
              cursor: activeDrag && activeDrag.uid === pc.uid ? 'grabbing' : 'grab',
            }"
            @mousedown="onDown($event, pc)"
          >
            <div class="flip-card" :class="{ 'can-flip': !pc.flipped }" @click.stop="flipCard(pc)">
              <div class="flip-inner" :class="{flipped: pc.flipped}">
                <div class="flip-face"><img :src="src('back')" alt=""></div>
                <div class="flip-face flip-front" :class="{reversed: pc.rev}">
                  <img :src="src(pc.id)" :alt="pc.en">
                </div>
              </div>
            </div>
            <div class="card-info" v-if="pc.flipped">
              <div class="zh" @mousedown.stop @click.stop="toggleRev(pc)">{{ pc.zh }}</div>
              <div class="rev" v-if="pc.rev">逆位</div>
              <div class="upright" v-else>正位</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Direct-pick modal -->
      <div class="picker-overlay" v-show="showPicker" @click.self="closePicker">
        <div class="picker-modal">
          <div class="picker-header">
            <span>直接取牌</span>
            <small>已選 {{ selectedIds.size }} 張，點選切換</small>
          </div>
          <div class="picker-body">
            <div
              v-for="c in availableCards" :key="c.id"
              class="picker-card" :class="{ selected: selectedIds.has(c.id) }"
              @click="toggleSelect(c.id)"
            >
              <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
              <div class="p-zh">{{ c.zh }}</div>
            </div>
          </div>
          <div class="picker-footer">
            <button class="btn-cancel"  @click="closePicker">取消</button>
            <button class="btn-confirm" :disabled="selectedIds.size === 0" @click="confirmPick">
              抽出 {{ selectedIds.size }} 張
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}
