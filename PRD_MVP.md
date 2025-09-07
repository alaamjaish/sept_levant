# MVP Product Requirements Document
## Arabic Learning Web Application - AI Builder Version
**Purpose:** Step-by-step instructions for AI to build a working MVP  
**Build Time Target:** 2-3 weeks  
**Complexity:** Minimal - Foundation Only

***

## 🚨 **CRITICAL: Working with Non-Technical Founder - READ THIS FIRST!**

**ATTENTION AI:** You are working with a **completely non-technical founder** who needs **extremely detailed explanations** for everything.

### **Communication Requirements:**
- **Assume ZERO technical knowledge** - I don't know what APIs, databases, or code mean
- **Explain every single step** like you're teaching a complete beginner
- **Use step-by-step instructions** like "First, click the blue button on the left side of your screen"
- **Provide exact screenshots locations** - "Look for the button in the top right corner that says..."
- **Give me the exact text to copy/paste** - Don't assume I know how to write code
- **Tell me exactly where to click, what to type, and what I should see** after each action

### **Example of What I Need:**
**Instead of:** "Set up your environment variables"  
**I need:** "1. Look for a file called '.env' in your project folder (it's usually at the top). 2. If you don't see it, right-click in the empty space and select 'New File'. 3. Name it exactly '.env' (don't forget the dot at the beginning). 4. Double-click to open it. 5. Copy and paste this exact text: [provide text]. 6. Press Ctrl+S to save."

### **Remember:**
- I'm not experienced with technology
- I need every button, click, and step explained
- Use simple language - no technical jargon
- Be patient and kind with explanations
- Always tell me what I should expect to see after each step

***

