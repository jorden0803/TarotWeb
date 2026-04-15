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
      const allIds  = CARDS.map(c => c.id).concat(['back'])
      const results = await Promise.all(allIds.map(id => detectExt(id).then(ext => ({ id, ext }))))
      const extMap  = {}
      const missing = []
      results.forEach(({ id, ext }) => {
        if (ext) extMap[id] = ext
        else missing.push(id)
      })
      cardExts.value     = extMap
      missingCards.value = missing
      loading.value      = false
      if (missing.length > 0) showMissing.value = true
    })

    return { tab, loading, cardExts, missingCards, showMissing, galleryMounted, CARDS, SPREADS }
  },
}).mount('#app')
