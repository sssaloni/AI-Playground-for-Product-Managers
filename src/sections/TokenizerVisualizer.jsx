import React, { useState, useEffect } from 'react'
import { Hash, Play, Info, ArrowRight, Binary, Compass, DollarSign, Layers, Sparkles, RefreshCw, HelpCircle, BookOpen, Settings, Check } from 'lucide-react'
import PMInsight from '../components/PMInsight'
import PresenterNotes from '../components/PresenterNotes'
import { useAppStore } from '../store/useAppStore'
const presetTexts = {
  "A product manager builds the roadmap.": [
    { text: "A", id: 317 },
    { text: " product", id: 2432 },
    { text: " manager", id: 5022 },
    { text: " builds", id: 12891 },
    { text: " the", id: 262 },
    { text: " road", id: 4381 },
    { text: "map", id: 2341 },
    { text: ".", id: 13 }
  ],
  "Artificial Intelligence": [
    { text: "Artificial", id: 35282 },
    { text: " Intelligence", id: 18274 }
  ],
  "ChatGPT": [
    { text: "Chat", id: 10452 },
    { text: "G", id: 38 },
    { text: "PT", id: 7291 }
  ],
  "👨🏽‍💻": [
    { text: "👨", id: 125134 },
    { text: "🏽", id: 223 },
    { text: "zwj", id: 9812 },
    { text: "💻", id: 125139 }
  ],
  "Supercalifragilisticexpialidocious": [
    { text: "Super", id: 6241 },
    { text: "cali", id: 1284 },
    { text: "frag", id: 21903 },
    { text: "il", id: 412 },
    { text: "istic", id: 742 },
    { text: "ex", id: 301 },
    { text: "pi", id: 728 },
    { text: "al", id: 261 },
    { text: "id", id: 284 },
    { text: "ocious", id: 28491 }
  ]
}

const colors = [
  'bg-emerald-950/45 text-emerald-300 border-emerald-800/40',
  'bg-cyan-950/45 text-cyan-300 border-cyan-800/40',
  'bg-indigo-950/45 text-indigo-300 border-indigo-800/40',
  'bg-violet-950/45 text-violet-300 border-violet-800/40',
  'bg-purple-950/45 text-purple-300 border-purple-800/40',
  'bg-pink-950/45 text-pink-300 border-pink-800/40',
  'bg-rose-950/45 text-rose-300 border-rose-800/40',
  'bg-amber-950/45 text-amber-300 border-amber-800/40',
]

const vocab = {
  "the": 1,
  "is": 2,
  "a": 3,
  "he": 4,
  "she": 5,
  "in": 7,
  "play": 42,
  "ing": 87,
  "ed": 88,
  "football": 156,
  "park": 203,
  "run": 45,
  "jump": 67
}


// Helper function to build detailed tokenization flow data
const getTokenizationFlowData = (text) => {
  if (!text) return []
  const words = text.trim().split(/\s+/)
  const flow = []
  let seed = 91823
  
  words.forEach((word) => {
    if (!word) return
    let tokens = []
    const lower = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")

    if (lower === "tokenizer") {
      tokens = [
        { text: "token", id: 1357 },
        { text: "##izer", id: 2748 }
      ]
    } else if (lower === "artificial") {
      tokens = [
        { text: "art", id: 1290 },
        { text: "ificial", id: 3912 }
      ]
    } else if (lower === "intelligence") {
      tokens = [
        { text: "intel", id: 820 },
        { text: "ligence", id: 4712 }
      ]
    } else if (lower === "chatgpt") {
      tokens = [
        { text: "chat", id: 10452 },
        { text: "g", id: 38 },
        { text: "pt", id: 7291 }
      ]
    } else if (lower === "manager") {
      tokens = [
        { text: "manager", id: 5022 }
      ]
    } else if (lower === "product") {
      tokens = [
        { text: "product", id: 2432 }
      ]
    } else if (lower === "builds") {
      tokens = [
        { text: "builds", id: 12891 }
      ]
    } else if (lower === "roadmap") {
      tokens = [
        { text: "road", id: 4381 },
        { text: "##map", id: 2341 }
      ]
    } else {
      // General mock BPE splitter
      if (word.length > 5) {
        const mid = Math.floor(word.length / 2)
        const t1 = word.substring(0, mid)
        const t2 = "##" + word.substring(mid)
        tokens = [
          { text: t1, id: Math.floor((seed * 1.3) % 40000) + 1000 },
          { text: t2, id: Math.floor((seed * 1.9) % 40000) + 1000 }
        ]
      } else {
        tokens = [
          { text: word, id: Math.floor((seed * 1.3) % 40000) + 1000 }
        ]
      }
    }

    tokens = tokens.map((token) => {
      const vector = []
      const vectorSize = 3072
      let tSeed = token.id
      for (let i = 0; i < vectorSize; i++) {
        tSeed = (tSeed * 16807) % 2147483647
        const val = ((tSeed % 2000) - 1000) / 1000 // float between -1 and 1
        vector.push(parseFloat(val.toFixed(4)))
      }
      
      return {
        ...token,
        vector
      }
    })
    
    flow.push({
      word,
      tokens
    })
    
    seed = (seed * 17) + 5
  })
  
  return flow
}

// Token Magic parser to split into roots/suffixes
const getTokenMagicData = (text) => {
  if (!text) return []
  const words = text.trim().split(/\s+/)
  const magicTokens = []
  
  const getVocabId = (tokenText) => {
    const clean = tokenText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")
    if (vocab[clean]) return vocab[clean]
    let hash = 0
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash % 999) + 200
  }

  words.forEach((word) => {
    if (!word) return
    // Strip trailing punctuation but keep it visible in display
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")
    const lowerWord = cleanWord.toLowerCase()
    
    let split = null
    const suffixes = ["ing", "ed", "ly", "er", "est", "s"]
    
    if (cleanWord.length > 4) {
      for (const suffix of suffixes) {
        if (lowerWord.endsWith(suffix) && lowerWord.length > suffix.length) {
          const rootText = cleanWord.substring(0, cleanWord.length - suffix.length)
          const suffixText = cleanWord.substring(cleanWord.length - suffix.length)
          split = {
            root: rootText,
            suffix: suffixText
          }
          break
        }
      }
    }

    if (split) {
      const rootId = getVocabId(split.root)
      const suffixId = getVocabId(split.suffix)
      
      magicTokens.push({
        text: split.root,
        type: 'root',
        id: rootId,
        desc: 'Root (meaning)',
        color: 'bg-emerald-500 text-white-force border-emerald-400 dark:bg-emerald-600',
        origWord: cleanWord
      })
      magicTokens.push({
        text: split.suffix,
        type: 'suffix',
        id: suffixId,
        desc: 'Suffix (grammar)',
        color: 'bg-purple-500 text-white-force border-purple-400 dark:bg-purple-600',
        origWord: cleanWord
      })
    } else {
      const id = getVocabId(cleanWord)
      magicTokens.push({
        text: cleanWord,
        type: 'token',
        id: id,
        desc: 'Token',
        color: 'bg-blue-600 text-white-force border-blue-500 dark:bg-blue-700',
        origWord: cleanWord
      })
    }
  })

  return magicTokens
}

