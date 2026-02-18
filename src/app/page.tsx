import { LandingHtmlBridge } from "@/components/LandingHtmlBridge";

const LANDING_PAGE_HTML = String.raw`<nav class="fixed top-0 w-full z-50 glass-card landing-nav-blur">
<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="bg-primary p-1.5 rounded-lg size-14 flex items-center justify-center overflow-hidden">
<img src="/profit-mrr-logo.png" alt="Profit MRR Logo" class="w-full h-full object-contain"/>
</div>
<h1 class="text-xl font-800 tracking-tight text-white uppercase">Profit<span class="text-primary">MRR</span></h1>
</div>
<div class="hidden md:flex items-center gap-10">
<a class="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Library</a>
<a class="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Monthly Drops</a>
<a class="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">How It Works</a>
<a class="text-sm font-semibold text-white/70 hover:text-primary transition-colors" href="#">Pricing</a>
</div>
<div class="flex items-center gap-4">
<a href="/login" class="hidden sm:block text-sm font-bold text-white px-4 py-2 hover:text-primary transition-colors">Login</a>
<button data-checkout-cta="nav" class="bg-primary hover:bg-primary/90 text-background-dark px-6 py-2.5 rounded-lg text-sm font-bold transition-all gold-glow">
                Join Now
            </button>
</div>
</div>
</nav>
<section class="relative pt-40 pb-20 px-6 overflow-hidden spotlight">
<div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
<div class="flex flex-col space-y-8 z-20">
<div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
<span class="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/80">900+ Ready-To-Sell Products • Unlimited Downloads • Monthly Drops</span>
</div>
<h1 class="text-6xl lg:text-7xl font-800 leading-[1] tracking-tight text-white">
                Access A Full <br/>
<span class="gold-gradient-text italic">Digital Product</span> <br/>
                Empire
            </h1>
<p class="text-xl text-white/60 max-w-xl leading-relaxed">
                Skip the creation process. Download high-converting digital assets, rebrand them as your own, and keep 100% of every sale you make.
            </p>
<div class="flex flex-col sm:flex-row gap-4">
<button data-checkout-cta="hero" class="bg-primary text-background-dark px-8 py-5 rounded-xl text-lg font-bold transition-all hover:scale-[1.02] gold-glow flex items-center justify-center gap-3">
<span>Access Full Products Library</span>
<span class="material-symbols-outlined">arrow_forward</span>
</button>
<button class="glass-card text-white px-8 py-5 rounded-xl text-lg font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    See What's Inside
                </button>
</div>
<div class="flex flex-wrap items-center gap-8 pt-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">bolt</span>
<span class="text-sm font-semibold text-white/80">Instant access</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-xl">payments</span>
<span class="text-sm font-semibold text-white/80">Keep 100% profit</span>
</div>
</div>
</div>
<div class="relative lg:h-[700px] flex items-center justify-center z-10">
<div class="relative w-full max-w-lg bg-surface rounded-2xl border border-white/10 p-4 shadow-2xl">
<div class="w-full aspect-video bg-background-dark rounded-xl overflow-hidden border border-white/5">
<img alt="Platform Dashboard" class="w-full h-full object-cover" data-alt="Dashboard showing sales and downloads" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVP3mEE5D1a7NS4z9wjXI3rffLPK4fzz77xgVHDVj25Nw4w76p3Nfd71YGei40tQfnsl7hu3T5oHsetX71Be3Jk8FLfjXxjc0GD2zd0qAnERBd_K_gczkQ-LZZWxKT98MoRWvImNcCg-bvlvrL7jY3oA36i064CBpg8H5q5P2ksw-hPDBrI9DAUxNUkdmuFo_5xbyLkDfEy_r2Da0Vvopycexi5otPKDVUoyACWQvRmZ75K4gc6_H3kyfaN-vZ_Xo6eZ0j9pE4oA"/>
</div>
<div class="absolute -top-12 -right-16 glass-card p-4 rounded-2xl gold-glow border-primary/30 w-56 -rotate-3 transition-transform hover:rotate-0">
<img alt="Product" class="w-full h-32 object-cover rounded-lg mb-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhlFw32ysjW8gJ-_8cK-6nqqY1RVoioJGVudPH5VSdW2G8ylsWm1PQebmR2ExzwPVdNzvh3ZT0KrhwGhi2YhpaXsoilphesNkGMS-emyUdOFual7nuu-5YL3w2rE105VLGEt6k_4krKU2Z-HhM7S379CuQg4oo8XM8jT9eV_ZGnbT3-GQAV_tTihCEoIcvaDbR9nofLYS2N5VT0wR21b8caC-b8bTODXNSeOcfI13pgTpRiupFPUywlWCBAvix3HcmnSiJoDDfkg"/>
<div class="flex justify-between items-center">
<p class="text-[10px] font-black uppercase text-primary">Best Seller</p>
<p class="text-[10px] text-white/50">MRR</p>
</div>
</div>
<div class="absolute -bottom-10 -left-12 glass-card p-4 rounded-2xl border-white/10 w-52 rotate-6 transition-transform hover:rotate-0">
<img alt="Product" class="w-full h-28 object-cover rounded-lg mb-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD25huSL4v1j8pjE0YocysTTCYOF7mcXQrreD562MpjO0PsLVdEGZgYEpppsg5q6-RpNDeCbabumSRqAJg0s8FLlqJrfiUSjz5OuGSw5NJxRZLmf9TzqBw_B--KhhKYB4h1KU86p-GrABztmzOjw-irq-2RI-wBTYJHuRB_Hq2UbDjlb_euSebOhGkv7QkRypzCWUODT_qU2yB3A3FIm2WN6jPtnpxrzfXweV0OEre6VEBTwWft2pBelCMWctzbqEACgBQaxfr2SA"/>
<p class="text-xs font-bold text-white">Viral Reels Bundle</p>
</div>
</div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full"></div>
</div>
</div>
</section>
<div class="bg-surface/50 border-y border-white/5 py-10 relative overflow-hidden">
<div class="max-w-7xl mx-auto px-6">
<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
<div class="flex items-center gap-4 group">
<div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">package_2</span>
</div>
<div>
<div class="text-2xl font-800 text-white">900+</div>
<div class="text-[11px] font-bold text-white/40 uppercase tracking-widest">Product Bundles</div>
</div>
</div>
<div class="flex items-center gap-4 group">
<div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">trending_up</span>
</div>
<div>
<div class="text-2xl font-800 text-white">2,700+</div>
<div class="text-[11px] font-bold text-white/40 uppercase tracking-widest">Sales Generated</div>
</div>
</div>
<div class="flex items-center gap-4 group">
<div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">star</span>
</div>
<div>
<div class="text-2xl font-800 text-white">4.9/5</div>
<div class="text-[11px] font-bold text-white/40 uppercase tracking-widest">Star Ratings</div>
</div>
</div>
<div class="flex items-center gap-4 group">
<div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
<span class="material-symbols-outlined">update</span>
</div>
<div>
<div class="text-2xl font-800 text-white">WEEKLY</div>
<div class="text-[11px] font-bold text-white/40 uppercase tracking-widest">Updated Monthly</div>
</div>
</div>
</div>
</div>
</div>
<section class="py-24 px-6">
<div class="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row items-end justify-between gap-6">
<div class="space-y-4">
<h2 class="text-primary text-sm font-bold uppercase tracking-[0.2em]">Explore The Vault</h2>
<h3 class="text-4xl lg:text-5xl font-800 text-white leading-tight">Trending Profit Bundles</h3>
</div>
<button class="flex items-center gap-2 text-white/60 hover:text-primary font-bold transition-all border-b border-transparent hover:border-primary pb-1">
            View All 900+ Products <span class="material-symbols-outlined">arrow_right_alt</span>
</button>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
<div class="group cursor-pointer">
<div class="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10">
<img alt="Etsy Products" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhlFw32ysjW8gJ-_8cK-6nqqY1RVoioJGVudPH5VSdW2G8ylsWm1PQebmR2ExzwPVdNzvh3ZT0KrhwGhi2YhpaXsoilphesNkGMS-emyUdOFual7nuu-5YL3w2rE105VLGEt6k_4krKU2Z-HhM7S379CuQg4oo8XM8jT9eV_ZGnbT3-GQAV_tTihCEoIcvaDbR9nofLYS2N5VT0wR21b8caC-b8bTODXNSeOcfI13pgTpRiupFPUywlWCBAvix3HcmnSiJoDDfkg"/>
<div class="absolute top-4 left-4 flex gap-2">
<span class="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">MRR Included</span>
<span class="bg-white/90 text-background-dark text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">Hot</span>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60"></div>
</div>
<h4 class="text-white font-bold text-xl group-hover:text-primary transition-colors">Etsy Proven Products</h4>
<p class="text-white/50 text-sm mt-1">50+ High-Demand Templates</p>
</div>
<div class="group cursor-pointer">
<div class="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10">
<img alt="Profit Packs" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCogO2veNb2fALL9Px9UMKPeMk8YkzknnQppW4YAkTVe1GE3IVFIFl0orV_90T1eLNM-Jviog6MvqpwYGMB4ouvKoD6JnJMzWkQffPsWrvFYO6-ZpcOz_XwO0u10UXvklyhtDKAiusBs_28uN-8Y7Tw0GpCWIcFGQ93e07yTpStLM1zoIvh5Er14OCaevA0qIt5X3cLPwyle4f730pCHYcGQl9Jp7lpy4Y1OtZQuW3qa66cdk0Uy-om4b6AmC6Cu5i3vz-b8ja3Bg"/>
<div class="absolute top-4 left-4 flex gap-2">
<span class="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">MRR Included</span>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60"></div>
</div>
<h4 class="text-white font-bold text-xl group-hover:text-primary transition-colors">High Profit Packs</h4>
<p class="text-white/50 text-sm mt-1">Niche-Specific Solutions</p>
</div>
<div class="group cursor-pointer">
<div class="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10">
<img alt="Viral Reels" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD25huSL4v1j8pjE0YocysTTCYOF7mcXQrreD562MpjO0PsLVdEGZgYEpppsg5q6-RpNDeCbabumSRqAJg0s8FLlqJrfiUSjz5OuGSw5NJxRZLmf9TzqBw_B--KhhKYB4h1KU86p-GrABztmzOjw-irq-2RI-wBTYJHuRB_Hq2UbDjlb_euSebOhGkv7QkRypzCWUODT_qU2yB3A3FIm2WN6jPtnpxrzfXweV0OEre6VEBTwWft2pBelCMWctzbqEACgBQaxfr2SA"/>
<div class="absolute top-4 left-4 flex gap-2">
<span class="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">MRR Included</span>
<span class="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">Trending</span>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60"></div>
</div>
<h4 class="text-white font-bold text-xl group-hover:text-primary transition-colors">Viral Reels Bundle</h4>
<p class="text-white/50 text-sm mt-1">1,000+ Faceless Reels</p>
</div>
<div class="group cursor-pointer">
<div class="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-white/10">
<img alt="Mastery Vault" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDycr0ZvqbLgCHJjJKCemlO4C_DwUB7K7FYtNdDY2CCcwYWTMxDwwur2hb71-bH8Xsi53z0spE9ec5BFMFhzMSrg8dXMtGDHIgu0FLr7NdHYsUFJmC0GE2oTpXEFji8ubA4Hh7xM96fdGAuFoa0nCnzk33uAKLoyGUQYY613zY8gEWzdEUin98OMzu7XTK_LPI3bfL2tc5Ujzc-n8o6DQ53lFIlqEEm4oJ4XcC-Sf6ZMfzbIbIOQTn3yjkGNtGxbdq_bBRCiD4Lxw"/>
<div class="absolute top-4 left-4 flex gap-2">
<span class="bg-primary text-background-dark text-[10px] font-black px-2 py-1 rounded tracking-tighter uppercase">MRR Included</span>
</div>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60"></div>
</div>
<h4 class="text-white font-bold text-xl group-hover:text-primary transition-colors">Mastery Kits</h4>
<p class="text-white/50 text-sm mt-1">Complete Marketing Systems</p>
</div>
</div>
</section>
<section class="py-24 px-6 bg-surface/30">
<div class="max-w-7xl mx-auto">
<div class="text-center mb-16">
<h2 class="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">The Workflow</h2>
<h3 class="text-4xl font-800 text-white">4 Steps To Your Empire</h3>
</div>
<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
<div class="absolute top-1/2 left-0 w-full h-0.5 border-t border-dashed border-white/10 -translate-y-1/2 hidden md:block"></div>
<div class="relative bg-background-dark p-8 rounded-2xl border border-white/10 text-center">
<div class="size-16 rounded-full bg-primary text-background-dark flex items-center justify-center mx-auto mb-6 text-2xl font-black">1</div>
<h4 class="text-lg font-bold text-white mb-2">Join</h4>
<p class="text-sm text-white/50">Gain instant access to the entire vault.</p>
</div>
<div class="relative bg-background-dark p-8 rounded-2xl border border-white/10 text-center">
<div class="size-16 rounded-full bg-primary text-background-dark flex items-center justify-center mx-auto mb-6 text-2xl font-black">2</div>
<h4 class="text-lg font-bold text-white mb-2">Download</h4>
<p class="text-sm text-white/50">Pick products from any trending niche.</p>
</div>
<div class="relative bg-background-dark p-8 rounded-2xl border border-white/10 text-center">
<div class="size-16 rounded-full bg-primary text-background-dark flex items-center justify-center mx-auto mb-6 text-2xl font-black">3</div>
<h4 class="text-lg font-bold text-white mb-2">Upload</h4>
<p class="text-sm text-white/50">Set your price on Etsy, Shopify, or Stan Store.</p>
</div>
<div class="relative bg-background-dark p-8 rounded-2xl border border-white/10 text-center">
<div class="size-16 rounded-full bg-primary text-background-dark flex items-center justify-center mx-auto mb-6 text-2xl font-black">4</div>
<h4 class="text-lg font-bold text-white mb-2">Profit</h4>
<p class="text-sm text-white/50">Keep 100% of every sale you generate.</p>
</div>
</div>
</div>
</section>
<section class="py-24 px-6 overflow-hidden">
<div class="max-w-7xl mx-auto">
<div class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10">
<div class="p-12 lg:p-20 bg-background-dark">
<h4 class="text-red-500 font-bold mb-8 flex items-center gap-2">
<span class="material-symbols-outlined">cancel</span> The Old Way
                </h4>
<ul class="space-y-6">
<li class="flex items-start gap-4 text-white/60">
<span class="material-symbols-outlined text-red-500/50">remove</span>
<p>Spend weeks creating products from scratch</p>
</li>
<li class="flex items-start gap-4 text-white/60">
<span class="material-symbols-outlined text-red-500/50">remove</span>
<p>Pay $1,000+ to hire writers and designers</p>
</li>
<li class="flex items-start gap-4 text-white/60">
<span class="material-symbols-outlined text-red-500/50">remove</span>
<p>Limited niches and product options</p>
</li>
<li class="flex items-start gap-4 text-white/60">
<span class="material-symbols-outlined text-red-500/50">remove</span>
<p>Complex licensing legal hurdles</p>
</li>
</ul>
</div>
<div class="p-12 lg:p-20 bg-primary/5 relative">
<div class="absolute top-0 right-0 p-8">
<span class="material-symbols-outlined text-primary text-6xl opacity-20">verified</span>
</div>
<h4 class="text-primary font-bold mb-8 flex items-center gap-2">
<span class="material-symbols-outlined">check_circle</span> The ProfitMRR Way
                </h4>
<ul class="space-y-6">
<li class="flex items-start gap-4 text-white">
<span class="material-symbols-outlined text-primary">add</span>
<p>Instant access to 900+ ready-to-sell assets</p>
</li>
<li class="flex items-start gap-4 text-white">
<span class="material-symbols-outlined text-primary">add</span>
<p>One low membership fee for everything</p>
</li>
<li class="flex items-start gap-4 text-white">
<span class="material-symbols-outlined text-primary">add</span>
<p>Unlimited downloads across all niches</p>
</li>
<li class="flex items-start gap-4 text-white">
<span class="material-symbols-outlined text-primary">add</span>
<p>Pre-written legal MRR certificates included</p>
</li>
</ul>
</div>
</div>
</div>
</section>
<section class="py-24 px-6 bg-surface/30">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
<div class="space-y-4">
<h2 class="text-primary text-sm font-bold uppercase tracking-[0.2em]">Always Fresh</h2>
<h3 class="text-4xl font-800 text-white">Upcoming Release Calendar</h3>
</div>
<p class="text-white/40 max-w-sm">We add 20+ new premium products every single month to keep your store competitive.</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="glass-card p-8 rounded-2xl border-white/10 group hover:border-primary/40 transition-all">
<div class="text-primary font-black text-4xl mb-6">MARCH</div>
<ul class="space-y-4 text-white/70">
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-primary"></span>
                        Faceless TikTok Mastery
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-primary"></span>
                        500+ Luxury Home Reels
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-primary"></span>
                        Email Marketing Templates
                    </li>
</ul>
</div>
<div class="glass-card p-8 rounded-2xl border-white/10 group hover:border-primary/40 transition-all">
<div class="text-white/40 font-black text-4xl mb-6">APRIL</div>
<ul class="space-y-4 text-white/50">
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        AI Art Generation Course
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        Digital Planner Suite
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        Podcast Script Kits
                    </li>
</ul>
</div>
<div class="glass-card p-8 rounded-2xl border-white/10 group hover:border-primary/40 transition-all">
<div class="text-white/40 font-black text-4xl mb-6">MAY</div>
<ul class="space-y-4 text-white/50">
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        Social Media Agency Pack
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        SEO Blueprint 2024
                    </li>
<li class="flex items-center gap-3">
<span class="size-2 rounded-full bg-white/20"></span>
                        Canva Elements Library
                    </li>
</ul>
</div>
</div>
</div>
</section>
<section class="py-24 px-6">
<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
<div class="space-y-6">
<div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-3xl">gavel</span>
</div>
<h4 class="text-2xl font-bold text-white">Sell Legally From Day 1</h4>
<p class="text-white/50 leading-relaxed">No copyright headaches. Every asset comes with a certified license that allows you to resell and keep the profit.</p>
</div>
<div class="space-y-6">
<div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-3xl">art_track</span>
</div>
<h4 class="text-2xl font-bold text-white">Ready-To-Post Sales Materials</h4>
<p class="text-white/50 leading-relaxed">We provide the thumbnails, sales copy, and ad creatives. Just download the assets and you're ready to market.</p>
</div>
<div class="space-y-6">
<div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-3xl">rocket_launch</span>
</div>
<h4 class="text-2xl font-bold text-white">Instant Business Launch</h4>
<p class="text-white/50 leading-relaxed">Why spend months in development? Select your niche, download our bundles, and go live in under 30 minutes.</p>
</div>
</div>
</section>
<section class="py-24 px-6 bg-surface/30">
<div class="max-w-7xl mx-auto">
<div class="text-center mb-16">
<h2 class="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">Success Stories</h2>
<h3 class="text-4xl font-800 text-white">What Our Resellers Are Earning</h3>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
<div class="glass-card p-8 rounded-2xl border-white/10">
<div class="flex gap-1 mb-4">
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
</div>
<p class="text-white/80 italic mb-6">"Made my first $500 on Etsy within 4 days of joining. The Reels bundles are incredible quality and sell like crazy."</p>
<div class="flex items-center gap-4">
<img alt="User" class="size-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSiCzrvURkqW5MUUfmKUq9VCZ8lyvBLAUNfQjfm1Efyq_ZJ1S0FcLoNWVqjDMQuIPekJVSRDRWZcXIZw4aOVLp1c9n7vRjGbfzHPXPCg7JaQvDOrTQVlRr4LgR3bEBVcOMJ3KeYNNx1p5xq6j1pIQjM5sa808dk7tsTh1kekymqSpA3CgJNzWDfyCeNJ7dLHElnHflhfC-4kknOacWtTnCaKfPs1Ao-sdWbUbQKtkh2Jljj4SHisZuMPXtayz5WPgYt8OuHlptjw"/>
<div>
<div class="text-sm font-bold text-white">Sarah Jenkins</div>
<div class="text-[10px] text-primary uppercase font-black">Etsy Seller</div>
</div>
</div>
</div>
<div class="glass-card p-8 rounded-2xl border-white/10">
<div class="flex gap-1 mb-4">
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
</div>
<p class="text-white/80 italic mb-6">"Finally a platform that delivers real value. No more low-quality PLR. This stuff is actually high-end."</p>
<div class="flex items-center gap-4">
<img alt="User" class="size-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtLfUDyVRdmAMns5J6Nu44mfId5ShIa5k0hBfYx6ctaOLtBe9Q8gvKzW0zFBycmmqCSG3SFQwOaZ1dqUxz2yCsHjgKGGeGXJdERs5Lch3fGSFUrwRB3-rqYSdH1cp5x91zye-XrBHCLSXEcec_PIe7lb6H1cRqBTgJNbeY3zM2pf75I-Hvp7odGiGbjlAecY0hxwxIT5-8kbz3kgbYXMivEKQ4YtIWEDo_-BJmK3imaPSLW8413XKdwk5GCoMskkTv7fV2cIaO5g"/>
<div>
<div class="text-sm font-bold text-white">Marcus Thorne</div>
<div class="text-[10px] text-primary uppercase font-black">Digital Entrepreneur</div>
</div>
</div>
</div>
<div class="glass-card p-8 rounded-2xl border-white/10">
<div class="flex gap-1 mb-4">
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
<span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">star</span>
</div>
<p class="text-white/80 italic mb-6">"The monthly drops keep my inventory fresh. My customers are always coming back for more new products."</p>
<div class="flex items-center gap-4">
<img alt="User" class="size-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZWkmhpBypK1hDl-e_Wdm4OTYFKGh2JtHQqKFeU1yNwo27Zh-icxNpThTZud85lzahJ4SdGRxf3NS-4M94Xh3t56zPf_5Vvfq_EWEQ8hSdlJtpVXU2M8hv5K6puPoQH4Y4-UAbYm3lyH62kmLAdzjZfH3OzuuZAXS1GXd6tk59FQc0-cvjVhsHSLbwuY2Udaw0rUxt_hSda7df8E_vQXl8I_k62SLgcNCKA-4_ILzW3Tc7yFr_z9JiNx2lDB2gFCVozTT6jCteOg"/>
<div>
<div class="text-sm font-bold text-white">Elena Rodriguez</div>
<div class="text-[10px] text-primary uppercase font-black">Content Creator</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section class="py-24 px-6 relative">
<div class="max-w-6xl mx-auto bg-primary rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden gold-glow">
<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.3),_transparent)] pointer-events-none"></div>
<div class="relative z-10 space-y-8">
<h3 class="text-background-dark text-5xl lg:text-7xl font-900 tracking-tight leading-[1]">
                Start Selling Digital <br class="hidden sm:block"/> 
                Products This Week
            </h3>
<p class="text-background-dark/80 text-xl font-semibold max-w-2xl mx-auto">
                Stop trading time for money. Build a scalable digital empire with 900+ products ready for you to resell right now.
            </p>
<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
<button data-checkout-cta="final" class="bg-background-dark text-white px-12 py-6 rounded-2xl text-xl font-black transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-3">
                    Get Instant Access Now
                    <span class="material-symbols-outlined">bolt</span>
</button>
</div>
<div class="flex items-center justify-center gap-6 pt-4 text-background-dark/60">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm">lock</span>
<span class="text-xs font-bold uppercase">Secure Payment</span>
</div>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sm">event_repeat</span>
<span class="text-xs font-bold uppercase">Cancel Anytime</span>
</div>
</div>
</div>
</div>
</section>
<footer class="bg-background-dark border-t border-white/5 py-20 px-6">
<div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
<div class="space-y-6">
<div class="flex items-center gap-3">
<div class="bg-primary p-1 rounded-lg size-10 flex items-center justify-center overflow-hidden">
<img src="/profit-mrr-logo.png" alt="Profit MRR Logo" class="w-full h-full object-contain"/>
</div>
<h1 class="text-lg font-800 tracking-tight text-white uppercase">Profit<span class="text-primary">MRR</span></h1>
</div>
<p class="text-white/40 text-sm leading-relaxed">
                The world's leading infrastructure for digital product resellers. Premium products, legal licensing, and high-conversion systems.
            </p>
</div>
<div>
<h5 class="text-white font-bold mb-8 uppercase tracking-widest text-xs">Platform</h5>
<ul class="space-y-4 text-white/40 text-sm">
<li><a class="hover:text-primary transition-colors" href="#">Browse Library</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Monthly Drops</a></li>
<li><a class="hover:text-primary transition-colors" href="#">License Details</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Support Center</a></li>
</ul>
</div>
<div>
<h5 class="text-white font-bold mb-8 uppercase tracking-widest text-xs">Company</h5>
<ul class="space-y-4 text-white/40 text-sm">
<li><a class="hover:text-primary transition-colors" href="#">Affiliate Program</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
<li><a class="hover:text-primary transition-colors" href="#">Contact Us</a></li>
</ul>
</div>
<div>
<h5 class="text-white font-bold mb-8 uppercase tracking-widest text-xs">Newsletter</h5>
<p class="text-white/40 text-sm mb-6">Get notified when we drop new premium products.</p>
<div class="flex gap-2">
<input class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary w-full" placeholder="Your email" type="email"/>
<button class="bg-primary px-4 rounded-xl text-background-dark">
<span class="material-symbols-outlined">send</span>
</button>
</div>
</div>
</div>
<div class="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
<p class="text-white/30 text-[10px] uppercase tracking-[0.3em]">© 2024 ProfitMRR. All rights reserved.</p>
<div class="flex gap-8">
<a class="text-white/30 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">public</span></a>
<a class="text-white/30 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">share</span></a>
<a class="text-white/30 hover:text-white transition-colors" href="#"><span class="material-symbols-outlined text-xl">alternate_email</span></a>
</div>
</div>
</footer>`

export default function HomePage() {
  return (
    <>
      <div
        className="min-h-screen bg-background-dark font-display text-white"
        dangerouslySetInnerHTML={{ __html: LANDING_PAGE_HTML }}
      />
      <LandingHtmlBridge source="landing" />
    </>
  );
}
