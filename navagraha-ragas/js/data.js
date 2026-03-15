// ═══════════════════════════════════════════════════════════════
// NAVAGRAHA CARNATIC RAGA DATA
// Planetary associations based on Muthuswami Dikshitar's Navagraha Kritis
// ═══════════════════════════════════════════════════════════════

window.RAGA_DATA = {
  planets: [
    {
      id: "surya",
      name: "Surya",
      english: "Sun",
      symbol: "☉",
      raga: "Saurashtra",
      kriti: "Suryamurthe Namosthuthe",
      tala: "Chatusra Dhruva",
      color: "#FF8C00",
      glowColor: "#FFD700",
      zodiac: "Leo (Simha)",
      dayOfWeek: "Sunday",
      element: "Fire",
      quality: "Vitality, Authority, Soul",
      bodySystem: "Cardiovascular, Eyes",
      circadianHour: [6, 7], // Peak hours
      timeLabel: "Dawn – 6:00–7:00 AM",
      timeRange: [6, 8],
      mood: "Illuminating, regal, uplifting",
      swaras: "Sa Ri2 Ga3 Ma1 Pa Dha2 Ni3",
      arohanam: "S R₂ G₃ M₁ P D₂ N₃ Ṡ",
      avarohanam: "Ṡ N₃ D₂ P M₁ G₃ R₂ S",
      melakarta: 28,
      melaName: "Harikambhoji",
      circadianEffect: "Activates the sympathetic nervous system, stimulates cortisol release, energizes the body for the day ahead. Best for morning meditation and focus.",
      healingProperty: "Strengthens eyesight, boosts immunity, treats heart conditions. Aligns solar plexus chakra.",
      description: "Saurashtra is a majestic, sunrise raga full of clarity and warmth. Its notes evoke the golden light of dawn, perfect for invoking the solar deity. The raga is said to restore vitality and confidence.",
      sampleUrl: null, // Web Audio API generated
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "chandra",
      name: "Chandra",
      english: "Moon",
      symbol: "☽",
      raga: "Asaveri",
      kriti: "Chandram Bhaja Manasa",
      tala: "Chatusra Matya",
      color: "#C0C8E8",
      glowColor: "#E8F0FF",
      zodiac: "Cancer (Karka)",
      dayOfWeek: "Monday",
      element: "Water",
      quality: "Mind, Emotions, Nurturing",
      bodySystem: "Lymphatic, Reproductive, Mind",
      circadianHour: [21, 22],
      timeLabel: "Late Night – 9:00–10:00 PM",
      timeRange: [20, 24],
      mood: "Serene, introspective, soothing",
      swaras: "Sa Ri1 Ga2 Ma1 Pa Dha1 Ni2",
      arohanam: "S R₁ G₂ M₁ P D₁ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₁ P M₁ G₂ R₁ S",
      melakarta: 20,
      melaName: "Natabhairavi",
      circadianEffect: "Calms the nervous system, reduces cortisol, promotes melatonin secretion. Ideal for wind-down rituals and pre-sleep meditation.",
      healingProperty: "Soothes anxiety, aids sleep, balances emotions. Activates parasympathetic system. Aligns crown and sacral chakra.",
      description: "Asaveri is a melancholic yet deeply soothing raga. Its komal (soft) notes mirror moonlight on still water. Traditionally performed at night, it invokes peace, surrender, and emotional healing.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "mangala",
      name: "Mangala (Kuja)",
      english: "Mars",
      symbol: "♂",
      raga: "Surati",
      kriti: "Angarakam Ashrayamyaham",
      tala: "Rupaka",
      color: "#CC3300",
      glowColor: "#FF6644",
      zodiac: "Aries & Scorpio",
      dayOfWeek: "Tuesday",
      element: "Fire",
      quality: "Energy, Courage, Action",
      bodySystem: "Muscular, Blood, Adrenal",
      circadianHour: [14, 15],
      timeLabel: "Afternoon – 2:00–3:00 PM",
      timeRange: [12, 15],
      mood: "Vigorous, assertive, powerful",
      swaras: "Sa Ri2 Ga2 Ma1 Pa Dha2 Ni2",
      arohanam: "S R₂ G₂ M₁ P D₂ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₂ P M₁ G₂ R₂ S",
      melakarta: 22,
      melaName: "Kharaharapriya",
      circadianEffect: "Boosts adrenaline, enhances physical performance and mental fortitude. Best during post-lunch dip for re-energizing.",
      healingProperty: "Strengthens blood, improves circulation, treats anemia. Activates root chakra and base energy.",
      description: "Surati combines fiery energy with an undercurrent of devotion. Its bold swaras inspire courage and decisive action. The raga has an assertive yet melodious character, befitting the warrior planet.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "budha",
      name: "Budha",
      english: "Mercury",
      symbol: "☿",
      raga: "Nattakurunji",
      kriti: "Budham Ashrayami",
      tala: "Misra Jhampa",
      color: "#4CAF50",
      glowColor: "#80FF80",
      zodiac: "Gemini & Virgo",
      dayOfWeek: "Wednesday",
      element: "Earth",
      quality: "Intellect, Communication, Skill",
      bodySystem: "Nervous System, Speech, Memory",
      circadianHour: [9, 10],
      timeLabel: "Morning – 9:00–10:00 AM",
      timeRange: [8, 11],
      mood: "Playful, agile, communicative",
      swaras: "Sa Ri2 Ga2 Ma1 Pa Dha1 Ni2",
      arohanam: "S R₂ G₂ M₁ P D₁ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₁ P M₁ G₂ R₂ S",
      melakarta: 22,
      melaName: "Kharaharapriya",
      circadianEffect: "Sharpens neural pathways, enhances memory consolidation and linguistic processing. Best for learning, reading, and creative writing.",
      healingProperty: "Improves speech disorders, enhances cognitive function, aids nervous system disorders. Activates throat chakra.",
      description: "Nattakurunji is a light-footed, playful raga with intricate movement. Its twists and ornaments mirror Mercury's mercurial nature — quick, clever, and joyful. Perfect for mental clarity and wit.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "guru",
      name: "Guru (Brihaspati)",
      english: "Jupiter",
      symbol: "♃",
      raga: "Athana",
      kriti: "Brihaspathe Tarapathe",
      tala: "Tisra Triputa",
      color: "#FFD700",
      glowColor: "#FFF0A0",
      zodiac: "Sagittarius & Pisces",
      dayOfWeek: "Thursday",
      element: "Ether",
      quality: "Wisdom, Expansion, Grace",
      bodySystem: "Liver, Digestion, Higher Mind",
      circadianHour: [18, 19],
      timeLabel: "Dusk – 6:00–7:00 PM",
      timeRange: [17, 20],
      mood: "Expansive, wise, devotional",
      swaras: "Sa Ri2 Ga3 Ma1 Pa Dha2 Ni2",
      arohanam: "S R₂ G₃ M₁ P D₂ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₂ P M₁ G₃ R₂ S",
      melakarta: 29,
      melaName: "Dheerashankarabharana",
      circadianEffect: "Activates parasympathetic response and higher-order thinking. Promotes reflective cognition and spiritual insight as the day transitions to evening.",
      healingProperty: "Supports liver function, boosts optimism, treats depression. Expands awareness and aligns the third eye chakra.",
      description: "Athana is a grand, powerful raga with royal bearing. Its deep resonance and expansive range make it the ideal vehicle for Brihaspati, the teacher of the gods. Inspires wisdom and philosophical thought.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "shukra",
      name: "Shukra",
      english: "Venus",
      symbol: "♀",
      raga: "Paraju (Pharaj)",
      kriti: "Sri Shukra Bhagavantam",
      tala: "Khanda Ata",
      color: "#FF69B4",
      glowColor: "#FFB6C1",
      zodiac: "Taurus & Libra",
      dayOfWeek: "Friday",
      element: "Water",
      quality: "Beauty, Love, Arts, Harmony",
      bodySystem: "Endocrine, Skin, Kidneys",
      circadianHour: [16, 17],
      timeLabel: "Late Afternoon – 4:00–5:00 PM",
      timeRange: [15, 18],
      mood: "Romantic, aesthetic, harmonious",
      swaras: "Sa Ri1 Ga3 Ma1 Pa Dha1 Ni3",
      arohanam: "S R₁ G₃ M₁ P D₁ N₃ Ṡ",
      avarohanam: "Ṡ N₃ D₁ P M₁ G₃ R₁ S",
      melakarta: 51,
      melaName: "Panthuvarali",
      circadianEffect: "Elevates serotonin and dopamine, enhances aesthetic sensitivity and empathy. Ideal for creative arts and deepening relationships.",
      healingProperty: "Balances hormones, beautifies skin, treats kidney issues. Activates heart chakra and higher love.",
      description: "Paraju is a raga of graceful sensuality and refined beauty. Its unique komal-tivra combinations create a bittersweet, longing quality — the sound of Venus contemplating the finest things in existence.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "shani",
      name: "Shani",
      english: "Saturn",
      symbol: "♄",
      raga: "Yadukulakambhoji",
      kriti: "Divakaratanujam Shanaishcharam",
      tala: "Chatusra Eka",
      color: "#6B5B7B",
      glowColor: "#9B7BAB",
      zodiac: "Capricorn & Aquarius",
      dayOfWeek: "Saturday",
      element: "Air",
      quality: "Discipline, Karma, Endurance",
      bodySystem: "Bones, Teeth, Joints, Nervous",
      circadianHour: [23, 0],
      timeLabel: "Midnight – 11:00 PM–1:00 AM",
      timeRange: [22, 2],
      mood: "Solemn, meditative, persevering",
      swaras: "Sa Ri2 Ga3 Ma1 Pa Dha2 Ni2",
      arohanam: "S R₂ G₃ M₁ P D₂ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₂ P M₁ G₃ R₂ S",
      melakarta: 28,
      melaName: "Harikambhoji",
      circadianEffect: "Deepens slow-wave sleep, promotes melatonin regulation, supports cellular repair. Best for deep meditation before sleep.",
      healingProperty: "Strengthens bones and joints, treats chronic ailments. Promotes acceptance and endurance. Root chakra grounding.",
      description: "Yadukulakambhoji is a weighty, meditative raga of deep introspection. Its slow, deliberate movements evoke the patience of Saturn — steady, stern, yet secretly compassionate. A raga for the long night.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "rahu",
      name: "Rahu",
      english: "Rahu (North Node)",
      symbol: "☊",
      raga: "Ramapriya",
      kriti: "Smaramyaham Sadarahum",
      tala: "Rupaka",
      color: "#1A1A4E",
      glowColor: "#4444AA",
      zodiac: "Aquarius (shadow)",
      dayOfWeek: "—",
      element: "Air (Shadow)",
      quality: "Illusion, Obsession, Transformation",
      bodySystem: "Nervous System, Subconscious",
      circadianHour: [3, 4],
      timeLabel: "Pre-Dawn – 3:00–4:00 AM",
      timeRange: [2, 5],
      mood: "Mysterious, transformative, otherworldly",
      swaras: "Sa Ri2 Ga2 Ma2 Pa Dha2 Ni2",
      arohanam: "S R₂ G₂ M₂ P D₂ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₂ P M₂ G₂ R₂ S",
      melakarta: 39,
      melaName: "Jhalavarali",
      circadianEffect: "The 'witching hour' — deep subconscious processing and dream integration. REM sleep is deepest; intuitive insights arise. Do not disrupt unless in deep meditation.",
      healingProperty: "Detoxifies the system, releases subconscious blocks, clears psychic debris. Activates third eye.",
      description: "Ramapriya is an enigmatic, shadowy raga that defies easy categorization. Like Rahu itself, it sits at the boundary between worlds — its tivra madhyam creating a destabilizing yet fascinating tension.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    },
    {
      id: "ketu",
      name: "Ketu",
      english: "Ketu (South Node)",
      symbol: "☋",
      raga: "Shanmukhapriya",
      kriti: "Mahasuram Ketumaham",
      tala: "Rupaka",
      color: "#2D4A2D",
      glowColor: "#66AA66",
      zodiac: "Scorpio (shadow)",
      dayOfWeek: "—",
      element: "Fire (Shadow)",
      quality: "Liberation, Past Karma, Spirituality",
      bodySystem: "Immune, Mystical Perception",
      circadianHour: [4, 5],
      timeLabel: "Brahma Muhurta – 4:00–5:30 AM",
      timeRange: [4, 6],
      mood: "Transcendent, dissolving, liberating",
      swaras: "Sa Ri2 Ga2 Ma2 Pa Dha1 Ni2",
      arohanam: "S R₂ G₂ M₂ P D₁ N₂ Ṡ",
      avarohanam: "Ṡ N₂ D₁ P M₂ G₂ R₂ S",
      melakarta: 56,
      melaName: "Shanmukhapriya",
      circadianEffect: "Brahma Muhurta — the most spiritually potent time. The pineal gland is maximally active. Ideal for sadhana, pranayama, and deep spiritual practice.",
      healingProperty: "Awakens kundalini, clears ancestral patterns, boosts spiritual immunity. Activates crown chakra.",
      description: "Shanmukhapriya has a unique scale that blends earthy and ethereal qualities. Its prati madhyam and komal dhaivat create an otherworldly sound — like dawn breaking over a sacred mountaintop.",
      sampleUrl: null,
      planet_position: { longitude: null, zodiacSign: null, degree: null }
    }
  ],

  timeRagas: [
    { hour: 0, raga: "Yadukulakambhoji", planet: "shani", mood: "Deep slumber, cellular repair" },
    { hour: 1, raga: "Yadukulakambhoji", planet: "shani", mood: "Slow-wave sleep, bone renewal" },
    { hour: 2, raga: "Ramapriya", planet: "rahu", mood: "Deep REM, shadow processing" },
    { hour: 3, raga: "Ramapriya", planet: "rahu", mood: "Mystic hour, subconscious visions" },
    { hour: 4, raga: "Shanmukhapriya", planet: "ketu", mood: "Brahma Muhurta — spiritual peak" },
    { hour: 5, raga: "Shanmukhapriya", planet: "ketu", mood: "Brahma Muhurta — dawn of awareness" },
    { hour: 6, raga: "Saurashtra", planet: "surya", mood: "Solar awakening, cortisol activation" },
    { hour: 7, raga: "Saurashtra", planet: "surya", mood: "Golden hour clarity and vitality" },
    { hour: 8, raga: "Nattakurunji", planet: "budha", mood: "Mental sharpness, creative flow" },
    { hour: 9, raga: "Nattakurunji", planet: "budha", mood: "Peak cognitive performance" },
    { hour: 10, raga: "Nattakurunji", planet: "budha", mood: "Communication and learning" },
    { hour: 11, raga: "Surati", planet: "mangala", mood: "Action, energy accumulation" },
    { hour: 12, raga: "Surati", planet: "mangala", mood: "Midday strength, metabolism peak" },
    { hour: 13, raga: "Surati", planet: "mangala", mood: "Warrior energy, bold decisions" },
    { hour: 14, raga: "Surati", planet: "mangala", mood: "Post-lunch activation, Mars fire" },
    { hour: 15, raga: "Paraju", planet: "shukra", mood: "Aesthetic sensitivity, creativity" },
    { hour: 16, raga: "Paraju", planet: "shukra", mood: "Art, beauty, social harmony" },
    { hour: 17, raga: "Athana", planet: "guru", mood: "Dusk reflection, wisdom gathering" },
    { hour: 18, raga: "Athana", planet: "guru", mood: "Evening expansion, philosophical thought" },
    { hour: 19, raga: "Athana", planet: "guru", mood: "Transition to inner world" },
    { hour: 20, raga: "Asaveri", planet: "chandra", mood: "Emotional release, lunar calming" },
    { hour: 21, raga: "Asaveri", planet: "chandra", mood: "Moon time — introspection" },
    { hour: 22, raga: "Yadukulakambhoji", planet: "shani", mood: "Pre-sleep preparation" },
    { hour: 23, raga: "Yadukulakambhoji", planet: "shani", mood: "Sleep onset, melatonin rise" }
  ],

  zodiacSigns: [
    "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
    "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrischika)",
    "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
  ],

  circadianInfo: {
    title: "The Circadian Clock & Nada Yoga",
    intro: "Ancient Carnatic masters understood that sound vibrations interact with the body's biological rhythms. Each raga, through its specific swara combinations, creates distinct neurological patterns that can be harnessed to support the body's 24-hour circadian cycle.",
    phases: [
      { name: "Brahma Muhurta", time: "4:00–6:00 AM", raga: "Shanmukhapriya", effect: "Pineal gland activation, spiritual perception peak, melatonin drops, serotonin rises" },
      { name: "Surya Kala", time: "6:00–8:00 AM", raga: "Saurashtra", effect: "Cortisol peak, metabolism activation, cardiovascular warm-up" },
      { name: "Budha Kala", time: "8:00–11:00 AM", raga: "Nattakurunji", effect: "Peak cognitive performance, neural firing rate highest, memory encoding optimal" },
      { name: "Mangala Kala", time: "11:00 AM–3:00 PM", raga: "Surati", effect: "Physical energy peak, testosterone high, muscle strength optimal, digestion active" },
      { name: "Shukra Kala", time: "3:00–6:00 PM", raga: "Paraju", effect: "Creative brain waves, serotonin balanced, sensory acuity heightened" },
      { name: "Guru Kala", time: "6:00–8:00 PM", raga: "Athana", effect: "Parasympathetic activation, reflective thinking, social bonding hormones" },
      { name: "Chandra Kala", time: "8:00–11:00 PM", raga: "Asaveri", effect: "Melatonin secretion, core body temperature drops, sleep pressure builds" },
      { name: "Shani Kala", time: "11:00 PM–2:00 AM", raga: "Yadukulakambhoji", effect: "Deep sleep, growth hormone secretion, cellular repair, bone regeneration" },
      { name: "Rahu Kala", time: "2:00–4:00 AM", raga: "Ramapriya", effect: "REM sleep deepest, subconscious integration, intuitive processing" }
    ]
  }
};

// ─── Live Planetary Position Calculator (Simplified Sidereal) ───
window.PlanetCalc = {
  // Approximate sidereal positions based on current date
  // Uses simplified Lahiri ayanamsha correction (~23.85°)
  AYANAMSHA: 23.85,

  getCurrentPositions() {
    const now = new Date();
    const jd = this.dateToJD(now);
    const positions = {};

    // Simplified mean motion calculations (degrees per day from J2000)
    const planets = {
      surya:   { period: 365.25,   base: 280.46 },
      chandra: { period: 27.3217,  base: 218.3165 },
      mangala: { period: 686.97,   base: 355.4 },
      budha:   { period: 87.969,   base: 252.25 },
      guru:    { period: 4332.59,  base: 34.4 },
      shukra:  { period: 224.7,    base: 181.98 },
      shani:   { period: 10759.22, base: 49.95 },
      rahu:    { period: -6793.5,  base: 125.04 }, // retrograde
      ketu:    { period: -6793.5,  base: 305.04 }  // opposite Rahu
    };

    const j2000 = 2451545.0;
    const daysFromJ2000 = jd - j2000;

    for (const [id, data] of Object.entries(planets)) {
      const dailyMotion = 360 / data.period;
      let tropical = (data.base + dailyMotion * daysFromJ2000) % 360;
      if (tropical < 0) tropical += 360;

      // Apply ayanamsha for sidereal
      let sidereal = tropical - this.AYANAMSHA;
      if (sidereal < 0) sidereal += 360;

      const signIndex = Math.floor(sidereal / 30);
      const degree = sidereal % 30;

      positions[id] = {
        longitude: sidereal.toFixed(2),
        degree: degree.toFixed(1),
        signIndex,
        zodiacSign: window.RAGA_DATA.zodiacSigns[signIndex] || "Unknown",
        retrograde: id === 'rahu' || id === 'ketu'
      };
    }

    return positions;
  },

  dateToJD(date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;
    const A = Math.floor((14 - m) / 12);
    const yy = y + 4800 - A;
    const mm = m + 12 * A - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  },

  getCurrentRaga() {
    const hour = new Date().getHours();
    return window.RAGA_DATA.timeRagas[hour];
  }
};
