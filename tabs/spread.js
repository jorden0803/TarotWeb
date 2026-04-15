const SpreadTab = {
  name: 'SpreadTab',
  props: { cards: Array, cardExts: Object, spreads: Array },
  setup(props) {
    const { ref, computed, watch, nextTick, onMounted, onUnmounted } = Vue

    // ── Sidebar ──────────────────────────────────────────
    const sidebarOpen   = ref(false)
    const sidebarPinned = ref(localStorage.getItem('sidebarPinned') === '1')

    function toggleSidebar() {
      if (!sidebarPinned.value) sidebarOpen.value = !sidebarOpen.value
    }

    watch(sidebarPinned, v => localStorage.setItem('sidebarPinned', v ? '1' : '0'))

    // ── Current spread ────────────────────────────────────
    const currentSpread = ref(null)
    const slotCards     = ref([])

    // ── Fan ──────────────────────────────────────────────
    const fan          = ref([])
    const fanSpread    = ref(false)
    const animating    = ref(false)
    const hov          = ref(null)
    const spreadRef    = ref(null)
    const spreadW      = ref(0)
    const fanCollapsed = ref(false)

    // ── Tour ─────────────────────────────────────────────
    const TOUR_STEPS = [
      {
        sel: '.spread-sidebar', placement: 'right',
        title: '選擇牌陣',
        text: '從這裡選擇你想使用的牌陣，每個牌陣適合不同的問題類型。不確定選哪個？點上方的「牌陣指引」了解每個牌陣的用途。右上角的 ◇ 可以將側邊欄固定，方便隨時切換牌陣。',
      },
      {
        sel: '.spread-area', placement: 'bottom',
        title: '抽牌區',
        text: '這是你的牌堆，洗好的牌在這裡展開。靜下心，直覺點選你感應到的牌，也可以將牌向下拖曳到牌位上直接放置。',
      },
      {
        sel: '.fan-toggle-bar', placement: 'bottom',
        title: '收起抽牌區',
        text: '抽完牌後可以把抽牌區收起來，讓畫面空間集中在牌陣結果上。',
      },
      {
        sel: '.toolbar', placement: 'left',
        title: '工具列',
        text: '不想一張一張抽？「抽一張」或「一鍵全抽」可快速填滿牌位。「直接取牌」可指定你想要的牌，「抽牌範圍」可限制使用的牌組。',
      },
      {
        sel: '.spread-content-scroll', placement: 'top',
        title: '牌位區',
        text: '牌位依序自動填入，點牌可翻面，翻開後再點可切換正逆位。牌與牌之間也可以拖曳互換位置。',
      },
      {
        sel: '.btn-guide', placement: 'left',
        title: '塔羅教學',
        text: '點擊「開啟教學」，畫面下方會分成左右兩欄，左側顯示塔羅教學文件，方便你一邊查閱牌義、一邊進行占卜。',
      },
      {
        sel: '.guide-divider', placement: 'right',
        title: '調整教學面板寬度',
        text: '開啟教學後，左右兩欄之間會出現一條分隔線。用滑鼠拖曳分隔線，可以自由調整教學文件與牌陣的顯示比例。',
      },
    ]

    const showTour         = ref(false)
    const tourStep         = ref(0)
    const tourRect         = ref(null)
    const tourTooltipStyle = ref({})

    function updateTourRect() {
      const step = TOUR_STEPS[tourStep.value]
      const el   = document.querySelector(step.sel)
      if (!el) return
      const r   = el.getBoundingClientRect()
      const PAD = 8
      const tr  = {
        top:    r.top    - PAD,
        left:   r.left   - PAD,
        width:  r.width  + PAD * 2,
        height: r.height + PAD * 2,
      }
      tourRect.value = tr
      const TW  = 300
      const GAP = 14
      const vw  = window.innerWidth
      const vh  = window.innerHeight
      if (step.placement === 'right') {
        tourTooltipStyle.value = {
          top:   Math.max(10, tr.top) + 'px',
          left:  (tr.left + tr.width + GAP) + 'px',
          width: TW + 'px',
        }
      } else if (step.placement === 'left') {
        tourTooltipStyle.value = {
          top:   Math.max(10, tr.top) + 'px',
          left:  Math.max(10, tr.left - TW - GAP) + 'px',
          width: TW + 'px',
        }
      } else if (step.placement === 'bottom') {
        tourTooltipStyle.value = {
          top:   (tr.top + tr.height + GAP) + 'px',
          left:  Math.min(Math.max(10, tr.left), vw - TW - 10) + 'px',
          width: TW + 'px',
        }
      } else {
        tourTooltipStyle.value = {
          bottom: (vh - tr.top + GAP) + 'px',
          left:   Math.min(Math.max(10, tr.left), vw - TW - 10) + 'px',
          width:  TW + 'px',
        }
      }
    }

    function startTour() {
      tourStep.value = 0
      tourRect.value = null
      sidebarOpen.value = true
      // 等側邊欄 transition (0.28s) 完成後再顯示 tour
      setTimeout(() => {
        showTour.value = true
        nextTick(() => setTimeout(updateTourRect, 50))
      }, 320)
    }

    function tourGo(delta) {
      const next = tourStep.value + delta
      if (next < 0 || next >= TOUR_STEPS.length) return
      tourStep.value = next
      // 拖曳介紹步驟需要教學面板是開啟狀態
      if (TOUR_STEPS[next].sel === '.guide-divider' && !showGuide.value) toggleGuide()
      nextTick(() => setTimeout(updateTourRect, 50))
    }

    function endTour() {
      showTour.value = false
      tourRect.value = null
    }

    function tourNext() { tourStep.value < TOUR_STEPS.length - 1 ? tourGo(1) : endTour() }
    function tourPrev() { tourGo(-1) }

    // ── Intro modal ───────────────────────────────────────
    const showIntro = ref(false)

    const INTRO_CATEGORIES = [
      { id: 'all',    name: '全部'   },
      { id: 'love',   name: '感情'   },
      { id: 'work',   name: '工作'   },
      { id: 'fortune',name: '運勢'   },
      { id: 'decide', name: '決策'   },
    ]
    const SPREAD_CATS = {
      'mirror':       ['fortune'],
      'guide':        ['fortune', 'work'],
      'mind-flow':    ['love'],
      'restart':      ['work'],
      'time-flow':    ['fortune'],
      'love-pyramid': ['love'],
      'choice':       ['decide'],
      'seasons':      ['fortune', 'work'],
      'unlock':       ['work', 'decide'],
    }
    const introCategory = ref('all')
    const introSpreads  = computed(() =>
      introCategory.value === 'all'
        ? props.spreads
        : props.spreads.filter(sp => (SPREAD_CATS[sp.id] || []).includes(introCategory.value))
    )

    // ── Guide panel ──────────────────────────────────────
    const showGuide   = ref(false)
    const guideSrc    = ref('')
    const guideWidth  = ref(50)   // percentage
    const lowerRef    = ref(null)
    const isDragging  = ref(false)

    function toggleGuide() {
      showGuide.value = !showGuide.value
      if (showGuide.value && !guideSrc.value) guideSrc.value = 'docs/tarot-guide.pdf'
    }

    function onDividerDown(e) {
      isDragging.value = true
      e.preventDefault()
      function onMove(ev) {
        if (!lowerRef.value) return
        const rect = lowerRef.value.getBoundingClientRect()
        const pct  = ((ev.clientX - rect.left) / rect.width) * 100
        guideWidth.value = Math.min(Math.max(pct, 20), 80)
      }
      function onUp() {
        isDragging.value = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup',   onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup',   onUp)
    }

    // ── Picker ────────────────────────────────────────────
    const showPicker  = ref(false)
    const selectedIds = ref(new Set())

    // ── Card range ────────────────────────────────────────
    const showRangeModal    = ref(false)
    const expandedRangeGroups = ref(new Set())

    // Individual card selection (starts with all selected)
    const selectedCardIds = ref(new Set(props.cards.map(c => c.id)))

    // Classify a card into one of the 6 groups
    function isCourtCard(c) {
      return ['p','n','q','k'].includes(c.id.slice(-1)) && !/^\d+$/.test(c.id)
    }
    function cardRangeGroup(c) {
      if (/^\d+$/.test(c.id)) return 'major'
      if (isCourtCard(c))     return 'court'
      if (c.id.startsWith('w')) return 'wands'
      if (c.id.startsWith('c')) return 'cups'
      if (c.id.startsWith('s')) return 'swords'
      return 'pents'
    }

    // Static group definitions (name + card list)
    const rangeGroupData = computed(() => [
      { id: 'major', name: '大阿爾克那', cards: props.cards.filter(c => /^\d+$/.test(c.id)) },
      { id: 'court', name: '宮廷牌',     cards: props.cards.filter(c => isCourtCard(c)) },
      { id: 'wands', name: '權杖數字',   cards: props.cards.filter(c => c.id.startsWith('w') && !isCourtCard(c)) },
      { id: 'cups',  name: '聖杯數字',   cards: props.cards.filter(c => c.id.startsWith('c') && !isCourtCard(c)) },
      { id: 'swords',name: '寶劍數字',   cards: props.cards.filter(c => c.id.startsWith('s') && !isCourtCard(c)) },
      { id: 'pents', name: '錢幣數字',   cards: props.cards.filter(c => c.id.startsWith('p') && !isCourtCard(c)) },
    ])

    // Group selection state
    function isGroupFull(g) {
      return g.cards.every(c => selectedCardIds.value.has(c.id))
    }
    function isGroupPartial(g) {
      const count = g.cards.filter(c => selectedCardIds.value.has(c.id)).length
      return count > 0 && count < g.cards.length
    }
    function toggleGroupRange(g) {
      const s = new Set(selectedCardIds.value)
      if (isGroupFull(g)) {
        // If deselecting would leave nothing, abort
        const remaining = [...s].filter(id => !g.cards.some(c => c.id === id))
        if (remaining.length === 0) return
        g.cards.forEach(c => s.delete(c.id))
      } else {
        g.cards.forEach(c => s.add(c.id))
      }
      selectedCardIds.value = s
    }
    function toggleCardRange(id) {
      const s = new Set(selectedCardIds.value)
      if (s.has(id)) {
        if (s.size > 1) s.delete(id)
      } else {
        s.add(id)
      }
      selectedCardIds.value = s
    }
    function selectAllRange() { selectedCardIds.value = new Set(props.cards.map(c => c.id)) }
    function deselectAllRange() {
      // Keep at least 1 so draw pool is never empty
      if (props.cards.length > 0) selectedCardIds.value = new Set([props.cards[0].id])
    }

    function toggleRangeExpand(groupId) {
      const s = new Set(expandedRangeGroups.value)
      s.has(groupId) ? s.delete(groupId) : s.add(groupId)
      expandedRangeGroups.value = s
    }

    const rangeCards = computed(() =>
      props.cards.filter(c => selectedCardIds.value.has(c.id))
    )

    const rangeTotalLabel = computed(() => {
      const n = selectedCardIds.value.size
      return n === props.cards.length ? `全部 ${n}張` : `已選 ${n}張`
    })

    // Re-init fan whenever range changes
    watch(rangeCards, () => { if (currentSpread.value) initFan() })

    // ── Helpers ───────────────────────────────────────────
    function src(id) {
      const ext = props.cardExts[id]
      return ext ? `cards/${id}.${ext}` : ''
    }
    function onImgErr(e) { e.target.style.opacity = '0.18' }

    // Picker always shows all cards (ignores range), only excludes already-placed
    const availableCards = computed(() =>
      props.cards.filter(c => !slotCards.value.some(s => s && s.id === c.id))
    )

    function shuffle(arr) {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    // ── Fan logic ─────────────────────────────────────────
    function initFan() {
      fan.value = shuffle(rangeCards.value).map(c => ({
        ...c,
        randY:   (Math.random() - 0.5) * 4,
        randRot: (Math.random() - 0.5) * 2,
      }))
      fanSpread.value = false
      animating.value = true
      hov.value       = null

      nextTick(() => {
        if (spreadRef.value) spreadW.value = spreadRef.value.clientWidth
        setTimeout(() => {
          fanSpread.value = true
          const done = (rangeCards.value.length - 1) * 10 + 450
          setTimeout(() => { animating.value = false }, done)
        }, 60)
      })
    }

    function spreadStyle(i, card) {
      const w        = spreadW.value || 800
      const n        = fan.value.length
      const PADDING  = 60
      const halfSpan = w / 2 - PADDING - CARD_W / 2
      const step     = (2 * halfSpan) / (n - 1)
      const finalX   = step * i - halfSpan
      const normT    = (i / (n - 1)) * 2 - 1
      const arcY     = fanSpread.value ? -44 * (1 - normT * normT) + card.randY : 0
      const rot      = fanSpread.value ?  14 * normT               + card.randRot : 0
      const isHov      = !animating.value && hov.value === card.id
      const isPicked   = slotCards.value.some(s => s && s.id === card.id)
      const isDragging = dragFanId.value === card.id
      return {
        transform:       `translateX(${finalX * (fanSpread.value ? 1 : 0)}px) translateY(${arcY + (isHov ? -18 : 0)}px) rotate(${rot}deg)`,
        transitionDelay: (fanSpread.value && animating.value) ? `${i * 10}ms` : '0ms',
        zIndex:          isHov ? 200 : i,
        opacity:         isPicked ? 0 : isDragging ? 0.35 : 1,
        cursor:          animating.value ? 'default' : 'pointer',
      }
    }

    function onEnter(id) { if (!animating.value) hov.value = id }
    function onLeave()   { hov.value = null }

    // ── Slot logic ────────────────────────────────────────
    const nextIdx    = computed(() => slotCards.value.findIndex(c => c === null))
    const isComplete = computed(() => nextIdx.value === -1 && slotCards.value.length > 0)

    function placeCard(idx, cardData, faceUp = false) {
      slotCards.value[idx] = { ...cardData, rev: Math.random() < 0.5, flipped: faceUp }
      if (!faceUp) {
        const cap = idx
        setTimeout(() => {
          if (slotCards.value[cap]) slotCards.value[cap].flipped = true
        }, 320)
      }
    }

    function pick(card) {
      if (animating.value || !fanSpread.value) return
      if (!currentSpread.value) return
      if (slotCards.value.some(s => s && s.id === card.id)) return
      const idx = nextIdx.value
      if (idx === -1) return
      hov.value = null
      placeCard(idx, card)
    }

    function drawOne() {
      const idx = nextIdx.value
      if (idx === -1) return
      const usedIds = slotCards.value.filter(Boolean).map(c => c.id)
      const avail   = rangeCards.value.filter(c => !usedIds.includes(c.id))
      if (!avail.length) return
      placeCard(idx, avail[Math.floor(Math.random() * avail.length)])
    }

    function drawAll() {
      const emptyIdxs = slotCards.value.reduce((acc, c, i) => (c === null ? [...acc, i] : acc), [])
      if (!emptyIdxs.length) return
      const usedIds = slotCards.value.filter(Boolean).map(c => c.id)
      const avail   = shuffle(rangeCards.value.filter(c => !usedIds.includes(c.id)))
      emptyIdxs.forEach((idx, j) => {
        if (!avail[j]) return
        slotCards.value[idx] = { ...avail[j], rev: Math.random() < 0.5, flipped: false }
        const cap = idx
        setTimeout(() => {
          if (slotCards.value[cap]) slotCards.value[cap].flipped = true
        }, 180 + j * 180)
      })
    }

    function toggleRev(i) {
      if (slotCards.value[i] && slotCards.value[i].flipped) {
        slotCards.value[i].rev = !slotCards.value[i].rev
      }
    }

    // ── Drag & drop ───────────────────────────────────────
    const dragFromIdx = ref(null)   // slot index being dragged
    const dragOverIdx = ref(null)   // slot index being hovered
    const dragFanId   = ref(null)   // fan card id being dragged
    const dragOverFan = ref(false)  // slot card hovering over fan area

    // Fan card drag
    function onFanDragStart(e, cardId) {
      if (animating.value) { e.preventDefault(); return }
      dragFanId.value = cardId
      e.dataTransfer.setData('src', 'fan')
      e.dataTransfer.setData('cardId', cardId)
      e.dataTransfer.effectAllowed = 'move'
    }
    function onFanDragEnd() { dragFanId.value = null }

    // Slot drag
    function onDragStart(e, i) {
      if (!slotCards.value[i]) { e.preventDefault(); return }
      dragFromIdx.value = i
      e.dataTransfer.setData('src', 'slot')
      e.dataTransfer.setData('slotIdx', String(i))
      e.dataTransfer.effectAllowed = 'move'
    }
    function onDragOver(e, i) {
      const hasSlot = dragFromIdx.value !== null && dragFromIdx.value !== i
      const hasFan  = dragFanId.value !== null
      if (!hasSlot && !hasFan) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      dragOverIdx.value = i
    }
    function onDragLeave(i) {
      if (dragOverIdx.value === i) dragOverIdx.value = null
    }
    function onDrop(e, i) {
      e.preventDefault()
      dragOverIdx.value = null
      const src = e.dataTransfer.getData('src')

      if (src === 'fan') {
        // Fan card → slot: replace (old card returns to fan automatically)
        const cardId = e.dataTransfer.getData('cardId')
        const card   = props.cards.find(c => c.id === cardId)
        if (!card) { dragFanId.value = null; return }
        slotCards.value[i] = { ...card, rev: Math.random() < 0.5, flipped: false }
        const cap = i
        setTimeout(() => { if (slotCards.value[cap]) slotCards.value[cap].flipped = true }, 320)
        dragFanId.value = null
        return
      }

      // Slot → slot: swap
      const from = dragFromIdx.value
      if (from === null || from === i) { dragFromIdx.value = null; return }
      const tmp = slotCards.value[from]
      slotCards.value[from] = slotCards.value[i] ?? null
      slotCards.value[i]    = tmp
      dragFromIdx.value = null
    }
    function onDragEnd() {
      dragFromIdx.value = null
      dragOverIdx.value = null
      dragFanId.value   = null
      dragOverFan.value = false
    }

    // Fan area as drop target: slot card dropped here → slot becomes empty
    function onFanAreaDragOver(e) {
      if (dragFromIdx.value !== null) {
        e.preventDefault()
        dragOverFan.value = true
      }
    }
    function onFanAreaDragLeave() { dragOverFan.value = false }
    function onFanAreaDrop(e) {
      e.preventDefault()
      if (dragFromIdx.value !== null) {
        slotCards.value[dragFromIdx.value] = null
      }
      dragFromIdx.value = null
      dragOverIdx.value = null
      dragOverFan.value = false
    }

    function resetSpread() {
      if (!currentSpread.value) return
      slotCards.value = new Array(currentSpread.value.positions.length).fill(null)
      initFan()
    }

    function selectSpread(sp) {
      currentSpread.value = sp
      slotCards.value     = new Array(sp.positions.length).fill(null)
      if (!sidebarPinned.value) sidebarOpen.value = false
      initFan()
    }

    // ── Picker ────────────────────────────────────────────
    function openPicker()  { selectedIds.value = new Set(); showPicker.value = true }
    function closePicker() { showPicker.value = false }
    function toggleSelect(id) {
      const s = new Set(selectedIds.value)
      s.has(id) ? s.delete(id) : s.add(id)
      selectedIds.value = s
    }
    function confirmPick() {
      const ids = [...selectedIds.value]
      ids.forEach(id => {
        const emptyIdx = slotCards.value.findIndex(c => c === null)
        if (emptyIdx === -1) return
        const card = props.cards.find(c => c.id === id)
        if (!card) return
        slotCards.value[emptyIdx] = { ...card, rev: false, flipped: true }
      })
      closePicker()
    }

    function onResize() {
      if (spreadRef.value) spreadW.value = spreadRef.value.clientWidth
    }

    onMounted(() => {
      window.addEventListener('resize', onResize)
      if (props.spreads && props.spreads.length > 0) {
        currentSpread.value = props.spreads[0]
        slotCards.value     = new Array(props.spreads[0].positions.length).fill(null)
      }
      initFan()
    })
    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })

    return {
      TOUR_STEPS, showTour, tourStep, tourRect, tourTooltipStyle,
      startTour, tourNext, tourPrev, endTour,
      showIntro, INTRO_CATEGORIES, introCategory, introSpreads,
      sidebarOpen, sidebarPinned, toggleSidebar,
      currentSpread, slotCards, nextIdx, isComplete,
      fan, animating, hov, spreadRef, fanCollapsed,
      src, onImgErr, availableCards,
      selectSpread, spreadStyle, onEnter, onLeave, pick,
      drawOne, drawAll, resetSpread,
      showPicker, selectedIds,
      openPicker, closePicker, toggleSelect, confirmPick,
      toggleRev,
      dragFromIdx, dragOverIdx, dragFanId, dragOverFan,
      onFanDragStart, onFanDragEnd,
      onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
      onFanAreaDragOver, onFanAreaDragLeave, onFanAreaDrop,
      showGuide, guideSrc, guideWidth, lowerRef, isDragging, toggleGuide, onDividerDown,
      showRangeModal, expandedRangeGroups, selectedCardIds,
      rangeGroupData, isGroupFull, isGroupPartial,
      toggleGroupRange, toggleCardRange,
      selectAllRange, deselectAllRange, toggleRangeExpand,
      rangeTotalLabel,
    }
  },
  template: `
    <div class="spread-tab">

      <!-- ── Collapsible sidebar (in-flow) ── -->
      <div class="spread-sidebar" :class="{'is-open': sidebarOpen || sidebarPinned}">
        <div class="spread-sidebar-inner">
          <div class="spread-sidebar-hd">
            <span>選擇牌陣</span>
            <button
              class="sidebar-pin"
              :class="{ pinned: sidebarPinned }"
              :title="sidebarPinned ? '取消固定' : '固定側邊欄'"
              @click="sidebarPinned = !sidebarPinned"
            >{{ sidebarPinned ? '◈' : '◇' }}</button>
          </div>
          <button class="sidebar-guide-btn" @click="showIntro = true">✦ 牌陣指引</button>
          <div class="spread-sidebar-list">
            <div
              v-for="sp in spreads" :key="sp.id"
              class="spread-sidebar-item"
              :class="{'is-active': currentSpread && currentSpread.id === sp.id}"
              @click="selectSpread(sp)"
            >
              <span class="ssb-name">{{ sp.name }}</span>
              <span class="ssb-count">{{ sp.count }}張</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main area ── -->
      <div class="spread-main">

        <!-- Header -->
        <div class="spread-main-hd">
          <button
            class="sidebar-toggle"
            :class="{'is-open': sidebarOpen || sidebarPinned, 'is-pinned': sidebarPinned}"
            @click="toggleSidebar"
          >☰ 牌陣</button>
          <div class="spread-main-name" v-if="currentSpread">{{ currentSpread.name }}</div>
          <div class="spread-main-tagline" v-if="currentSpread">{{ currentSpread.tagline }}</div>
          <button class="btn-tour" @click="startTour">✦ 占卜指引</button>
        </div>

        <!-- Fan area (also drop target: drop slot card here to clear it) -->
        <div class="spread-area" ref="spreadRef"
          :class="{ 'is-return-target': dragOverFan, 'fan-collapsed': fanCollapsed }"
          @dragover="onFanAreaDragOver"
          @dragleave="onFanAreaDragLeave"
          @drop="onFanAreaDrop"
        >
          <div
            v-for="(c, i) in fan" :key="c.id"
            class="spread-card"
            :style="spreadStyle(i, c)"
            @mouseenter="onEnter(c.id)"
            @mouseleave="onLeave"
            @click="pick(c)"
            draggable="true"
            @dragstart="onFanDragStart($event, c.id)"
            @dragend="onFanDragEnd"
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

        <!-- Lower area: PDF panel + scrollable content -->
        <div class="spread-lower" ref="lowerRef" :class="{ 'is-dragging': isDragging }">

        <!-- PDF guide panel (left) -->
        <div class="guide-panel" v-show="showGuide" :style="{ width: guideWidth + '%' }">
          <div class="guide-panel-hd">塔羅教學</div>
          <iframe :src="guideSrc"></iframe>
        </div>

        <!-- Drag divider -->
        <div class="guide-divider" v-show="showGuide" @mousedown="onDividerDown"></div>

        <!-- Scrollable content -->
        <div class="spread-content-scroll">
          <div class="spread-content-inner">

            <!-- Floating toolbar -->
            <div class="toolbar">
              <button class="btn-refresh" @click="drawOne"    :disabled="isComplete">↓ 抽一張</button>
              <button class="btn-refresh" @click="drawAll"    :disabled="isComplete">⊞ 一鍵全抽</button>
              <button class="btn-picker"  @click="openPicker">⊟ 直接取牌</button>
              <button class="btn-range"   :class="{ active: showRangeModal }" @click="showRangeModal = true">
                ◫ {{ rangeTotalLabel }}
              </button>
              <button class="btn-refresh" @click="resetSpread">↺ 重置牌陣</button>
              <button class="btn-guide" :class="{ active: showGuide }" @click="toggleGuide">
                § 開啟教學
              </button>
            </div>

            <!-- Layout -->
            <div class="spread-layout-wrap" v-if="currentSpread">
              <div
                class="spread-layout-container"
                :style="{ height: currentSpread.containerH + 'px' }"
              >
                <div
                  v-for="(pos, i) in currentSpread.positions" :key="pos.id"
                  class="spread-slot"
                  :class="{
                    'is-next':      nextIdx === i,
                    'is-dragging':  dragFromIdx === i,
                    'is-drag-over': dragOverIdx === i,
                  }"
                  :style="{ left: pos.x + '%', top: pos.y + '%' }"
                  :draggable="!!slotCards[i]"
                  @dragstart="onDragStart($event, i)"
                  @dragover="onDragOver($event, i)"
                  @dragleave="onDragLeave(i)"
                  @drop="onDrop($event, i)"
                  @dragend="onDragEnd"
                >
                  <!-- Position label ABOVE card -->
                  <div class="spread-slot-label" v-if="pos.label">{{ pos.label }}</div>

                  <!-- Empty slot box -->
                  <div v-if="!slotCards[i]" class="spread-slot-box">
                    <span class="slot-num">{{ i + 1 }}</span>
                  </div>

                  <!-- Filled slot: flip card -->
                  <div v-else class="sp-flip-card">
                    <div class="sp-flip-inner" :class="{ flipped: slotCards[i].flipped }">
                      <div class="sp-flip-face">
                        <img :src="src('back')" alt="">
                      </div>
                      <div class="sp-flip-face sp-flip-front" :class="{ reversed: slotCards[i].rev }">
                        <img :src="src(slotCards[i].id)" :alt="slotCards[i].en" @error="onImgErr">
                      </div>
                    </div>
                  </div>

                  <!-- Bottom area: fixed height keeps slot size consistent -->
                  <div
                    class="spread-slot-below"
                    :class="{ 'is-filled': slotCards[i] && slotCards[i].flipped }"
                    @click="toggleRev(i)"
                  >
                    <template v-if="slotCards[i] && slotCards[i].flipped">
                      <span class="spread-slot-name">{{ slotCards[i].zh }}</span>
                      <span class="spread-slot-rev" v-if="slotCards[i].rev">逆位</span>
                      <span class="spread-slot-upright" v-else>正位</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Position descriptions -->
            <div class="spread-descs" v-if="currentSpread">
              <div
                v-for="(pos, i) in currentSpread.positions" :key="pos.id"
                class="spread-desc-item"
                :class="{ filled: !!slotCards[i] }"
              >
                <span class="spread-desc-num">{{ i + 1 }}</span>
                <span class="spread-desc-lbl" v-if="pos.label">{{ pos.label }}</span>
                <span class="spread-desc-txt">{{ pos.desc }}</span>
              </div>
            </div>

          </div><!-- end inner -->
        </div><!-- end scroll -->

        </div><!-- end lower -->

      </div><!-- end main -->

      <!-- ── Direct-pick modal ── -->
      <div class="picker-overlay" v-show="showPicker" @click.self="closePicker">
        <div class="picker-modal">
          <div class="picker-header">
            <span>直接取牌</span>
            <small>已選 {{ selectedIds.size }} 張 · 將依序填入空位</small>
          </div>
          <div class="picker-body">
            <div
              v-for="c in availableCards" :key="c.id"
              class="picker-card"
              :class="{ selected: selectedIds.has(c.id) }"
              @click="toggleSelect(c.id)"
            >
              <img :src="src(c.id)" :alt="c.en" @error="onImgErr">
              <div class="p-zh">{{ c.zh }}</div>
            </div>
          </div>
          <div class="picker-footer">
            <button class="btn-cancel"  @click="closePicker">取消</button>
            <button class="btn-confirm" :disabled="selectedIds.size === 0" @click="confirmPick">
              放入 {{ selectedIds.size }} 張
            </button>
          </div>
        </div>
      </div>

      <!-- ── Spread guide modal ── -->
      <div class="intro-overlay" v-if="showIntro" @click.self="showIntro = false">
        <div class="intro-modal">
          <div class="intro-hd">
            <div class="intro-name">牌陣指引</div>
          </div>

          <!-- Category tabs -->
          <div class="intro-cats">
            <button
              v-for="cat in INTRO_CATEGORIES" :key="cat.id"
              class="intro-cat-btn" :class="{ active: introCategory === cat.id }"
              @click="introCategory = cat.id"
            >{{ cat.name }}</button>
          </div>

          <!-- Spread list -->
          <div class="intro-body">
            <div v-for="sp in introSpreads" :key="sp.id" class="intro-spread-block">
              <div class="intro-spread-meta">
                <span class="intro-spread-name">{{ sp.name }}</span>
                <span class="intro-spread-count">{{ sp.count }}張</span>
              </div>
              <div class="intro-spread-tagline">{{ sp.tagline }}</div>
              <div class="intro-pos-list">
                <div v-for="(pos, i) in sp.positions" :key="pos.id" class="intro-pos">
                  <div class="intro-pos-num">{{ i + 1 }}</div>
                  <div class="intro-pos-info">
                    <div class="intro-pos-label" v-if="pos.label">{{ pos.label }}</div>
                    <div class="intro-pos-desc">{{ pos.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="intro-ft">
            <button class="btn-cancel" @click="showIntro = false">關閉</button>
          </div>
        </div>
      </div>

      <!-- ── Card range modal ── -->
      <div class="range-overlay" v-if="showRangeModal" @click.self="showRangeModal = false">
        <div class="range-modal">
          <div class="range-modal-hd">
            <span class="rm-title">抽牌範圍</span>
            <span class="rm-count">已選 {{ selectedCardIds.size }} / {{ cards.length }} 張</span>
          </div>

          <div class="range-modal-body">
            <div v-for="g in rangeGroupData" :key="g.id" class="rg-group">

              <!-- Group header row -->
              <div class="rg-group-hd">
                <!-- Group checkbox -->
                <button
                  class="rg-checkbox"
                  :class="{ full: isGroupFull(g), partial: isGroupPartial(g) }"
                  @click="toggleGroupRange(g)"
                >
                  <span v-if="isGroupFull(g)">✓</span>
                  <span v-else-if="isGroupPartial(g)">−</span>
                </button>
                <!-- Name + count (click to expand) -->
                <div class="rg-label" @click="toggleRangeExpand(g.id)">
                  <span class="rg-name">{{ g.name }}</span>
                  <span class="rg-count">
                    {{ g.cards.filter(c => selectedCardIds.has(c.id)).length }} / {{ g.cards.length }}張
                  </span>
                </div>
                <!-- Expand toggle -->
                <button class="rg-expand" @click="toggleRangeExpand(g.id)">
                  {{ expandedRangeGroups.has(g.id) ? '▲' : '▼' }}
                </button>
              </div>

              <!-- Individual cards (when expanded) -->
              <div class="rg-cards" v-if="expandedRangeGroups.has(g.id)">
                <div
                  v-for="c in g.cards" :key="c.id"
                  class="rg-card"
                  :class="{ selected: selectedCardIds.has(c.id) }"
                  @click="toggleCardRange(c.id)"
                >{{ c.zh }}</div>
              </div>

            </div>
          </div>

          <div class="range-modal-ft">
            <button class="btn-range-all"  @click="selectAllRange">全選</button>
            <button class="btn-range-none" @click="deselectAllRange">全不選</button>
            <div style="flex:1"></div>
            <button class="btn-cancel" @click="showRangeModal = false">關閉</button>
          </div>
        </div>
      </div>

      <!-- ── Tour overlay ── -->
      <template v-if="showTour && tourRect">
        <div class="tour-mask tour-mask-top"    :style="{ height: tourRect.top + 'px' }"></div>
        <div class="tour-mask tour-mask-bottom" :style="{ top: (tourRect.top + tourRect.height) + 'px' }"></div>
        <div class="tour-mask tour-mask-left"   :style="{ top: tourRect.top + 'px', height: tourRect.height + 'px', width: tourRect.left + 'px' }"></div>
        <div class="tour-mask tour-mask-right"  :style="{ top: tourRect.top + 'px', height: tourRect.height + 'px', left: (tourRect.left + tourRect.width) + 'px' }"></div>
        <div class="tour-hl" :style="{ top: tourRect.top + 'px', left: tourRect.left + 'px', width: tourRect.width + 'px', height: tourRect.height + 'px' }"></div>
        <div class="tour-tooltip" :style="tourTooltipStyle">
          <div class="tour-step-label">{{ tourStep + 1 }} / {{ TOUR_STEPS.length }}</div>
          <div class="tour-tt-title">{{ TOUR_STEPS[tourStep].title }}</div>
          <div class="tour-tt-text">{{ TOUR_STEPS[tourStep].text }}</div>
          <div class="tour-tt-actions">
            <button class="tour-skip" @click="endTour">跳過</button>
            <div style="flex:1"></div>
            <button v-if="tourStep > 0" class="tour-prev" @click="tourPrev">← 上一步</button>
            <button class="tour-next" @click="tourNext">
              {{ tourStep === TOUR_STEPS.length - 1 ? '完成 ✓' : '下一步 →' }}
            </button>
          </div>
        </div>
      </template>

    </div>
  `
}
