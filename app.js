const { createApp, ref, onMounted } = Vue

createApp({
  components: { DailyTab, DrawTab, SpreadTab, GalleryTab },

  setup() {
    const tab            = ref('daily')
    const loading        = ref(true)
    const cardExts       = ref({})
    const missingCards   = ref([])
    const showMissing    = ref(false)
    const galleryMounted = ref(false)

    const { watch } = Vue
    watch(tab, val => { if (val === 'gallery') galleryMounted.value = true })

    function detectExt(id) {
      return new Promise(resolve => {
        let i = 0
        function tryNext() {
          if (i >= EXTS.length) { resolve(null); return }
          const img = new Image()
          img.onload  = () => resolve(EXTS[i])
          img.onerror = () => { i++; tryNext() }
          img.src = `cards/${id}.${EXTS[i]}`
        }
        tryNext()
      })
    }

    onMounted(async () => {
      document.title = SITE_CONFIG.siteName

      // 牌卡直接用設定檔的副檔名，只對 back 牌背自動偵測
      const extMap  = {}
      const missing = []

      CARDS.forEach(c => { extMap[c.id] = SITE_CONFIG.cardExt })

      const backExt = await detectExt('back')
      if (backExt) extMap['back'] = backExt
      else missing.push('back')

      cardExts.value     = extMap
      missingCards.value = missing
      loading.value      = false
      if (missing.length > 0) showMissing.value = true
    })

    return { tab, loading, cardExts, missingCards, showMissing, galleryMounted, CARDS, SPREADS,
             siteName: SITE_CONFIG.siteName,
             tutorialMode: SITE_CONFIG.tutorialMode }
  },
}).mount('#app')
