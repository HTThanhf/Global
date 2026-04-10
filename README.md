# 🎮 Platformer Pro

An advanced 2D platformer game built with HTML5 Canvas and modern JavaScript ES6+. Features 100 campaign stages, an AI bot that rates map difficulty, a full-featured map editor, and a global map sharing system.

![Platformer Pro Screenshot](screenshot.png)

## ✨ Features

### 🏆 Campaign Mode (100 Stages)
- **5 Worlds** with 20 stages each
- Progressive difficulty: Easy → Medium → Hard → Expert
- 3-star rating system based on deaths and completion time
- Progress tracking with local storage
- Achievements system

### 🤖 AI Bot Rating System
- Bot auto-plays submitted maps
- Rates difficulty from 1-10 stars
- Verifies maps are completable before upload
- Bot statistics: completion time, death count

### 🛠️ Map Editor
- 20+ tile types including special blocks
- Real-time testing
- Bot verification before upload
- Save/load local maps

### 🌍 Global Map System
- Upload and share custom maps
- Bot-verified difficulty ratings
- Like and play count tracking
- Search and filter by difficulty/rating
- Must beat map before uploading

### 🎨 New Tile Types
1. **Push Block** - Pushes player in direction
2. **Speed Boost** - Temporary speed increase
3. **Ice** - Slippery surface with low friction
4. **Bounce Pad** - Super high jump
5. **Teleport** - Portal system (In/Out)
6. **Crumble** - Breaks after standing on it
7. **Gravity Flip** - Inverts gravity
8. **Wind Up** - Wind pushes player up
9. **Wind Side** - Wind pushes horizontally
10. **Laser H/V** - Instant death beams
11. **Key & Door** - Collect key to unlock
12. **Button** - Toggles blocks on/off

### 👤 User System
- Register/Login with password
- Progress saved per user
- Unlocked skins and achievements
- Stats tracking

### 🎵 Audio
- Synthesized sound effects (Web Audio API)
- Jump, coin, win, die, power-up sounds
- No external assets needed

## 🚀 Getting Started

### Play Online
Visit: [https://yourusername.github.io/platformer-pro](https://yourusername.github.io/platformer-pro)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/platformer-pro.git

# Navigate to project
cd platformer-pro

# Install dependencies (optional, for local server)
npm install

# Start local server
npm start

# Or use Python
python -m http.server 8080

# Or simply open index.html in a browser
```

## 🎯 How to Play

### Controls
| Key | Action |
|-----|--------|
| A / Left Arrow | Move Left |
| D / Right Arrow | Move Right |
| W / Space | Jump / Double Jump |
| Shift | Sprint |
| Escape | Pause |
| R | Restart Level |

### Game Modes
1. **Campaign** - Play through 100 handcrafted stages
2. **Global Maps** - Play user-created maps with bot ratings
3. **Map Editor** - Create and share your own levels
4. **My Maps** - Manage your created maps

### Creating Maps
1. Click "Map Editor" from main menu
2. Select tools from toolbar
3. Place Spawn (👤) and Goal (🚩) points
4. Click "🤖 Verify" to have bot test your map
5. Save and upload to Global Maps

**Note:** Maps must be completed by the AI bot before uploading to ensure they're possible.

## 🏗️ Project Structure

```
platformer-pro/
├── index.html              # Main HTML entry
├── package.json            # NPM configuration
├── README.md               # This file
├── src/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       ├── game.js         # Main game class
│       ├── config.js       # Constants & config
│       └── modules/
│           ├── player.js   # Player physics & logic
│           ├── map.js      # Map system & tiles
│           ├── camera.js   # Camera following
│           ├── editor.js   # Map editor
│           ├── input.js    # Input handling
│           ├── sound.js    # Audio synthesis
│           ├── particles.js # Visual effects
│           ├── physics.js   # Collision detection
│           ├── storage.js   # Data persistence
│           ├── ai-bot.js    # AI bot for rating
│           └── campaign.js  # 100 stage generator
```

## 🤖 AI Bot Algorithm

The bot uses pathfinding and simulation to test maps:

1. **Analysis Phase**
   - Scans map for hazards, special tiles
   - Identifies spawn and goal points
   - Calculates estimated difficulty

2. **Pathfinding**
   - A* algorithm to find route to goal
   - Considers jump distances and hazards

3. **Simulation**
   - Simulates player physics
   - Attempts path multiple times
   - Records deaths and completion time

4. **Rating Formula**
   ```
   Rating = Base(5) + Hazards*0.1 + SpecialTiles*0.05 - Deaths*0.5
   ```

## 🎨 Tile Types Reference

| ID | Name | Description |
|----|------|-------------|
| 1 | Ground | Solid block |
| 2 | Platform | One-way platform |
| 3 | Spike | Instant death |
| 4 | Goal | Level complete |
| 5 | Coin | Collectible |
| 6 | Checkpoint | Save progress |
| 7 | Spawn | Player start |
| 8 | Moving H | Horizontal moving |
| 9 | Moving V | Vertical moving |
| 10 | Jump Pad | Boost jump |
| 11 | Push Block | Pushes player |
| 12 | Speed Boost | Run faster |
| 13 | Ice | Slippery |
| 14 | Bounce Pad | Super jump |
| 15 | Teleport In | Portal entrance |
| 16 | Teleport Out | Portal exit |
| 17 | Crumble | Breaks when stood on |
| 18 | Gravity Flip | Inverts gravity |
| 19 | Wind Up | Updraft |
| 20 | Wind Side | Horizontal wind |
| 21 | Laser H | Horizontal laser |
| 22 | Laser V | Vertical laser |
| 23 | Key | Collect to unlock |
| 24 | Locked Door | Needs key |
| 25 | Button | Toggle blocks |
| 26 | Toggle Block | Switches on/off |

## 🏅 Achievements

- **First Blood** - Die for the first time
- **Coin Collector** - Collect 100 coins
- **Speed Runner** - Complete in under 30s
- **Perfectionist** - No deaths in a level
- **Stage 10/50/100** - Complete campaign milestones
- **Map Creator** - Create your first map
- **Bot Beaten** - Beat an 8+ star rated map

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Edge 80+
- Safari 13+

## 📱 Mobile Support

- Touch controls with virtual joystick
- Responsive UI
- Works on tablets and phones

## 🎮 Performance

- 60 FPS target
- Optimized rendering (culling off-screen tiles)
- Object pooling for particles
- Efficient collision detection (AABB)

## 📝 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Credits

- Built with vanilla JavaScript (no frameworks)
- Web Audio API for synthesized sounds
- LocalStorage for data persistence
- Canvas API for rendering

## 🔮 Future Features

- [ ] Multiplayer racing mode
- [ ] More skins and cosmetics
- [ ] Daily challenges
- [ ] Map comments and reviews
- [ ] World records leaderboard
- [ ] Export maps as JSON

---

Made with ❤️ and ☕ by the Platformer Pro Team