const getEmbeddingsAnalysis = (tokenText, originalSentence) => {
  if (!tokenText) return { dimensions: [], similar: [], distant: [], alternatives: [], alternativeIcons: [] }
  const clean = tokenText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim()
  if (!clean) return { dimensions: [], similar: [], distant: [], alternatives: [], alternativeIcons: [] }
  
  // Deterministic seed based on token string hash
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash)
  }
  const absHash = Math.abs(hash)
  
  // Categorize semantic domain dynamically based on keywords or word rules
  let domain = "general"
  
  // Simple regex matching for common fields
  const sportsRegex = /play|run|jog|sprint|jump|kick|throw|ball|football|soccer|golf|tennis|match|game|sport|coach|train|swim|dance|climb|gym/i
  const techRegex = /code|program|develop|software|react|website|web|comput|system|network|logic|data|ai|chatgpt|model|tech|binary|hash|token|digit|science/i
  const buildRegex = /build|create|make|design|craft|product|construct|engine|assemble|ship|buying/i
  const studyRegex = /think|study|learn|understand|theory|exam|read|write|knowledge|intellect|brain|complex|math|class|school|university/i
  const placeRegex = /park|school|home|city|office|house|mountain|river|beach|field|street|room|station|store/i
  
  if (sportsRegex.test(clean)) {
    domain = "sports"
  } else if (techRegex.test(clean)) {
    domain = "tech"
  } else if (buildRegex.test(clean)) {
    domain = "build"
  } else if (studyRegex.test(clean)) {
    domain = "study"
  } else if (placeRegex.test(clean)) {
    domain = "place"
  }
  
  // 1. Dimensions Mapping
  let dims = []
  if (domain === "sports") {
    dims = [
      { label: "Fun / Joyfulness", desc: "Emotional positivity and enjoyment", val: 0.82, color: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Physical Activity", desc: "Movement and bodily engagement", val: 0.91, color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Game / Sport Association", desc: "Connection to competitive activities", val: 0.76, color: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Ongoing Action", desc: "Progressive tense indicator", val: 0.88, color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Frequency / Common Usage", desc: "How often the token appears", val: 0.68, color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' }
    ]
  } else if (domain === "tech") {
    dims = [
      { label: "Technical / Programming", desc: "Writing and parsing source code", val: 0.94, color: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Mental Effort", desc: "Problem solving and logical execution", val: 0.87, color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Digital / Virtual", desc: "Associated with computer hardware & screen", val: 0.78, color: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Ongoing Action", desc: "Progressive tense indicator", val: 0.85, color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Frequency / Common Usage", desc: "How often the token appears", val: 0.79, color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' }
    ]
  } else if (domain === "build") {
    dims = [
      { label: "Creation / Assembly", desc: "Putting pieces together to construct", val: 0.91, color: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Physical Construct", desc: "Associated with architecture/buildings", val: 0.83, color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Business / Progress", desc: "Incremental value creation", val: 0.79, color: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Ongoing Action", desc: "Progressive tense indicator", val: 0.88, color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Frequency / Common Usage", desc: "How often the token appears", val: 0.72, color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' }
    ]
  } else if (domain === "study") {
    dims = [
      { label: "Mental / Cognitive", desc: "Brainpower and learning processes", val: 0.92, color: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Academic / Formal", desc: "Associated with schools and exams", val: 0.85, color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Abstract Concepts", desc: "Non-physical ideas and models", val: 0.89, color: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Ongoing Action", desc: "Progressive tense indicator", val: 0.76, color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Frequency / Common Usage", desc: "How often the token appears", val: 0.81, color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' }
    ]
  } else if (domain === "place") {
    dims = [
      { label: "Spatial / Location", desc: "Physical place or geographical coordinate", val: 0.88, color: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Natural Elements", desc: "Associated with trees, grass, outdoors", val: 0.74, color: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Social Activity", desc: "Human gathering or community density", val: 0.81, color: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Ongoing Action", desc: "Progressive tense indicator", val: 0.65, color: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Frequency / Common Usage", desc: "How often the token appears", val: 0.73, color: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' }
    ]
  } else {
    // Fully dynamic mapping of pool based on hash
    const dimensionPool = [
      { label: "Abstract / Intellectual", desc: "Conceptual, non-physical nature", color: "bg-purple-500", textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Action / Dynamism", desc: "Bodily movement and operations", color: "bg-emerald-500", textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Technical / Science", desc: "Analytical, logical, or scientific association", color: "bg-blue-500", textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' },
      { label: "Natural / Biological", desc: "Relation to living organisms, plants, animals", color: "bg-amber-500", textClass: 'text-amber-600 dark:text-amber-400', borderClass: 'border-amber-200 dark:border-amber-900/40' },
      { label: "Emotional / Affective", desc: "Positivity, negativity, or sentiment tone", color: "bg-rose-500", textClass: 'text-rose-600 dark:text-rose-400', borderClass: 'border-rose-200 dark:border-rose-900/40' },
      { label: "Social / Interpersonal", desc: "Connection to human collaboration or society", color: "bg-purple-500", textClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-900/40' },
      { label: "Physical / Object-based", desc: "Associated with tangible materials", color: "bg-emerald-500", textClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-900/40' },
      { label: "Size / Scale", desc: "Magnitude, volume, or spatial impact", color: "bg-blue-500", textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-900/40' }
    ]
    
    const pickedIdx = []
    const availableIndices = [0, 1, 2, 3, 4, 5, 6, 7]
    for (let i = 0; i < 3; i++) {
      const selector = (absHash + i * 7) % availableIndices.length
      const idx = availableIndices.splice(selector, 1)[0]
      const val = 0.3 + (((absHash + i * 19) % 65) / 100)
      pickedIdx.push({
        ...dimensionPool[idx],
        val: parseFloat(val.toFixed(2))
      })
    }
    
    pickedIdx.push({
      label: "Grammatical Form",
      desc: "Syntax structure or tense indicator",
      val: parseFloat((0.4 + ((absHash % 45) / 100)).toFixed(2)),
      color: "bg-amber-500",
      textClass: "text-amber-600 dark:text-amber-400",
      borderClass: "border-amber-200 dark:border-amber-900/40"
    })
    pickedIdx.push({
      label: "Common Usage Density",
      desc: "Frequency of appearance in training set",
      val: parseFloat((0.5 + ((absHash % 35) / 100)).toFixed(2)),
      color: "bg-rose-500",
      textClass: "text-rose-600 dark:text-rose-400",
      borderClass: "border-rose-200 dark:border-rose-900/40"
    })
    dims = pickedIdx
  }

  // 2. Similar & Distant Tokens Mapping
  let similar = []
  let distant = []
  if (domain === "sports") {
    similar = [
      { word: "run", dist: 0.12, x: 25, y: -25 },
      { word: "jog", dist: 0.15, x: -35, y: -45 },
      { word: "sprint", dist: 0.18, x: 45, y: 5 }
    ]
    distant = [
      { word: "exam", dist: 0.89, x: 80, y: 70 },
      { word: "sleeping", dist: 0.92, x: -60, y: -80 },
      { word: "theory", dist: 0.95, x: -90, y: 25 }
    ]
  } else if (domain === "tech") {
    similar = [
      { word: "programming", dist: 0.11, x: -20, y: 30 },
      { word: "developer", dist: 0.14, x: 30, y: -25 },
      { word: "debugging", dist: 0.18, x: -40, y: -30 }
    ]
    distant = [
      { word: "nature", dist: 0.87, x: 85, y: 65 },
      { word: "guitar", dist: 0.91, x: -75, y: -65 },
      { word: "swimming", dist: 0.94, x: -90, y: 40 }
    ]
  } else if (domain === "build") {
    similar = [
      { word: "creating", dist: 0.12, x: -30, y: 20 },
      { word: "making", dist: 0.15, x: 25, y: -35 },
      { word: "designing", dist: 0.19, x: -35, y: -35 }
    ]
    distant = [
      { word: "sleeping", dist: 0.88, x: 85, y: 60 },
      { word: "dreaming", dist: 0.92, x: -70, y: -70 },
      { word: "failing", dist: 0.95, x: -90, y: 30 }
    ]
  } else if (domain === "study") {
    similar = [
      { word: "learning", dist: 0.13, x: 20, y: -35 },
      { word: "studying", dist: 0.16, x: -30, y: -20 },
      { word: "analysis", dist: 0.20, x: 35, y: 20 }
    ]
    distant = [
      { word: "dancing", dist: 0.85, x: 75, y: 70 },
      { word: "football", dist: 0.90, x: -60, y: -75 },
      { word: "vacation", dist: 0.94, x: -85, y: 20 }
    ]
  } else if (domain === "place") {
    similar = [
      { word: "garden", dist: 0.14, x: -25, y: 30 },
      { word: "meadow", dist: 0.17, x: 35, y: -20 },
      { word: "forest", dist: 0.21, x: -30, y: -30 }
    ]
    distant = [
      { word: "syntax", dist: 0.89, x: 85, y: 60 },
      { word: "coding", dist: 0.93, x: -70, y: -65 },
      { word: "compiling", dist: 0.96, x: -80, y: 35 }
    ]
  } else {
    // Fallback dynamic words
    const suffix1 = clean.length > 3 ? clean.substring(0, clean.length - 1) + "s" : clean + "s"
    const suffix2 = clean + "er"
    const suffix3 = clean + "ing"
    similar = [
      { word: suffix1, dist: 0.12, x: 25, y: -25 },
      { word: suffix2, dist: 0.15, x: -35, y: -45 },
      { word: suffix3, dist: 0.18, x: 45, y: 5 }
    ]
    distant = [
      { word: "sleep", dist: 0.88, x: 80, y: 70 },
      { word: "theory", dist: 0.91, x: -60, y: -80 },
      { word: "mountain", dist: 0.95, x: -90, y: 25 }
    ]
  }

  // 3. Alternatives Mapping
  let alts = []
  let altIcons = []
  if (domain === "sports") {
    alts = ["playing", "watching", "coaching"]
    altIcons = ["⚽", "📺", "🧑‍🏫"]
  } else if (domain === "tech") {
    alts = ["coding", "designing", "testing"]
    altIcons = ["💻", "🎨", "🧪"]
  } else if (domain === "build") {
    alts = ["building", "buying", "shipping"]
    altIcons = ["🏗️", "💵", "🚢"]
  } else if (domain === "study") {
    alts = ["learning", "cramming", "cheating"]
    altIcons = ["🧠", "📚", "❌"]
  } else if (domain === "place") {
    alts = ["park", "garden", "forest"]
    altIcons = ["🌳", "🏡", "🌲"]
  } else {
    alts = [clean, clean + "er", "doing " + clean]
    altIcons = ["⚙️", "🌀", "🔗"]
  }

  return {
    dimensions: dims,
    similar,
    distant,
    alternatives: alts,
    alternativeIcons: altIcons
  }
}

export default function TokenizerVisualizer() {
  const { completeSection } = useAppStore()

  // Tabs State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('tokenizer_active_tab') || 'guided')
  // Guided & Custom Tab States
  const [guidedText, setGuidedText] = useState("A product manager builds the roadmap.")
  const [customText, setCustomText] = useState(() => localStorage.getItem('tokenizer_custom_text') || 'Standard SaaS automation tools need optimization.')
  const [tokens, setTokens] = useState([])

  // Tokenization Flow Tab States
  const [tokenizationText, setTokenizationText] = useState(() => localStorage.getItem('tokenization_flow_text') || 'A product manager builds the roadmap.')
  const [selectedDimensions, setSelectedDimensions] = useState(1536)
  const [selectedTokenName, setSelectedTokenName] = useState(null)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)

  // Token Magic Tab States
  const [magicText, setMagicText] = useState(() => localStorage.getItem('tokenizer_magic_text') || 'A product manager builds the roadmap.')
  const [selectedMagicTokenName, setSelectedMagicTokenName] = useState('build')
  const [selectedAltIndex, setSelectedAltIndex] = useState(0)
  // Reset selected alt index when clicked token changes
  useEffect(() => {
    setSelectedAltIndex(0)
  }, [selectedMagicTokenName, magicText])

  // Save tab selection
  useEffect(() => {
    localStorage.setItem('tokenizer_active_tab', activeTab)
  }, [activeTab])

  // Save inputs to localStorage
  useEffect(() => {
    localStorage.setItem('tokenizer_custom_text', customText)
  }, [customText])

  useEffect(() => {
    localStorage.setItem('tokenization_flow_text', tokenizationText)
  }, [tokenizationText])

  useEffect(() => {
    localStorage.setItem('tokenizer_magic_text', magicText)
  }, [magicText])

  const activeInput = activeTab === 'guided' ? guidedText : customText

  // Standard tokenization processing (Guided & Custom tabs)
  useEffect(() => {
    if (presetTexts[activeInput]) {
      setTokens(presetTexts[activeInput])
    } else {
      const words = activeInput.split(/(\s+|\b)/)
      const mockTokens = []
      let seed = 4123
      
      words.forEach((word) => {
        if (!word) return
        
        if (word.length > 8) {
          const mid = Math.floor(word.length / 2)
          const t1 = word.substring(0, mid)
          const t2 = word.substring(mid)
          mockTokens.push({ text: t1, id: Math.floor((seed * 1.5) % 100000) })
          mockTokens.push({ text: t2, id: Math.floor((seed * 2.3) % 100000) })
        } else {
          mockTokens.push({ text: word, id: Math.floor((seed * 1.7) % 100000) })
        }
        seed = (seed * 3) + 7
      })
      setTokens(mockTokens)
    }
  }, [activeInput])

  const tokenCount = tokens.length
  const charCount = activeInput.length
  
  // Cost estimate: GPT-4o input prices: $2.50 per 1M tokens ($0.0000025 per token)
  const costPer100k = (tokenCount * 0.0000025 * 100000).toFixed(4)

  // Context window calculations
  const contextWindow128k = ((tokenCount / 128000) * 100).toFixed(5)
  const contextWindow8k = ((tokenCount / 8192) * 100).toFixed(4)

  // Tokenization flow processing
  const flowData = getTokenizationFlowData(tokenizationText)
  const flatTokens = flowData.flatMap(f => f.tokens)

  // Autoselect first token for inspector
  useEffect(() => {
    if (flatTokens.length > 0 && (!selectedTokenName || !flatTokens.some(t => t.text === selectedTokenName))) {
      setSelectedTokenName(flatTokens[0].text)
    }
  }, [flatTokens, selectedTokenName])

  const selectedTokenObject = flatTokens.find(t => t.text === selectedTokenName) || flatTokens[0]

  // Neural network training timer simulation
  useEffect(() => {
    let interval = null
    if (isTraining) {
      interval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 100) {
            setIsTraining(false)
            return 100
          }
          return prev + 4
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isTraining])

  const handleStartTraining = () => {
    setTrainingProgress(0)
    setIsTraining(true)
  }

  // Visual vectors coordinates for Step 4
  const vectorAngleA = 60 // constant angle for comparison vector A
  const initialAngleB = 140
  const targetAngleB = 72
  const currentAngleB = initialAngleB - (initialAngleB - targetAngleB) * (trainingProgress / 100)
  
  const originX = 150
  const originY = 170
  const vectorLength = 100

  const coordAX = originX + Math.cos(vectorAngleA * Math.PI / 180) * vectorLength
  const coordAY = originY - Math.sin(vectorAngleA * Math.PI / 180) * vectorLength

  const coordBX = originX + Math.cos(currentAngleB * Math.PI / 180) * vectorLength
  const coordBY = originY - Math.sin(currentAngleB * Math.PI / 180) * vectorLength

  // Cosine Similarity score
  const cosineSim = Math.cos((currentAngleB - vectorAngleA) * Math.PI / 180).toFixed(3)

  // Token Magic process details
  const magicTokens = getTokenMagicData(magicText)

  // Auto-select magic token for dimensions explanation
  useEffect(() => {
    if (magicTokens.length > 0 && !magicTokens.some(t => t.text === selectedMagicTokenName)) {
      setSelectedMagicTokenName(magicTokens[0].text)
    }
  }, [magicTokens, selectedMagicTokenName])

  const selectedMagicToken = magicTokens.find(t => t.text === selectedMagicTokenName) || magicTokens[0]

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Tokenizer Visualizer</h2>
        <p className="text-zinc-400 text-lg mt-1">
          How does an LLM read text? Computers process numbers, not letters.
        </p>

        <PresenterNotes 
          notes="Explain Byte Pair Encoding (BPE). Show that English text averages ~4 characters per token. Emojis and languages like Hindi, Japanese, or Arabic require far more tokens per word, leading to higher costs and latency. In addition, trailing spaces or capitalizations can double token usage."
          exercise="Click the '👨🏽‍💻' (Developer Emoji) preset. Point out that a single emoji requires 4 tokens. Ask: 'If your customer is typing in emojis, are you paying more?' Yes. Let them type custom words in the text box."
        />

        {/* Concept Explanation Block */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-brandPurple bg-brandPurple/10 border border-brandPurple/20 px-2 py-0.5 rounded w-fit">
            Concept Explanation & Unified Example
          </h3>
          <p className="text-zinc-300 text-sm mt-3 leading-relaxed">
            <strong>Tokenization:</strong> AI models cannot process letters or words directly. They require text to be split into smaller, numerical chunks called <strong>Tokens</strong>. These are looked up in a vocabulary index (mapping string fragments to unique integer <strong>Token IDs</strong>). A common BPE (Byte Pair Encoding) tokenizer splits less frequent words (like "roadmap" into "road" + "map").
          </p>
          <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">
              <strong>Unified Example:</strong> <span className="font-mono text-zinc-200">"A product manager builds the roadmap."</span> splits as:
            </span>
            <span className="text-brandPurple font-mono font-semibold">
              ["A", " product", " manager", " builds", " the", " road", "map", "."]
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit mt-6 gap-1">
          <button
            onClick={() => setActiveTab('guided')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guided' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Guided Example
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'custom' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Try Your Own
          </button>
          <button
            onClick={() => setActiveTab('tokenization')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tokenization' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tokenization Flow
          </button>
          <button
            onClick={() => setActiveTab('magic')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'magic' ? 'bg-brandPurple text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Token Magic 🌟
          </button>
        </div>

        {activeTab === 'guided' && (
          /* Presets */
          <div className="flex flex-wrap gap-2 mt-6">
            {Object.keys(presetTexts).map((preset) => (
              <button
                key={preset}
                onClick={() => setGuidedText(preset)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  guidedText === preset
                    ? 'border-brandPurple bg-brandPurple text-white'
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          /* Input box */
          <div className="mt-6">
            <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block mb-2">Custom Text Input</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type custom text to tokenize..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:ring-1 focus:ring-brandPurple"
            />
          </div>
        )}

        {activeTab === 'tokenization' && (
          /* Tokenization Educational tab inputs */
          <div className="mt-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block mb-2">
                Enter Word or Sentence to trace:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenizationText}
                  onChange={(e) => setTokenizationText(e.target.value)}
                  placeholder="e.g. Tokenizer"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
                />
                <button
                  onClick={() => setTokenizationText('Tokenizer')}
                  className="px-3 py-2 text-xs font-bold border border-zinc-805 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Example
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['Tokenizer', 'Artificial Intelligence', 'ChatGPT', 'Product Manager'].map(p => (
                <button
                  key={p}
                  onClick={() => setTokenizationText(p)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    tokenizationText === p
                      ? 'border-brandPurple bg-brandPurple text-white'
                      : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'magic' && (
          /* Token Magic prompt input */
          <div className="mt-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[280px]">
              <label className="text-xs text-zinc-400 font-mono uppercase font-semibold block mb-2">
                Trace End-to-End Sentence Flow:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={magicText}
                  onChange={(e) => setMagicText(e.target.value)}
                  placeholder="Type any sentence to break down..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brandPurple"
                />
                <button
                  onClick={() => setMagicText('He is playing football in the park.')}
                  className="px-3 py-2 text-xs font-bold border border-zinc-805 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-colors cursor-pointer"
                >
                  Default Example
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['He is playing football in the park.', 'She is building complex products quickly.', 'ChatGPT creates neural networks.'].map(s => (
                <button
                  key={s}
                  onClick={() => setMagicText(s)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    magicText === s
                      ? 'border-brandPurple bg-brandPurple text-white'
                      : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s.length > 30 ? s.substring(0, 28) + '...' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Display Grid */}
        {activeTab === 'guided' || activeTab === 'custom' ? (
          /* Standard Token Breakdown grid */
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Visual box */}
            <div className="md:col-span-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Visual Token Breakdown
                </span>
                
                {/* Token blocks */}
                <div className="mt-4 flex flex-wrap gap-2 p-5 bg-zinc-950 rounded-xl border border-zinc-800 min-h-[160px] content-start">
                  {tokens.map((token, index) => {
                    const colorClass = colors[index % colors.length]
                    return (
                      <div 
                        key={index}
                        className={`px-3 py-2 rounded-lg border font-mono text-sm flex flex-col items-center select-none ${colorClass}`}
                      >
                        <span className="font-bold border-b border-white/10 pb-0.5 mb-1 px-1">
                          {token.text === " " ? "␣" : token.text === "\t" ? "⇥" : token.text}
                        </span>
                        <span className="text-[10px] opacity-75">#{token.id}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 text-xs text-zinc-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-brandCyan" />
                <span>Hover over tokens to see exact string matches. Emojis and punctuation split into byte representations.</span>
              </div>
            </div>

            {/* Stats Box */}
            <div className="md:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">
                  Token Metrics
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block">Characters</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{charCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block">Tokens</span>
                    <span className="text-2xl font-bold text-brandPurple mt-1 block">{tokenCount}</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block text-center">Cost Estimate (100k Prompts)</span>
                    <span className="text-xl font-bold text-brandCyan text-center block">${costPer100k}</span>
                    <span className="text-[9px] text-zinc-500 text-center block">Based on GPT-4o input rates ($2.50/1M tokens)</span>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-2.5 space-y-1">
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block text-center">Context Window Usage</span>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-300">
                      <span>128K window:</span>
                      <span className="text-brandPurple font-semibold">{contextWindow128k}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-300">
                      <span>8K window:</span>
                      <span className="text-brandCyan font-semibold">{contextWindow8k}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 text-[10px] text-zinc-500 flex justify-between font-mono">
                <span>Ratio:</span>
                <span>{(charCount / (tokenCount || 1)).toFixed(2)} chars/token</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'tokenization' ? (
          /* Tokenization End-to-End visual workflow */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Flow steps */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Step 1: Tokenize Input Text */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</div>
                    <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Tokenize Input Text</span>
                  </div>
                  
                  <div className="text-xs text-zinc-500 mb-3">
                    Computers do not read words as strings. We first segment the raw text into sub-word pieces (Tokens).
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
                    <div className="text-xs font-mono text-zinc-500 border-b border-zinc-900 pb-2">
                      Raw Text: <span className="text-zinc-200">"{tokenizationText}"</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {flowData.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1 border border-zinc-900 bg-zinc-900/20 px-2 py-1.5 rounded-lg">
                          <span className="text-xs text-zinc-500 font-mono">{f.word}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-600" />
                          <div className="flex gap-1.5">
                            {f.tokens.map((tok, tIdx) => (
                              <span 
                                key={tIdx} 
                                onClick={() => setSelectedTokenName(tok.text)}
                                className={`px-2 py-0.5 rounded text-xs font-semibold font-mono border cursor-pointer transition-all ${
                                  selectedTokenName === tok.text
                                    ? 'bg-brandPurple border-brandPurple text-white-force scale-105 shadow-md'
                                    : 'bg-brandPurple/10 border-brandPurple/20 text-brandPurple hover:bg-brandPurple/20'
                                }`}
                              >
                                {tok.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 2: Map to Unique ID */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">2</div>
                    <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Map each token to a unique ID</span>
                  </div>

                  <div className="text-xs text-zinc-500 mb-3">
                    Each token string corresponds to a specific integer key in the model's vocabulary file (e.g. Tiktoken cl100k_base).
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-wrap gap-2">
                    {flatTokens.map((tok, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedTokenName(tok.text)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-all ${
                          selectedTokenName === tok.text
                            ? 'border-brandCyan bg-brandCyan/10 text-brandCyan scale-105'
                            : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-zinc-200">"{tok.text}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-mono text-xs font-bold text-brandCyan bg-brandCyan/5 border border-brandCyan/20 px-2 py-0.5 rounded">
                          #{tok.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Map to n-Dimensional Vector */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brandPurple/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brandPurple/10 text-brandPurple font-mono text-xs flex items-center justify-center font-bold">3</div>
                      <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Map IDs to Dense Vectors</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono">Dimensions:</span>
                      <select 
                        value={selectedDimensions} 
                        onChange={(e) => setSelectedDimensions(Number(e.target.value))}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-[11px] font-mono text-brandCyan focus:outline-none"
                      >
                        <option value={1536}>1536 (text-embedding-3-small)</option>
                        <option value={3072}>3072 (text-embedding-3-large)</option>
                        <option value={1024}>1024 (cohere-embed-v3)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 mb-3">
                    An embedding maps each token ID to an N-dimensional floating point coordinates vector. Hover/click tokens to view values.
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-4">
                    {/* Heatmap visualization of selected token vector */}
                    {selectedTokenObject && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Vector representation for: <strong className="text-brandPurple">"{selectedTokenObject.text}"</strong></span>
                          <span className="text-brandCyan font-semibold">{selectedDimensions} dimensions</span>
                        </div>
                        
                        {/* Heatmap Grid of coordinates */}
                        <div className="grid grid-cols-12 md:grid-cols-24 gap-1 p-2 bg-zinc-900/40 border border-zinc-900 rounded-lg">
                          {selectedTokenObject.vector.slice(0, 48).map((val, idx) => {
                            // Map positive to red-purple tones, negative to blue-cyan tones
                            const colorVal = Math.round(Math.abs(val) * 255)
                            const style = val > 0 
                              ? { backgroundColor: `rgba(139, 92, 246, ${Math.abs(val) * 0.95})` }
                              : { backgroundColor: `rgba(6, 182, 212, ${Math.abs(val) * 0.95})` }
                            
                            return (
                              <div 
                                key={idx} 
                                className="aspect-square rounded-[2px] cursor-pointer hover:ring-1 hover:ring-white transition-all relative group"
                                style={style}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-200 font-mono px-1.5 py-0.5 rounded shadow-xl pointer-events-none z-50 whitespace-nowrap">
                                  Dim {idx}: {val}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono px-1">
                          <span>Dim 0</span>
                          <span>Heatmap slice (First 48 dimensions)</span>
                          <span>Dim 47</span>
                        </div>

                        {/* Floating point values list */}
                        <div className="border-t border-zinc-900 pt-3">
                          <span className="text-[10px] uppercase font-mono text-zinc-500 block mb-1">Vector Coordinates Float Array:</span>
                          <div className="bg-zinc-900/40 rounded-lg p-2.5 max-h-24 overflow-y-auto font-mono text-[10px] text-zinc-400 break-words leading-relaxed select-text">
                            [
                            {selectedTokenObject.vector.slice(0, 30).map((v, i) => (
                              <span key={i} className="text-emerald-400 mx-0.5">
                                {v}
                                {i < 29 ? ',' : ''}
                              </span>
                            ))}
                            <span className="text-zinc-600"> ... + {selectedDimensions - 30} more dimensions </span>
                            ]
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Visualization & Similarity training */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Step 4: Train Network & Alignment */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brandAmber/10 text-brandAmber font-mono text-xs flex items-center justify-center font-bold">4</div>
                        <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Semantic Vector Alignment</span>
                      </div>
                      
                      <div className="text-[10px] font-mono bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400">
                        2D Projection space
                      </div>
                    </div>

                    <div className="text-xs text-zinc-500 mb-3">
                      Before training, token coordinates point in arbitrary directions. During training, words used in similar contexts align their vector arrows closer.
                    </div>

                    {/* SVG Vector Plot */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      <svg width="240" height="220" viewBox="0 0 300 240" className="overflow-visible">
                        {/* Axes */}
                        <line x1="150" y1="20" x2="150" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3,3" />
                        <line x1="20" y1="170" x2="280" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="3,3" />
                        
                        {/* Grid lines */}
                        <circle cx={originX} cy={originY} r="100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                        <circle cx={originX} cy={originY} r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                        {/* Origin Center point */}
                        <circle cx={originX} cy={originY} r="3" fill="#ffffff" />
                        
                        {/* Vector A (Comparison Base) */}
                        <line 
                          x1={originX} 
                          y1={originY} 
                          x2={coordAX} 
                          y2={coordAY} 
                          stroke="#06b6d4" 
                          strokeWidth="2.5" 
                          markerEnd="url(#arrow-cyan)" 
                        />
                        <text x={coordAX + 10} y={coordAY - 2} fill="#06b6d4" fontSize="10" className="font-mono font-bold">
                          "{flatTokens[0]?.text || 'Token'}"
                        </text>

                        {/* Vector B (Moving comparison) */}
                        <line 
                          x1={originX} 
                          y1={originY} 
                          x2={coordBX} 
                          y2={coordBY} 
                          stroke="#8b5cf6" 
                          strokeWidth="2.5" 
                          markerEnd="url(#arrow-purple)" 
                        />
                        <text x={coordBX - 20} y={coordBY - 8} fill="#8b5cf6" fontSize="10" className="font-mono font-bold">
                          "{flatTokens[1]?.text || 'Tokenizer'}"
                        </text>

                        {/* Vector Definition Markers */}
                        <defs>
                          <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                          </marker>
                          <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
                          </marker>
                        </defs>
                      </svg>

                      {/* Similarity scoreboard */}
                      <div className="w-full flex items-center justify-between border-t border-zinc-900 pt-3 mt-1 text-xs font-mono">
                        <span className="text-zinc-500">Cosine Similarity:</span>
                        <span className={`font-bold transition-all px-2 py-0.5 rounded ${
                          cosineSim > 0.9 
                            ? 'text-brandGreen bg-brandGreen/10' 
                            : cosineSim > 0.5 
                              ? 'text-brandAmber bg-brandAmber/10' 
                              : 'text-brandCyan bg-brandCyan/10'
                        }`}>
                          {cosineSim} {cosineSim > 0.9 ? '(High similarity)' : '(Low similarity)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      onClick={handleStartTraining}
                      disabled={isTraining}
                      className="w-full py-2.5 bg-brandAmber text-white text-xs font-bold rounded-xl hover:bg-brandAmber/90 glow-amber transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{isTraining ? 'Training Neural Net...' : 'Train Neural Network (Align Vectors)'}</span>
                    </button>
                    
                    {trainingProgress > 0 && (
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-brandAmber h-full transition-all duration-75"
                          style={{ width: `${trainingProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 5: Cost metrics & Dimensions comparison */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brandCyan/10 text-brandCyan font-mono text-xs flex items-center justify-center font-bold">5</div>
                    <span className="text-xs text-zinc-400 font-mono uppercase font-semibold">Vector Embedding Costs</span>
                  </div>

                  <div className="text-xs text-zinc-500">
                    High dimensions mean higher model accuracy, but increase vector storage costs, CPU calculation times, and indexing delays.
                  </div>

                  <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-2">
                      <span className="text-zinc-500 font-mono">Model Type</span>
                      <span className="text-zinc-500 font-mono">Dimensions</span>
                      <span className="text-zinc-500 font-mono">Cost / 1M Tokens</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-semibold">text-embedding-3-small</span>
                      <span className="font-mono text-zinc-500">1,536</span>
                      <span className="font-mono text-brandGreen font-bold">$0.02</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-semibold">text-embedding-3-large</span>
                      <span className="font-mono text-zinc-500">3,072</span>
                      <span className="font-mono text-brandCyan font-bold">$0.13</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-semibold">Ada-002 (Legacy)</span>
                      <span className="font-mono text-zinc-500">1,536</span>
                      <span className="font-mono text-brandAmber font-bold">$0.10</span>
                    </div>

                    <div className="flex justify-between items-center text-xs opacity-60">
                      <span className="text-zinc-400">text-davinci-003 (2022)</span>
                      <span className="font-mono text-zinc-500">1,536</span>
                      <span className="font-mono text-red-400">$20.00</span>
                    </div>
                  </div>
                  
                  <div className="bg-brandPurple/5 border border-brandPurple/20 rounded-xl p-3 text-[10px] font-mono text-brandPurple leading-relaxed">
                    🌟 <strong>Instructor Tip:</strong> Emphasize how embedding costs dropped 1,000x over 2 years, enabling production-grade semantic search (RAG) at scale for simple startup projects.
                  </div>
                </div>

              </div>
              
            </div>
          </div>
        ) : (
          /* Token Magic visual workflow */
          <div className="mt-6 space-y-8 animate-fadeIn">
            
            {/* Step 1: Original Sentence & Tokenization Process */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">Original Sentence</span>
              <div className="bg-white text-zinc-900 border border-zinc-200 rounded-2xl px-8 py-4 text-center font-semibold text-lg md:text-xl shadow-md max-w-2xl w-full">
                {magicText}
              </div>
              
              <div className="my-4 flex justify-center text-brandPurple animate-bounce">
                <ArrowRight className="w-6 h-6 rotate-90" />
              </div>

              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-3">Tokenization Process</span>
              
              <div className="flex flex-wrap justify-center gap-2.5 p-5 bg-zinc-950/60 rounded-xl border border-zinc-850 w-full max-w-4xl">
                {magicTokens.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 select-none">
                    <span 
                      onClick={() => setSelectedMagicTokenName(t.text)}
                      className={`px-4 py-2.5 rounded-xl font-bold font-mono text-sm border shadow transition-all cursor-pointer ${t.color} ${
                        selectedMagicTokenName === t.text ? 'ring-2 ring-brandPurple/40 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      {t.text}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">{t.desc}</span>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-4xl mt-3 flex justify-center text-xs font-mono py-2 bg-brandPurple/5 border border-brandPurple/10 rounded-lg">
                <span className="text-zinc-400">
                  <strong className="text-brandGreen">Roots</strong> carry the core meaning, while <strong className="text-brandPurple">suffixes</strong> add grammatical context.
                </span>
              </div>

              {/* Why Tokens Matter to You panel */}
              <div className="mt-6 w-full max-w-4xl bg-zinc-950 p-5 rounded-2xl border border-zinc-800 relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Why Tokens Matter to You</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                    <div>
                      <span className="text-brandAmber font-bold text-sm block mb-1">4K Tokens ≈ 3K Words</span>
                      <span className="text-[11px] text-zinc-400 leading-relaxed block">
                        When an API says it supports "4,000 tokens", that's roughly 3,000 words. Tokens are smaller units than words because common words get split into pieces.
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between">
                    <div>
                      <span className="text-brandAmber font-bold text-sm block mb-1">Cost & Limits</span>
                      <span className="text-[11px] text-zinc-400 leading-relaxed block">
                        APIs charge per token, not per word. The word "{selectedMagicToken?.origWord || 'playing'}" = 2 tokens ("{selectedMagicToken?.text || 'play'}" + suffix). Understanding tokenization helps estimate costs.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850 text-[10px] text-center font-mono text-zinc-500">
                  Rule of thumb: <strong className="text-zinc-400">1 token ≈ 4 characters</strong> in English, or about <strong className="text-zinc-400">¾ of a word</strong>.
                </div>
              </div>
            </div>

            {/* Step 2: Vocabulary Lookup & Token -> ID Matching */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
              <div className="flex justify-center text-brandCyan animate-bounce">
                <ArrowRight className="w-6 h-6 rotate-90" />
              </div>

              <span className="mt-4 px-3 py-1 bg-brandAmber/10 border border-brandAmber/25 text-brandAmber text-[10px] uppercase font-mono font-bold rounded-full mb-2">
                🌐 LLM's Internal Vocabulary
              </span>
              <p className="text-xs text-zinc-400 font-medium text-center mb-4 max-w-md">
                The LLM stores a massive vocabulary database where each token is assigned a unique number (ID).
              </p>

              {/* Vocabulary database container */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 w-full max-w-4xl relative">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500 mb-3">
                  <span>🗄️ Vocabulary Database</span>
                  <span>~50,000+ tokens</span>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border border-zinc-900 bg-zinc-900/20 rounded-xl">
                  {/* Preset tokens lookup */}
                  {['the', 'is', 'a', 'He', 'She', 'play', 'ing', 'ed', 'football', 'park', 'in', 'run', 'jump'].map((wordText, i) => {
                    const id = vocab[wordText.toLowerCase()] || (100 + i * 14)
                    return (
                      <span key={i} className="px-2 py-1 bg-zinc-900 border border-zinc-850 rounded text-xs font-mono text-zinc-400">
                        {wordText} <strong className="text-[10px] text-brandAmber font-bold">#{id}</strong>
                      </span>
                    )
                  })}
                  {/* Plus inject custom typed words to show vocabulary updates */}
                  {magicTokens.filter(t => !['the', 'is', 'a', 'he', 'she', 'play', 'ing', 'ed', 'football', 'park', 'in', 'run', 'jump'].includes(t.text.toLowerCase())).map((t, idx) => (
                    <span key={idx + 20} className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
                      {t.text} <strong className="text-[10px] text-brandAmber font-bold">#{t.id}</strong>
                    </span>
                  ))}
                  <span className="px-2 py-1 text-xs font-mono text-zinc-600">...</span>
                </div>
              </div>

              <div className="my-4 flex justify-center text-brandGreen animate-bounce">
                <ArrowRight className="w-6 h-6 rotate-90" />
              </div>

              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">Token → ID Matching</span>
              <p className="text-xs text-zinc-400 font-medium text-center mb-4 max-w-md">
                Each token from our sentence is matched to its stored number in the vocabulary.
              </p>

              {/* Matching Cards list */}
              <div className="flex flex-wrap justify-center gap-3 p-5 bg-zinc-950/60 rounded-xl border border-zinc-850 w-full max-w-4xl">
                {magicTokens.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-zinc-900/30 border border-zinc-850 rounded-xl p-2.5 min-w-[70px]">
                    <span className="text-xs font-bold font-mono text-zinc-300 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 mb-2">
                      {t.text}
                    </span>
                    <span className="text-[10px] text-zinc-600 mb-1">↓</span>
                    <span className="w-8 h-8 rounded-full bg-brandGreen text-white-force font-bold font-mono text-xs flex items-center justify-center">
                      {t.id}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs font-mono text-zinc-400 py-2 bg-brandGreen/5 border border-brandGreen/10 px-4 rounded-lg">
                💡 The sentence is compiled into: <strong className="text-brandGreen">[{magicTokens.map(t => t.id).join(', ')}]</strong>
              </div>
            </div>

            {/* Step 3: Embeddings flow */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
              <div className="flex justify-center text-brandPurple animate-bounce">
                <ArrowRight className="w-6 h-6 rotate-90" />
              </div>

              <div className="bg-brandPurple/10 border border-brandPurple/20 text-brandPurple rounded-2xl px-6 py-3.5 text-center text-xs font-semibold max-w-lg mb-6 leading-relaxed">
                🤪 But wait... numbers alone don't carry meaning. That's where Step 2: Embeddings comes in!
              </div>

              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">Step 2: Embeddings</span>
              <p className="text-xs text-zinc-400 font-medium text-center mb-4 max-w-md">
                Embedding vectors represent each ID as a spatial coordinate.
              </p>

              {/* Heatmaps/vectors for active tokens */}
              <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-805 p-5 rounded-2xl space-y-4">
                <span className="text-xs font-mono text-zinc-500 block">Vector representations for active tokens:</span>
                
                {magicTokens.map((t, idx) => {
                  const mockMiniVec = []
                  let tSeed = t.id
                  for (let d = 0; d < 12; d++) {
                    tSeed = (tSeed * 16807) % 2147483647
                    mockMiniVec.push(((tSeed % 2000) - 1000) / 1000)
                  }
                  
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-mono text-right text-zinc-400 font-bold truncate">"{t.text}"</span>
                      <div className="flex-1 grid grid-cols-12 gap-1 p-1 bg-zinc-900 rounded-lg">
                        {mockMiniVec.map((val, d) => {
                          const style = val > 0 
                            ? { backgroundColor: `rgba(6, 182, 212, ${Math.abs(val) * 0.9})` }
                            : { backgroundColor: `rgba(139, 92, 246, ${Math.abs(val) * 0.9})` }
                          return (
                            <div 
                              key={d} 
                              className="h-3 rounded-[1px] relative group cursor-pointer hover:ring-1 hover:ring-white transition-all"
                              style={style}
                            >
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-zinc-950 border border-zinc-800 text-[8px] text-zinc-200 px-1 py-0.5 rounded font-mono z-50 pointer-events-none">
                                {val.toFixed(3)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Word -> Token -> Token ID -> Vector Diagram */}
              <div className="mt-8 w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider block text-center mb-6">
                  Word → Token → Token ID → Vector
                </span>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative">
                  
                  {/* Step 1 */}
                  <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl text-center flex flex-col justify-between h-[120px]">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Step 1: Word</span>
                    <span className="text-lg font-bold text-zinc-200 mt-2 block">"{selectedMagicToken?.origWord || 'playing'}"</span>
                    <span className="text-[9px] text-zinc-500 block">Human readable</span>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl text-center flex flex-col justify-between h-[120px] relative">
                    <div className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">→</div>
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Step 2: Tokens</span>
                    <div className="flex justify-center gap-1.5 mt-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                        {selectedMagicToken?.text || 'play'}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Broken into subwords</span>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl text-center flex flex-col justify-between h-[120px] relative">
                    <div className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">→</div>
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Step 3: Token IDs</span>
                    <div className="flex justify-center gap-1.5 mt-2">
                      <span className="px-1.5 py-0.5 rounded bg-brandAmber/20 text-brandAmber text-xs font-mono font-bold">
                        #{selectedMagicToken?.id || 42}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Looked up in vocabulary</span>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl text-center flex flex-col justify-between h-[120px] relative">
                    <div className="hidden md:block absolute -left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">→</div>
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Step 4: Vectors</span>
                    <div className="flex flex-col gap-1 mt-1 font-mono text-[9px] text-zinc-400 bg-zinc-950 p-1 border border-zinc-900 rounded">
                      <span>[0.82, 0.91, 0.76, ...]</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block mt-1">Rich numerical meaning</span>
                  </div>

                </div>

                {/* Summary mapping bar */}
                <div className="mt-5 w-full bg-zinc-900/60 p-3 rounded-lg border border-zinc-850 text-center font-mono text-[11px] text-zinc-400">
                  "{selectedMagicToken?.origWord || 'playing'}" → 
                  <span className="text-emerald-400 mx-1">
                    {selectedMagicToken?.text || 'play'}
                  </span> → 
                  <span className="text-brandAmber mx-1">
                    [{selectedMagicToken?.id || 42}]
                  </span> → 
                  <span className="text-brandCyan mx-1">
                    [[0.82, ...]]
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t border-zinc-900 pt-5">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 font-mono uppercase block mb-1">📇 Token ID Lookup</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      The LLM has a fixed vocabulary (e.g., 50,000 tokens). Each token has a unique ID number. When we tokenize text, we look up each token in this vocabulary to get its ID.
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-300 font-mono uppercase block mb-1">🧱 Embedding Matrix</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      The LLM stores an "embedding matrix" where each row corresponds to a token ID. We use the ID to look up that token's learned vector representation.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Step 3b: What Each Number Represents */}
            {(() => {
              const analysis = getEmbeddingsAnalysis(selectedMagicToken?.text, magicText)
              return (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
                  <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">What Each Number Represents</span>
                  <p className="text-xs text-zinc-400 font-medium text-center mb-6 max-w-lg">
                    Each dimension captures different features mixed together. Hover over token <strong className="text-brandPurple">"{selectedMagicToken?.text}"</strong> to see coordinates.
                  </p>

                  <div className="w-full max-w-4xl space-y-4">
                    {analysis.dimensions.map((dim, idx) => {
                      const barPercent = Math.round(dim.val * 100)
                      return (
                        <div key={idx} className={`p-4 border rounded-2xl space-y-2 bg-zinc-950/45 ${dim.borderClass || 'border-zinc-850'}`}>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <div>
                              <strong className="text-zinc-800 dark:text-zinc-200 font-bold block text-sm">{dim.label}</strong>
                              <span className="text-[10px] text-zinc-505 mt-0.5 block">{dim.desc}</span>
                            </div>
                            <span className={`font-bold text-sm ${dim.textClass || 'text-brandPurple'}`}>{dim.val}</span>
                          </div>

                          <div className="w-full bg-zinc-200 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${dim.color || 'bg-brandPurple'} rounded-full`} 
                              style={{ width: `${barPercent}%` }} 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Step 3c: What Embeddings Really Do */}
            {(() => {
              const analysis = getEmbeddingsAnalysis(selectedMagicToken?.text, magicText)
              
              const plotOriginX = 130
              const plotOriginY = 110
              
              return (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                  <h3 className="text-center text-zinc-800 dark:text-zinc-100 font-extrabold text-lg mb-1">What Embeddings Really Do</h3>
                  <p className="text-center text-xs text-zinc-500 mb-6">
                    Embeddings capture similarity, but they don't predict what comes next
                  </p>

                  <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Similarity columns list */}
                    <div className="md:col-span-6 space-y-5">
                      <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl">
                        <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200 block mb-1">
                          Token <strong className="text-brandCyan">"{selectedMagicToken?.text}"</strong> in Vector Space
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          [{analysis.dimensions.map(d => d.val).join(', ')}, ...]
                        </div>
                      </div>

                      {/* Similar words list */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-450 font-mono font-bold uppercase">
                          <span className="w-4.5 h-4.5 rounded border border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-extrabold font-sans">✓</span>
                          <span>Similar Tokens (Close in Vector Space)</span>
                        </div>
                        {analysis.similar.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-zinc-900/20 px-3 py-2 border border-zinc-900 rounded-lg text-xs">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{s.word}</span>
                            <span className="font-mono text-zinc-550 dark:text-zinc-400 text-[10px]">distance: {s.dist}</span>
                          </div>
                        ))}
                      </div>

                      {/* Distant words list */}
                      <div className="space-y-2">
                        <div className="text-[10px] text-red-655 dark:text-red-400 font-mono font-bold uppercase flex items-center gap-2">
                          <span className="w-4.5 h-4.5 rounded border border-red-500 bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] font-extrabold font-sans">✗</span>
                          <span>Distant Tokens (Far in Vector Space)</span>
                        </div>
                        {analysis.distant.map((d, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-zinc-900/20 px-3 py-2 border border-zinc-900 rounded-lg text-xs">
                            <span className="font-semibold text-rose-600 dark:text-rose-450">{d.word}</span>
                            <span className="font-mono text-zinc-550 dark:text-zinc-400 text-[10px]">distance: {d.dist}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Circular SVG Vector space plot */}
                    <div className="md:col-span-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-900 pt-6 md:pt-0 md:pl-6">
                      <div className="relative w-64 h-64 bg-zinc-900/10 dark:bg-zinc-800/10 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full flex items-center justify-center shadow-inner overflow-visible">
                        <svg width="260" height="220" viewBox="0 0 260 220" className="overflow-visible select-none pointer-events-none">
                          {/* Radial grid circles */}
                          <circle cx={plotOriginX} cy={plotOriginY} r="95" fill="none" className="stroke-zinc-300/60 dark:stroke-zinc-800" strokeWidth="1" />
                          <circle cx={plotOriginX} cy={plotOriginY} r="55" fill="none" className="stroke-zinc-300/60 dark:stroke-zinc-800" strokeWidth="1" />
                          
                          {/* Similar tokens green circles */}
                          {analysis.similar.map((s, idx) => {
                            const cx = plotOriginX + s.x
                            const cy = plotOriginY + s.y
                            return (
                              <g key={idx}>
                                <line x1={plotOriginX} y1={plotOriginY} x2={cx} y2={cy} className="stroke-emerald-500/20" strokeWidth="1" strokeDasharray="3,3" />
                                <circle cx={cx} cy={cy} r="16" fill="#10b981" />
                                <text cx={cx} cy={cy} x={cx} y={cy + 3} fill="#ffffff" fontSize="8" textAnchor="middle" className="font-semibold font-mono text-white-force">
                                  {s.word}
                                </text>
                              </g>
                            )
                          })}

                          {/* Distant tokens red circles */}
                          {analysis.distant.map((d, idx) => {
                            const cx = plotOriginX + d.x
                            const cy = plotOriginY + d.y
                            return (
                              <g key={idx}>
                                <line x1={plotOriginX} y1={plotOriginY} x2={cx} y2={cy} className="stroke-red-500/10" strokeWidth="1" strokeDasharray="3,3" />
                                <circle cx={cx} cy={cy} r="16" fill="#ef4444" />
                                <text cx={cx} cy={cy} x={cx} y={cy + 3} fill="#ffffff" fontSize="8" textAnchor="middle" className="font-semibold font-mono text-white-force">
                                  {d.word}
                                </text>
                              </g>
                            )
                          })}

                          {/* Central blue selected token */}
                          <circle cx={plotOriginX} cy={plotOriginY} r="22" fill="#3b82f6" />
                          <text x={plotOriginX} y={plotOriginY + 3} fill="#ffffff" fontSize="9" textAnchor="middle" className="font-bold font-mono text-white-force">
                            {selectedMagicToken?.text || 'play'}
                          </text>
                        </svg>

                        <div className="absolute bottom-2 text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                          Distance in vector space = Semantic similarity
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })()}

            {/* Step 3d: But Embeddings Have Limits! */}
            {(() => {
              const analysis = getEmbeddingsAnalysis(selectedMagicToken?.text, magicText)
              
              const wordToMask = selectedMagicToken?.origWord || 'playing'
              const escapedWord = wordToMask.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
              const regex = new RegExp(`\\b${escapedWord}\\b`, 'i')
              
              const parts = magicText.split(regex)
              
              return (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold mb-4">
                    ⚠️ But Embeddings Have Limits!
                  </div>
                  <span className="text-xs text-zinc-505 font-mono uppercase tracking-wider mb-4">Consider this sentence:</span>
                  
                  <div className="text-zinc-800 dark:text-zinc-200 bg-zinc-950 border border-zinc-850 px-6 py-5 rounded-2xl font-mono text-center text-base font-semibold max-w-2xl w-full mb-6 shadow-sm select-none">
                    {parts.length > 1 ? (
                      <>
                        {parts[0]}
                        <span className="inline-block px-4 py-1.5 mx-2 bg-brandPurple/10 dark:bg-brandPurple/20 border border-brandPurple/30 rounded-xl text-brandPurple font-extrabold text-sm md:text-base animate-pulse">
                          {analysis.alternatives[selectedAltIndex]}
                        </span>
                        {parts[1]}
                      </>
                    ) : (
                      <span>{magicText.replace(regex, ` [ ${analysis.alternatives[selectedAltIndex]} ] `)}</span>
                    )}
                  </div>

                  {/* 3 Choices list */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-6">
                    {analysis.alternatives.map((alt, idx) => {
                      // Generate unique coordinates slice for each alternative
                      const altId = idx * 23 + 47
                      const altVec = [0.1 + (altId % 7)/10, 0.9 - (altId % 5)/10, 0.4 + (altId % 9)/10]
                      const isActive = selectedAltIndex === idx
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedAltIndex(idx)}
                          className={`p-4 rounded-xl text-center space-y-2.5 cursor-pointer transition-all duration-200 select-none ${
                            isActive 
                              ? 'border-t-4 border-t-red-500 border-x border-b border-zinc-800 dark:border-zinc-800 bg-zinc-900/20 dark:bg-zinc-900/40 ring-1 ring-brandPurple/10' 
                              : 'border border-zinc-850 hover:border-zinc-700 bg-zinc-950/20'
                          }`}
                        >
                          <span className="text-xl block">{analysis.alternativeIcons?.[idx] || '⚙️'}</span>
                          <strong className="text-zinc-800 dark:text-zinc-200 text-sm block font-extrabold">"{alt}"</strong>
                          <div className="text-[10px] font-mono text-zinc-500">
                            [{altVec.map(v => v.toFixed(2)).join(', ')}, ...]
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="w-full max-w-4xl space-y-3">
                    <p className="text-center text-xs font-semibold text-zinc-500">
                      All three words make sense, but which one should the model choose?
                    </p>
                    <div className="bg-red-950/10 border border-red-500/25 p-3 rounded-lg text-center text-[10px] font-mono text-red-600 dark:text-red-400">
                      ❌ <strong>Embeddings alone can't decide!</strong> They only capture similarity, not probability or context-aware predictions.
                    </div>
                    <div className="bg-brandPurple/5 border border-brandPurple/20 p-3 rounded-lg text-center text-[10px] font-mono text-brandPurple leading-relaxed">
                      🌟 <strong>That's where the rest of the LLM comes in:</strong> Attention mechanisms and transformer layers use these embeddings to predict the most likely next token based on the full context.
                    </div>
                  </div>

                </div>
              )
            })()}

          </div>
        )}

        <PMInsight 
          concept="Subword Tokenization (BPE)"
          source="Sennrich et al., 'Neural Machine Translation of Rare Words with Subword Units' (ACL 2016)"
          quote="Subword segmentation (Byte Pair Encoding) is simple and effective. It allows models to handle unseen vocabularies but introduces subtle boundaries where word fragments carry split semantic weights."
          takeaway="PMs must account for tokenization mismatch. Non-English languages suffer from 'Token Inflation' (costing 3-10x more for the same meaning) and security bugs like 'clashing tokens' (e.g., special strings crashing the system). Vocab boundaries also affect prompt-injected JSON validation."
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-4 flex justify-end">
        <button
          onClick={() => completeSection(4)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brandGreen text-white text-sm font-semibold rounded-lg hover:bg-brandGreen/90 glow-green transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mark Section Completed</span>
        </button>
      </div>
    </div>
  )
}
