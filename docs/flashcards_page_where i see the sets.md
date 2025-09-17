<html><head>
<meta charset="utf-8"/>
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
      }
      .group:hover .group-hover-content {
        display: flex;
      }
    </style>
</head>
<body class="bg-gray-50" style='font-family: Inter, "Noto Sans", sans-serif;'>
<div class="flex flex-col min-h-screen">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 px-10 py-3 bg-white">
<div class="flex items-center gap-8">
<div class="flex items-center gap-4 text-gray-900">
<div class="w-8 h-8 text-[var(--primary-color)]">
<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
</svg>
</div>
<h2 class="text-gray-900 text-xl font-bold">StudySmart</h2>
</div>
<nav class="flex items-center gap-6">
<a class="text-gray-600 hover:text-[var(--primary-color)] text-sm font-medium" href="#">Home</a>
<a class="text-gray-600 hover:text-[var(--primary-color)] text-sm font-medium" href="#">Flashcards</a>
<a class="text-gray-600 hover:text-[var(--primary-color)] text-sm font-medium" href="#">Notes</a>
<a class="text-gray-600 hover:text-[var(--primary-color)] text-sm font-medium" href="#">Groups</a>
</nav>
</div>
<div class="flex items-center gap-4">
<button class="text-gray-600 hover:text-[var(--primary-color)] text-sm font-medium">Sign In</button>
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9bBGHuTUDAItAZZ-gxo_BjmaK2OPqAlZ8k9Ggxl9wbm-3d-9MzZ3cfMY4fylDl8j1NfQKr79PgcVZZ3dREazltWDFFZr6A-3otHk-V9TFVC0wUL2taq7oP0ZZqOXg3olqvBq6cxK85UO5ShPe6r2hw5Dra2MLD06idJSjSVUqxiI6jtn-XjywyXF8CDBUsNcsFIKsY65OK0kteokO4d5Pn2nhtdBn1khh7853Z8A7F9_aDCYwr3w_80zJdmYIeO_aDTxT0YhT");'></div>
</div>
</header>
<main class="flex-1 px-10 py-8">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col items-center justify-center mb-8">
<h1 class="text-gray-900 text-3xl font-bold mb-4">My Flashcard Sets</h1>
<button class="flex items-center justify-center gap-2 rounded-md h-10 px-4 bg-[var(--primary-color)] text-white text-sm font-bold hover:bg-opacity-90 transition-colors">
<span class="material-symbols-outlined">add</span>
<span class="truncate">New Set</span>
</button>
</div>
<div class="mb-8 max-w-md mx-auto">
<label class="relative">
<span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
<svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
</svg>
</span>
<input class="form-input w-full rounded-md border-gray-300 bg-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] h-10 placeholder:text-gray-500 pl-10 pr-4 text-sm" placeholder="Search sets..." value=""/>
</label>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCF8-9P4o2MVFvuI81UPQC_4Uu7Xstk5Hi75k-Cb66ox0FGFI45AxqFTMhRHGUwzRq-TVnTxdC87pcLNaQy2771WJijkXHLWyBOFtALLhKepWReXmDUWMisnCutzJ1lURzN4MNdE5kClY-6voNh2FHmHLkgNN6QkFwO_L6nfNYG9pnnJQHxpM5GVwFV5YGZ02cu2iVBOWNU7qm_4jbIOkHu749wIEnWXOFoHX02l-Lr2kxvRXzckrbmbccdSrHMP_fstTqciQZc");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">50 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">History 101</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">A comprehensive study guide for History 101.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9fhZXtKD6rXB0WVWx8JPKDmgQOQHHFFBoQf2AdQSySwyEynaxIbkaoC1iPrcSX7ki0hTbn7Z3rIIzIDIxtVbjDSKEmfcq8YWUmEbfxmUXzRsN_oMZmm9-Po_d-BIxoOBx9AwXJbtj9N3m7T1NY5ZujB2IO_cQQhwsU0elcNukHdLwHL3KRPVTjFzwTMpsBNhEQ3nTPn1g1y-mzDPGzxmmo698QxwpIWo1j9W-VVKBTxdY9vw9zlAKBfP4HG2axyvl9hhdA8tk");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">35 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">Math 202</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">Advanced mathematical concepts and problem-solving.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDLjynuQ7Hz9j3V-MIH02Seboz3IIFvBXsyNg5bQ8FEhCZaabC5aakDWVTKGJ1Ma2pfeLKoWF2VOgaN5s8gDSUnS9TLJfOdeNzc2lkR6wOdSKWgEp7biZbGa47khN5ksrGdB4ShlComydqY-Ah07lHh1aYyLK9b7muGr9zJnhvdPMkAVpVsX2ZGL9_B0X9JfQnRWUcIVghy27Y1uENr22QnaQ1hctupS48xZ_d90DcpIB5QFd1bcB7gsqaoroQ2sFYXm1PxstYo");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">72 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">Science 303</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">Exploring the wonders of science and the natural world.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDt9LGUPe3pAejMulkwPgV3YJwT9pZoouW3MTwSOXAMPICzq_BCDv2kBXmjbgWW927xvapCjlNkxYRsHQsoOPIr_3pzinbDnLE70KwUfPwrhDh1Cc0LaQ_hts2idYNin9FijcnjiCHNX1DigmlvGt8_hmWazsbV1Rsb2PQZqfjznAduIbCi9nkCIPtlkE4OjH4cLR-f5LXfNcvjHQPkMx9j23aAVOH0-p27XqLadsw4Iqtz9C6358YhehaoAkvMCGOlJDZbVXQ6");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">45 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">English 404</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">Mastering the art of English language and literature.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9ihAyEmoG1oY_OMDzGvtIuez-nDhNDDidKftF3bReMcLKk0HgTW7iQFjnyzwa391A-vpRgPrvTZSvlbgmQ1goLtowERS_PgJ9fwbD1KiPrO1Uh-_Kt45cUXsRzThW1FOlzt223zqq1m3q3PNXIZOXT1m_5hjV6-H47senkW8DN1GRmamTp438-EknE2tKfmAINJ8qajJSHIPEx_BlDxQZOpFefrjIcstvLF-YJfmb1H6HI78uclpzb35zg7IeKLM8Jj_YzNCS");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">120 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">Spanish 505</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">Learn Spanish with these flashcards.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
<div class="group relative flex flex-col rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
<div class="relative">
<div class="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-t-md" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBd2r-sXSLHuVlaGPdja4zfZEHvnp_5EBlA8y0mzkW0hWufOzR-4AYcoJzRa-xo_Cs_uq526I149LHNXzj4gjO9JSr-u_OFUfZ7bXD28E_7EeSHLfNyKRkcrlMKp4BDBg_TU-Q65U3jg3TNysMcAFneQLd1g68M1qgRpBdkSGy25CE9pjPvxlhe0mLKdijdojwjyhoKav9tdwiHQwtdHsjLEMHNC6Towh46oV2580IIQ3Y4vb40bCDVDMlGFwL9qwXC99EUZZJm");'></div>
<div class="absolute inset-0 bg-black bg-opacity-20 rounded-t-md"></div>
<div class="absolute bottom-2 left-2 text-white text-xs font-semibold bg-black bg-opacity-50 px-2 py-1 rounded">88 Cards</div>
</div>
<div class="p-4 flex-1 flex flex-col">
<h3 class="text-gray-900 text-lg font-bold">Art 606</h3>
<p class="text-gray-600 text-sm mt-1 flex-1">Explore the world of art with these flashcards.</p>
</div>
<div class="absolute inset-0 bg-black bg-opacity-50 rounded-md group-hover-content items-center justify-center gap-4 hidden transition-opacity">
<button class="bg-white text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 flex items-center gap-2">
<span class="material-symbols-outlined text-base">visibility</span> View
                </button>
<button class="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-90 flex items-center gap-2">
<span class="material-symbols-outlined text-base">add</span> Add
                </button>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>
