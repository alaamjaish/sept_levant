<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Student Speaking Section</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&amp;family=Noto+Sans+Arabic:wght@400;500;700&amp;family=Space+Grotesk:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
<style type="text/tailwindcss">
        :root {
            --background-dark: #101d23;
            --surface-dark: #1a2c38;
            --border-dark: #223c49;
            --accent-blue: #0da6f2;
            --accent-blue-hover: #0a8cd9;
            --text-primary: #ffffff;
            --text-secondary: #ffffffb3;
        }
    </style>
</head>
<body class="bg-[var(--background-dark)]" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
<div class="flex h-screen flex-col bg-[var(--background-dark)] text-[var(--text-primary)]">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--border-dark)] px-10 py-3">
<div class="flex items-center gap-4">
<div class="size-6 text-[var(--accent-blue)]">
<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path clip-rule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fill-rule="evenodd"></path>
</svg>
</div>
<h2 class="text-xl font-bold leading-tight tracking-[-0.015em]">Lingua</h2>
</div>
<nav class="flex items-center gap-9">
<a class="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Home</a>
<a class="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Lessons</a>
<a class="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Community</a>
<a class="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Resources</a>
</nav>
<div class="flex gap-2">
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[var(--accent-blue)] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[var(--accent-blue-hover)] transition-colors">
<span class="truncate">Sign up</span>
</button>
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[var(--border-dark)] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2c4c5c] transition-colors">
<span class="truncate">Log in</span>
</button>
</div>
</header>
<div class="flex-shrink-0 py-4">
<div class="container mx-auto flex items-center justify-center gap-4">
<button class="text-white/50 hover:text-white transition-colors">
<span class="material-symbols-outlined text-4xl">chevron_left</span>
</button>
<div class="flex items-center gap-2">
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">1</div>
<div class="w-16 h-10 rounded-md bg-[var(--accent-blue)] border border-[var(--accent-blue)] flex items-center justify-center text-sm font-bold text-white">2</div>
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">3</div>
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">4</div>
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">5</div>
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">...</div>
<div class="w-16 h-10 rounded-md bg-[var(--surface-dark)] border border-[var(--border-dark)] flex items-center justify-center text-sm font-medium text-white/70">10</div>
</div>
<button class="text-white/50 hover:text-white transition-colors">
<span class="material-symbols-outlined text-4xl">chevron_right</span>
</button>
</div>
</div>
<main class="flex flex-1 p-8 pt-0 gap-8 overflow-hidden">
<div class="flex flex-col w-1/2 bg-[var(--surface-dark)] rounded-xl p-8 justify-between">
<div>
<div class="flex justify-between items-center mb-6">
<div class="flex items-center gap-2 bg-[#2c4c5c] text-white px-3 py-1 rounded-full text-sm font-medium">
<span class="material-symbols-outlined text-base">military_tech</span>
<span>Intermediate</span>
</div>
<div class="text-[var(--text-secondary)] text-sm font-medium">Attempt 2/5</div>
</div>
<p class="text-white text-2xl font-normal leading-loose text-right" style="font-family: 'Noto Sans Arabic', sans-serif;">
                        الطقس جميل اليوم. الشمس مشرقة والسماء صافية. إنه يوم مثالي للذهاب في نزهة في الحديقة أو لتناول وجبة مع الأصدقاء. الطيور تغني والأزهار تتفتح. إنه يوم رائع للتواجد في الخارج والاستمتاع بالطبيعة.
                    </p>
</div>
<div class="w-full flex flex-col items-center gap-4">
<div class="w-full flex items-center gap-4 text-[var(--text-secondary)] text-sm font-medium">
<p>0:15</p>
<div class="relative flex-1 h-1.5 bg-[#315668] rounded-full">
<div class="absolute h-full w-1/4 bg-[var(--accent-blue)] rounded-full"></div>
<div class="absolute w-4 h-4 bg-white rounded-full -top-1.5" style="left: 25%;"></div>
</div>
<p>-0:45</p>
</div>
<button class="flex items-center justify-center gap-3 h-12 w-12 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full">
<span class="material-symbols-outlined text-3xl">play_arrow</span>
</button>
</div>
</div>
<div class="flex flex-col w-1/2 bg-[var(--surface-dark)] rounded-xl p-8 gap-6">
<div class="flex-grow flex flex-col justify-center">
<h2 class="text-white text-2xl font-bold tracking-tight text-center mb-1">Your Turn to Speak</h2>
<p class="text-[var(--text-secondary)] text-base text-center mb-6">Tap to record, then see your live transcription below.</p>
<div class="flex justify-center items-center h-[180px] bg-black/20 rounded-lg border border-dashed border-[var(--border-dark)] p-4">
<p class="text-[var(--text-secondary)]" style="font-family: 'Noto Sans Arabic', sans-serif;">الطقس جميل اليوم. الشمس مشرقة...</p>
</div>
</div>
<div class="flex justify-center items-center mb-6">
<button class="flex items-center justify-center gap-3 h-20 w-20 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] transition-colors text-white rounded-full shadow-[0_0_0_10px_rgba(13,166,242,0.3)]">
<span class="material-symbols-outlined text-5xl">mic</span>
</button>
</div>
<div class="bg-[#101d23] rounded-lg p-6 border border-[var(--border-dark)]">
<div class="flex items-center gap-4 mb-4">
<div class="w-2/3">
<p class="text-[var(--text-secondary)] text-sm font-medium">Your Score</p>
<p class="text-white text-4xl font-bold">85%</p>
</div>
<div class="w-1/3 flex items-center justify-center">
<div class="relative w-20 h-20">
<svg class="w-full h-full" viewBox="0 0 36 36">
<path class="text-[#315668]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-width="3"></path>
<path class="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke-dasharray="85, 100" stroke-linecap="round" stroke-width="3"></path>
</svg>
<span class="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">85%</span>
</div>
</div>
</div>
<div class="text-[var(--text-secondary)] text-sm" style="font-family: 'Noto Sans Arabic', 'Noto Sans', sans-serif;">
<p>Great job! Your pronunciation is very clear. Keep practicing to refine your intonation on longer sentences.</p>
</div>
<div class="flex items-center gap-4 pt-4 mt-4 border-t border-[var(--border-dark)]">
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[var(--border-dark)] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2c4c5c] transition-colors flex-1">
<span class="truncate">Try Again</span>
</button>
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[var(--accent-blue)] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[var(--accent-blue-hover)] transition-colors flex-1">
<span class="truncate">Next Challenge</span>
</button>
</div>
</div>
</div>
</main>
</div>

</body></html>