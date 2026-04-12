import { createSlice } from '@reduxjs/toolkit';

// ─────────────────────────── MOCK DATA ────────────────────────────────────────
const MOCK_GUIDES = [
  {
    id: 'gd1',
    authorName: 'Alex Chen',
    authorAvatar: '🎵',
    hobbyId: '1',
    title: 'Beginner Guitar Chord Progressions',
    description: 'Master the 5 essential chord shapes that let you play thousands of songs.',
    content: `Getting started with guitar can feel overwhelming, but here's the secret: just 5 chord shapes unlock thousands of songs.\n\n**The Big 5 Chords:**\n• G Major — The crowd pleaser\n• C Major — The foundation\n• D Major — The bright one\n• E Minor — The emotional one\n• A Minor — The moody one\n\n**Practice Routine (15 min/day):**\n1. Spend 2 minutes on each chord, focusing on clean sound\n2. Practice switching between G→C→D (3 min)\n3. Try the progression: G→Em→C→D — this is used in hundreds of pop songs\n\n**Songs to try first:**\n• "Wonderwall" — Em, G, D, A\n• "Let It Be" — G, D, Em, C\n• "Horse With No Name" — Em, D (just two chords!)\n\n**Tips:**\n• Press close to the fret wire, not on top of it\n• Keep your thumb behind the neck\n• Practice 15 minutes daily rather than 2 hours once a week`,
    readTime: 5,
    likes: 89,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'gd2',
    authorName: 'Jordan Park',
    authorAvatar: '🏅',
    hobbyId: '3',
    title: 'Couch to 5K: A Complete Guide',
    description: 'Go from zero running experience to completing a 5K in 8 weeks.',
    content: `This guide will take you from the couch to running 5K continuously in just 8 weeks.\n\n**Week 1-2: Walk/Run Intervals**\n• Alternate 60s running / 90s walking for 20 minutes\n• Run 3 days per week with rest days between\n• Focus on breathing, not speed\n\n**Week 3-4: Building Endurance**\n• Run 3 min / Walk 1 min, repeat 5 times\n• Add 5 minutes to total workout time\n• Start noticing your comfortable pace\n\n**Week 5-6: Longer Runs**\n• Run 8 min / Walk 1 min, repeat 3 times\n• Try one continuous 15-minute run per week\n• Your body is adapting — trust the process\n\n**Week 7-8: The Home Stretch**\n• Run 20-25 minutes continuously\n• Final week: attempt the full 5K (3.1 miles)\n• Walk breaks are totally fine!\n\n**Essential Tips:**\n• Invest in proper running shoes\n• Hydrate well before and after\n• Slow down — most beginners run too fast\n• Rest days are when you get stronger`,
    readTime: 7,
    likes: 134,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'gd3',
    authorName: 'Sam Rivera',
    authorAvatar: '🎨',
    hobbyId: '4',
    title: 'Oil Painting Basics for Beginners',
    description: 'Everything you need to know to start your oil painting journey.',
    content: `Oil painting is one of the most rewarding art forms. Here's how to get started without breaking the bank.\n\n**Essential Supplies:**\n• 6 basic colors: Titanium White, Cadmium Yellow, Cadmium Red, Alizarin Crimson, Ultramarine Blue, Burnt Umber\n• 3 brushes: flat #8, round #4, filbert #6\n• Odorless mineral spirits for cleaning\n• A palette (glass or disposable paper)\n• Canvas boards (cheaper than stretched canvas)\n\n**Color Mixing Basics:**\n• Yellow + Blue = Green\n• Red + Blue = Purple\n• Add white to lighten (tint)\n• Add burnt umber to darken (shade)\n• Mix complementary colors for natural grays\n\n**Your First Painting Exercise:**\n1. Paint a simple sphere with one light source\n2. Block in the shadow shape first\n3. Build up from dark to light\n4. Blend edges where light meets shadow\n\n**Common Mistakes:**\n• Using too much paint too early\n• Not letting layers dry between sessions\n• Overblending — leave some brushstrokes visible\n• Buying expensive supplies before learning basics`,
    readTime: 6,
    likes: 67,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'gd4',
    authorName: 'Maya Johnson',
    authorAvatar: '📖',
    hobbyId: '2',
    title: 'Best Sci-Fi Books for 2024',
    description: 'A curated list of must-read science fiction for this year.',
    content: `Whether you're a seasoned sci-fi reader or just getting into the genre, these books are worth your time.\n\n**Top Picks:**\n\n📘 **Project Hail Mary** by Andy Weir\nA lone astronaut must save Earth. Funny, smart, and incredibly gripping. Perfect entry point for sci-fi newcomers.\n\n📘 **The Murderbot Diaries** by Martha Wells\nA security robot just wants to watch TV shows but keeps having to save humans. Witty and surprisingly emotional.\n\n📘 **Piranesi** by Susanna Clarke\nA man lives in a mysterious house with infinite halls. Dreamlike and utterly unique.\n\n📘 **Children of Time** by Adrian Tchaikovsky\nSpiders evolve intelligence on a terraformed planet. Sounds weird, reads amazing.\n\n📘 **The Left Hand of Darkness** by Ursula K. Le Guin\nA classic exploring gender and politics on an alien world. Still feels revolutionary.\n\n**Reading Order Tip:**\nStart with Project Hail Mary if you want something accessible, or Piranesi if you want something literary.`,
    readTime: 4,
    likes: 95,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'gd5',
    authorName: 'Taylor Kim',
    authorAvatar: '🍳',
    hobbyId: '5',
    title: 'Meal Prep for Beginners',
    description: 'Save time and eat better with this simple weekly meal prep system.',
    content: `Meal prepping doesn't have to be complicated. Here's a simple system that takes about 2 hours on Sunday.\n\n**The Formula:**\nPick 1 protein + 1 grain + 2 vegetables. Cook in bulk. Mix and match all week.\n\n**Easy Proteins:**\n• Baked chicken thighs (season with salt, pepper, paprika, garlic)\n• Hard-boiled eggs (12 at a time)\n• Black beans or chickpeas (canned is fine!)\n\n**Simple Grains:**\n• Rice (use a rice cooker if you have one)\n• Quinoa (cooks in 15 minutes)\n• Pasta (cook al dente — it'll soften when reheated)\n\n**Vegetable Prep:**\n• Roast a sheet pan of broccoli, sweet potatoes, and bell peppers\n• Make a big batch of slaw or salad (dressing on the side)\n• Steam green beans or snap peas\n\n**Storage Tips:**\n• Glass containers > plastic (no staining, microwave safe)\n• Most meals last 4-5 days refrigerated\n• Label containers with the date\n• Freeze portions you won't eat within 3 days\n\n**Time-Saving Hacks:**\n• Cook rice and roast veggies simultaneously\n• Use the same seasoning base for protein and veggies\n• Prep sauces/dressings in mason jars`,
    readTime: 5,
    likes: 112,
    likedByMe: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// ─────────────────────────── SLICE ────────────────────────────────────────────
const guidesSlice = createSlice({
  name: 'guides',
  initialState: {
    items: MOCK_GUIDES,
    selectedGuideId: null,
  },
  reducers: {
    /**
     * Toggle like on a guide.
     * Payload: guideId (string)
     */
    toggleLikeGuide: (state, action) => {
      const guide = state.items.find((g) => g.id === action.payload);
      if (!guide) return;
      guide.likedByMe = !guide.likedByMe;
      guide.likes += guide.likedByMe ? 1 : -1;
    },

    /**
     * Select a guide for the GuideDetailScreen.
     * Payload: guideId (string | null)
     */
    selectGuide: (state, action) => {
      state.selectedGuideId = action.payload;
    },
  },
});

export const { toggleLikeGuide, selectGuide } = guidesSlice.actions;
export default guidesSlice.reducer;

// ─────────────────────────── SELECTORS ────────────────────────────────────────
export const selectAllGuides = (state) => state.guides.items;
export const selectSelectedGuideId = (state) => state.guides.selectedGuideId;
export const selectGuideById = (id) => (state) =>
  state.guides.items.find((g) => g.id === id);