## 🎯 MVP Core Concept
**What We're Building:**
A simple web app where:
1. Students can listen to Arabic audio while reading text
2. Students can record themselves speaking and get automated feedback
3. Teachers can add new content through a simple form
**What We're NOT Building (Yet):**
- ❌ Complex animations
- ❌ Progress tracking
- ❌ Multiple lessons/categories
- ❌ User profiles
- ❌ Fancy UI components
- ❌ Mobile optimization (desktop first)
- ❌ Offline mode
- ❌ Advanced error handling
***
## 🔧 Build Order Instructions for AI
### Phase 1: Basic Foundation (Build This First!)
#### Step 1: Create Project Structure
```
Build a Next.js app with:
- Supabase for database and auth
- Tailwind CSS for basic styling
- One simple color scheme (use default Tailwind colors)
```
#### Step 2: Set Up Supabase Tables (Keep It Simple!)
```sql
-- Just 3 tables for MVP!
1. profiles table:
   - id (uuid)
   - email (text)
   - role (text) -- just 'student' or 'teacher'
2. exercises table:
   - id (uuid)
   - arabic_text (text)
   - audio_url (text)
   - exercise_type (text) -- 'listening' or 'speaking'
   - created_at (timestamp)
3. attempts table (for speaking only):
   - id (uuid)
   - exercise_id (uuid)
   - student_id (uuid)
   - passed (boolean)
   - score (integer)
   - created_at (timestamp)
```
#### Step 3: Create Basic Authentication
```
Requirements:
- Use Supabase Auth (built-in)
- Simple email/password signup
- Login page at /login
- Signup page at /signup
- After login: redirect to /dashboard
- One sign out button
```
**AI Instructions:** "Create the simplest possible auth flow using Supabase. No fancy features, just signup, login, and logout."
***
### Phase 2: Core Pages (Keep Everything Simple!)
#### Step 4: Create Simple Landing Page
```
Build at: /
Components needed:
- One headline: "Learn Arabic by Listening and Speaking"
- One paragraph explaining the method
- Two buttons: "Sign Up" and "Login"
- No animations, no fancy design
- Just center everything and make it readable
```
#### Step 5: Create Dashboard Page
```
Build at: /dashboard
Show:
- Welcome message
- Two big buttons:
  - "Practice Listening" → /listening
  - "Practice Speaking" → /speaking
- If user is teacher, add third button:
  - "Add Content" → /admin
```
***
### Phase 3: Listening Feature (Simplest Version)
#### Step 6: Build Listening Page
```
Build at: /listening
Components:
1. Text display box (shows Arabic text)
2. HTML5 audio player (default browser player is fine)
3. "Next Exercise" button
Functionality:
- Fetch one exercise from database where type='listening'
- Display the Arabic text
- Display audio player with the audio_url
- When clicking "Next", fetch another random exercise
```
**AI Instructions:** "Create a simple page that shows Arabic text and plays audio. Use the default HTML5 audio player. No custom controls needed."
***
### Phase 4: Speaking Feature (Core MVP Functionality)
#### Step 7: Build Speaking Page (Most Important Part!)
```
Build at: /speaking
Components:
1. Arabic text display (big and clear)
2. "Listen" button (plays the example audio)
3. "Record" button (starts/stops recording)
4. Result message area
Basic Flow:
1. Show Arabic text from database
2. User clicks "Listen" to hear correct pronunciation
3. User clicks "Record" and speaks
4. Send audio to Speechmatics API
5. Send transcription to OpenAI/Claude for scoring
6. If score >= 90: show "Success! Next exercise"
7. If score < 90: show "Try again"
```
#### Step 8: Implement Recording (Keep It Basic)
```javascript
// Simplest recording approach:
- Use MediaRecorder API
- Record as webm or wav
- Convert to base64
- Send to your API endpoint
- No fancy UI, just "Recording..." text
```
#### Step 9: Set Up Speechmatics Integration
```
API Endpoint: /api/speechmatics
What it does:
1. Receive audio base64
2. Send to Speechmatics API
3. Return transcribed text
4. That's it!
```
**AI Instructions:** "Create the simplest possible integration with Speechmatics. Just send audio, get text back."
#### Step 10: Set Up LLM Scoring
```
API Endpoint: /api/check-accuracy
What it does:
1. Receive original text and transcribed text
2. Send to OpenAI/Claude with this prompt:
   "Compare these two Arabic texts.
    Original: [text1]
    Spoken: [text2]
    Return only a number 0-100 for accuracy."
3. Return the score
```
***
### Phase 5: Admin Features (Minimal Version)
#### Step 11: Build Simple Admin Page
```
Build at: /admin
Only for teachers!
Form with:
- Text input for Arabic text
- File upload for audio (use Supabase storage)
- Dropdown: "Listening" or "Speaking"
- Submit button
That's it! No editing, no deleting for MVP.
```
**AI Instructions:** "Create a basic form that saves to database. No validation needed except checking if user is a teacher."
***
## 🔧 Technical Specifications (Simplified)
### Essential Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SPEECHMATICS_API_KEY=
OPENAI_API_KEY=
```
### Minimal API Routes Needed
```
/api/exercises/get-one (GET)
/api/exercises/create (POST)
/api/speechmatics (POST)
/api/check-accuracy (POST)
```
### Simple Styling Guide
```css
/* Use only these Tailwind classes for consistency: */
- Container: max-w-4xl mx-auto p-4
- Buttons: bg-blue-500 text-white px-4 py-2 rounded
- Text: text-gray-800 for English, text-3xl for Arabic
- Cards: bg-white shadow rounded p-6
```
***
## ✅ MVP Success Criteria
**It works when:**
1. ✅ User can sign up and log in
2. ✅ User can listen to Arabic with text
3. ✅ User can record their voice
4. ✅ System gives pass/fail based on 90% accuracy
5. ✅ Teacher can add new exercises
6. ✅ Everything saves to database
**It's good enough when:**
- No crashes
- Basic functionality works
- Looks clean (not beautiful, just clean)
- Works on Chrome desktop
***
## ❌ What NOT to Build (Save for Later)
**Do NOT add these in MVP:**
- User profiles with avatars
- Progress tracking
- Lesson organization
- Categories or tags
- Search functionality
- Filters or sorting
- Email notifications
- Password reset
- Social login
- Dark mode
- Animations
- Custom audio players
- Waveform visualizations
- Download features
- Export features
- Analytics
- Admin dashboard
- User management
- Payment integration
***
## 📋 Sample Instructions for AI Builder
### Example Prompt Sequence:
**Prompt 1:**
"Create a Next.js app with Supabase auth. Just basic email/password login and signup pages. Use Tailwind CSS with default styling."
**Prompt 2:**
"Add a simple dashboard that shows two buttons: Practice Listening and Practice Speaking. If the user role is 'teacher', show a third button for Add Content."
**Prompt 3:**
"Create a listening page that fetches one exercise from Supabase and shows Arabic text with an HTML5 audio player. Add a Next button to get another exercise."
**Prompt 4:**
"Create a speaking page that shows Arabic text, has a Listen button for audio playback, and a Record button that uses MediaRecorder API to capture voice."
**Prompt 5:**
"Integrate Speechmatics API to convert the recorded audio to text. Create an API endpoint that handles this."
**Prompt 6:**
"Add OpenAI integration to compare the original text with transcribed text and return an accuracy score. Show success if >= 90%, otherwise show try again."
**Prompt 7:**
"Create a simple admin form for teachers to add new exercises with Arabic text and audio file upload to Supabase storage."
***
## ✅ Definition of Done for MVP
### Core Checklist:
- [ ] Users can create accounts
- [ ] Users can log in/out
- [ ] Landing page exists (even if simple)
- [ ] Listening page plays audio with text
- [ ] Speaking page records voice
- [ ] Speechmatics converts speech to text
- [ ] LLM scores accuracy
- [ ] 90% threshold works
- [ ] Teachers can add content
- [ ] Everything saves to database
### That's It! Ship It!
Once these work, you have an MVP. Don't add anything else until users test these core features.
***
## 🔧 Troubleshooting Guide for AI
**If the AI gets stuck:**
1. **Authentication Issues:**
   - "Just use Supabase's built-in auth UI components"
   - "Skip custom auth logic, use Supabase defaults"
2. **Recording Problems:**
   - "Use the simplest MediaRecorder example from MDN"
   - "Don't worry about audio quality settings"
3. **API Integration Issues:**
   - "Create mock responses first, integrate real APIs later"
   - "Use hardcoded test data to verify the flow works"
4. **Styling Confusion:**
   - "Just center everything with flexbox"
   - "Use default Tailwind colors only"
   - "Make text big enough to read, that's all"
5. **Database Complexity:**
   - "Only create the three tables mentioned"
   - "Don't add foreign keys or complex relationships yet"
***
## 🚀 Post-MVP Iterations
**Only AFTER MVP is working and tested:**
### Iteration 1 (Week 3):
- Better error messages
- Loading states
- Basic mobile responsiveness
### Iteration 2 (Week 4):
- Improve UI appearance
- Add exercise categories
- Simple progress counter
### Iteration 3 (Month 2):
- User progress tracking
- Better admin tools
- Performance optimization
***
## 🎯 Final Instructions for AI Implementation
**The Golden Rules:**
1. **If it works, it's good enough for MVP**
2. **Default components > Custom components**
3. **Hardcode first, make dynamic later**
4. **Test with 3 exercises before building more**
5. **Ship when core flow works, not when perfect**
**Remember:** This MVP is about proving the concept works. Beautiful design, smooth animations, and advanced features come AFTER users validate the core learning experience.
**Success Message:** When a student can hear Arabic, record their voice, and get a pass/fail result - YOU HAVE AN MVP! 🎉