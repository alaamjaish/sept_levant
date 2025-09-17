<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<link crossorigin="" href="https://fonts.gstatic.com/" rel="preconnect"/>
<link as="style" href="https://fonts.googleapis.com/css2?display=swap&amp;family=Inter%3Awght%40400%3B500%3B700%3B900&amp;family=Noto+Sans%3Awght%40400%3B500%3B700%3B900" onload="this.rel='stylesheet'" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
<title>Stitch Design</title>
<link href="data:image/x-icon;base64," rel="icon" type="image/x-icon"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<style type="text/tailwindcss">
    :root {
      --primary-color: #137fec;
      --card-bg: #ffffff;
      --text-color: #111418;
      --subtle-text: #617589;
      --border-color: #e5e7eb;
      --nav-button-bg: #f3f4f6;
      --nav-button-hover-bg: #e5e7eb;
      --add-button-bg: var(--primary-color);
      --add-button-text: #ffffff;
      --add-button-hover-bg: #0b6cce;
    }
    .card-flip {
      transform-style: preserve-3d;
      transition: transform 0.6s;
    }
    .card-flip.is-flipped {
      transform: rotateY(180deg);
    }
    .card-face {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .card-back {
      transform: rotateY(180deg);
    }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900" style="font-family: Inter, 'Noto Sans', sans-serif">
<div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[var(--border-color)] px-10 py-3">
<div class="flex items-center gap-4 text-[var(--text-color)]">
<div class="size-6 text-[var(--primary-color)]">
<svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
</svg>
</div>
<h2 class="text-[var(--text-color)] text-lg font-bold leading-tight tracking-[-0.015em]">StudySmart</h2>
</div>
<div class="flex flex-1 justify-end items-center gap-4">
<nav class="hidden md:flex items-center gap-6">
<a class="text-[var(--subtle-text)] hover:text-[var(--text-color)] text-sm font-medium leading-normal" href="#">Home</a>
<a class="text-[var(--text-color)] text-sm font-bold leading-normal" href="#">Decks</a>
<a class="text-[var(--subtle-text)] hover:text-[var(--text-color)] text-sm font-medium leading-normal" href="#">Library</a>
<a class="text-[var(--subtle-text)] hover:text-[var(--text-color)] text-sm font-medium leading-normal" href="#">Create</a>
</nav>
<div class="flex items-center gap-4">
<button class="p-2 rounded-full hover:bg-gray-100">
<span class="material-symbols-outlined text-[var(--subtle-text)]"> notifications </span>
</button>
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuA32getJSzCW3qO_7MwuswsrE5gLEfxC8sN9eUA_9u8wKzHj_cJ1t1gH4hUJLkqJpsMCHwdPrMakNZ1H7jYdtxpECeYK1JDuooN1pATgFMgJ5bHGUwzrviVbTdNK1IEIornf1awffTgsj9TwdKuF9khyhiuJ5tjI4sdKlekf9lu4Ru4FO5p1oxZec4al7dXTlAwfOU_VM3uHEpGmIxy7Aq06uUUWwQ79Sk7__EACmofLOjNfb0hIEKLAcPMLFGGZZpfBCT4TJAC");'></div>
</div>
</div>
</header>
<main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
<div class="w-full max-w-2xl flex flex-col items-center">
<div class="w-full flex items-center justify-start mb-4">
<a class="flex items-center gap-1 text-[var(--subtle-text)] hover:text-[var(--text-color)] transition-colors" href="#">
<span class="material-symbols-outlined">arrow_back_ios</span>
<span class="text-sm font-medium">Exit</span>
</a>
</div>
<p class="text-[var(--subtle-text)] text-sm font-medium mb-4">1/10</p>
<div class="w-full aspect-[3/2] perspective-1000">
<div class="relative w-full h-full card-flip cursor-pointer" onclick="this.classList.toggle('is-flipped')">
<div class="card-face flex items-center justify-center p-8 rounded-lg shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
<p class="text-[var(--text-color)] text-5xl md:text-6xl font-bold text-center" style="font-family: 'Noto Sans', sans-serif;">مرحبا</p>
</div>
<div class="card-face card-back flex flex-col items-center justify-center p-8 rounded-lg shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
<p class="text-[var(--primary-color)] text-3xl md:text-4xl font-bold text-center mb-6">Hello</p>
<div class="text-center">
<p class="text-[var(--text-color)] text-lg mb-2" style="font-family: 'Noto Sans', sans-serif;">مرحبا يا صديقي</p>
<p class="text-[var(--subtle-text)] text-base">Hello my friend</p>
</div>
</div>
</div>
</div>
<div class="text-sm text-gray-500 mt-2">Click card or press spacebar to flip</div>
<div class="flex items-center justify-between w-full mt-6">
<button class="flex items-center justify-center p-3 rounded-full bg-[var(--nav-button-bg)] hover:bg-[var(--nav-button-hover-bg)] transition-colors">
<span class="material-symbols-outlined text-[var(--text-color)]">arrow_back</span>
</button>
<button class="flex items-center justify-center p-3 rounded-full bg-[var(--nav-button-bg)] hover:bg-[var(--nav-button-hover-bg)] transition-colors">
<span class="material-symbols-outlined text-[var(--text-color)]">arrow_forward</span>
</button>
</div>
<div class="mt-8">
<button class="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-md h-11 px-6 bg-[var(--add-button-bg)] text-[var(--add-button-text)] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[var(--add-button-hover-bg)] transition-colors">
<span class="material-symbols-outlined">add</span>
<span class="truncate">Add a new card</span>
</button>
</div>
</div>
</main>
</div>

</body></html>