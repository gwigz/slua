<script setup>
import { Icon } from "@iconify/vue";
</script>

<template>
	<header
		class="container max-w-5xl mx-auto px-4 pt-32 flex flex-col justify-center items-center text-center"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 275 245"
			alt="slua.tips"
			class="!max-w-[30ch] object-contain object-center mb-8"
		>
			<path
				class="fill-purple-300 dark:fill-purple-400/50"
				d="M241 112c-5 3-11 4-18 4a38 38 0 0 1-31-14v6l-7 7h-24l-3-3c-5 3-12 4-19 4-8 0-16-2-22-7l-6 5-2 1h-1a19 19 0 0 1 3 24h1l4-4h24l3 3c5-3 11-4 18-4a38 38 0 0 1 31 16l8-9c7-5 16-7 28-7 7 0 15 2 22 4h1l2 1 5 7-2 20-4 3a25 25 0 0 1 10 21c0 10-4 18-11 23-7 6-17 8-27 8l-20-2-8-2-7-8c-7 8-18 12-29 12l-13-2v19l-7 7h-24l-7-7v-20l-2 2H83l-3-3-1 1c-6 2-13 3-19 3a29 29 0 0 1-31-30v-23h-3l-7-7v-19l7-7h6l7-16h21l7 7v9h10a19 19 0 0 1 7-21c-6-2-12-6-15-12l-7 6c-7 6-16 8-27 8-9 0-19-1-28-4l-7-8 3-21 7-5a24 24 0 0 1-9-19c0-9 3-17 11-23 7-5 16-7 27-7l21 3 2 1 2 1V11l7-7h24l7 7v71h4V37l7-7h24l7 7v39l1 4 3 1 6-2V37l7-7h24l7 7v7a37 37 0 0 1 32-15c6 0 11 1 17 4l3-3h24l7 7v71l-7 7h-24l-3-3Z"
			/>
			<path
				class="fill-white dark:fill-gray-50"
				d="M241 108c-5 3-11 4-18 4a38 38 0 0 1-31-14v6l-7 7h-24l-3-3c-5 3-12 4-19 4-8 0-16-2-22-7l-6 5-2 1h-1a19 19 0 0 1 3 24h1l4-4h24l3 3c5-3 11-4 18-4a38 38 0 0 1 31 16l8-9c7-5 16-7 28-7 7 0 15 2 22 4h1l2 1 5 7-2 20-4 3a25 25 0 0 1 10 21c0 10-4 18-11 23-7 6-17 8-27 8l-20-2-8-2-7-8c-7 8-18 12-29 12l-13-2v19l-7 7h-24l-7-7v-20l-2 2H83l-3-3-1 1c-6 2-13 3-19 3a29 29 0 0 1-31-30v-23h-3l-7-7v-19l7-7h6l7-16h21l7 7v9h10a19 19 0 0 1 7-21c-6-2-12-6-15-12l-7 6c-7 6-16 8-27 8-9 0-19-1-28-4l-7-8 3-21 7-5a24 24 0 0 1-9-19c0-9 3-17 11-23 7-5 16-7 27-7l21 3 2 1 2 1V7l7-7h24l7 7v71h4V33l7-7h24l7 7v39l1 4 3 1 6-2V33l7-7h24l7 7v7a37 37 0 0 1 32-15c6 0 11 1 17 4l3-3h24l7 7v71l-7 7h-24l-3-3Z"
			/>
			<path
				class="fill-blue-300 dark:fill-blue-400"
				d="M224 33c9 0 16 3 21 9v-6l2-2h18l2 2v65l-2 2h-18l-2-2v-6c-5 6-13 9-22 9-19 0-32-14-32-35 0-22 13-36 33-36Zm7 18c-11 0-17 7-17 17 0 11 6 18 17 18 6 0 11-3 14-7V59c-3-5-9-8-14-8Zm-92 53c-15 0-25-10-25-26V36l2-2h18l2 2v36c0 8 5 13 12 13 6 0 11-3 14-6V36l3-2h17l2 2v65l-2 2h-17l-3-2v-7c-4 6-13 10-23 10ZM72 10l3-2h17l2 2v69c0 5 3 7 8 7h6l1 1v14l-2 2-11 1c-14 0-24-8-24-24V10Zm-37 94c-15 0-25-4-25-4l-2-3 3-14 2-1s11 4 24 4c6 0 8-1 8-4 0-7-36-4-36-27 0-14 10-22 30-22 11 0 21 4 21 4l2 2-2 14-3 2s-10-4-20-4c-6 0-8 1-8 3 0 7 37 3 37 27 0 15-11 23-31 23Z"
			/>
			<path
				class="fill-fuchsia-300 dark:fill-fuchsia-400"
				d="M224 209c-16 0-25-4-25-4l-2-3 2-14 2-1s11 4 24 4c6 0 8-1 8-4 0-7-36-4-36-27 0-14 10-22 31-22 10 0 20 4 20 4l2 2-2 14-2 2s-11-4-21-4c-6 0-7 1-7 3 0 7 36 3 36 27 0 15-11 23-30 23Zm-64 0c-9 0-16-3-21-9v31l-2 2h-18l-2-2v-90l2-2h18l2 2v6c5-6 13-9 22-9 19 0 31 14 31 35 0 22-13 36-32 36Zm-7-18c11 0 17-7 17-17 0-11-6-18-17-18-6 0-11 3-14 8v20c3 4 9 7 14 7Zm-66-52h17l2 2v65l-2 2H87l-3-2v-65l3-2Zm19-14a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-28 79-2 2c-5 2-11 3-16 3-14 0-23-8-23-22v-31h-8l-2-3v-12l2-2h8l7-16h12l3 2v14h15l3 2v12l-3 3H59v28c0 5 2 7 7 7l9-1 2 2 1 12Z"
			/>
		</svg>

		<h1
			class="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-sky-300 via-purple-400 to-violet-400 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 text-transparent bg-clip-text pb-6"
		>
			Luau resources for Second Life
		</h1>

		<p
			class="text-xl md:text-2xl opacity-70 dark:text-shadow-xs mb-10 max-w-2xl"
		>
			A curated list of resources to help you get started with Luau scripting in
			Second Life. Check back for updates and tutorials!
		</p>
	</header>

	<!-- <div class="max-w-md mx-auto px-4 py-16">
		<div
			class="bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm rounded-lg p-4 border"
		>
			<div
				class="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md overflow-x-auto [&_.lang,&_.copy]:hidden"
			>
				<slot name="hello-world"></slot>
			</div>
		</div>
	</div> -->

	<section class="container mx-auto px-4 py-12">
		<h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">
			What's Coming
		</h2>
		<div
			class="max-w-2xl lg:max-w-6xl mx-auto grid gap-4 grid-cols-1 lg:grid-cols-3"
		>
			<div class="rounded-lg border bg-card text-card-foreground">
				<div class="flex flex-col space-y-1.5 p-6">
					<div
						class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
					>
						<Icon icon="solar:book-2-bold" class="h-6 w-6 text-primary" />
						Guides
					</div>
				</div>
				<div class="p-6 pt-0">
					<p class="text-muted-foreground">
						Step-by-step tutorials and guides to help you master Luau scripting
					</p>
				</div>
			</div>
			<div class="rounded-lg border bg-card text-card-foreground">
				<div class="flex flex-col space-y-1.5 p-6">
					<div
						class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
					>
						<Icon icon="solar:copy-bold" class="h-6 w-6 text-primary" />
						Snippets
					</div>
				</div>
				<div class="p-6 pt-0">
					<p class="text-muted-foreground">
						Ready-to-use code snippets for common tasks
					</p>
				</div>
			</div>
			<div class="rounded-lg border bg-card text-card-foreground">
				<div class="flex flex-col space-y-1.5 p-6">
					<div
						class="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2"
					>
						<Icon icon="solar:global-bold" class="h-6 w-6 text-primary" />
						Resources
					</div>
				</div>
				<div class="p-6 pt-0">
					<p class="text-muted-foreground">
						Access to scripts, tools, and resources to enhance creations
					</p>
				</div>
			</div>
		</div>
	</section>

	<section class="container mx-auto px-4 py-12 pb-32">
		<h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">
			Helpful Resources
		</h2>
		<div class="max-w-xl mx-auto grid gap-4">
			<a
				href="https://www.luau.org"
				target="_blank"
				rel="noopener noreferrer"
				class="block p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-colors"
				><div class="flex justify-between items-center">
					<div>
						<h3 class="font-medium text-primary">
							Official Luau Documentation
						</h3>
						<p class="text-sm text-muted-foreground">
							Jump right into the deep end with the official Luau documentation.
						</p>
					</div>
					<Icon
						icon="solar:arrow-right-up-linear"
						class="h-6 w-6 text-primary"
					/></div></a
			><a
				href="https://wiki.secondlife.com/wiki/LSL_Portal"
				target="_blank"
				rel="noopener noreferrer"
				class="block p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-colors"
				><div class="flex justify-between items-center">
					<div>
						<h3 class="font-medium text-primary">
							Second Life Scripting Portal
						</h3>
						<p class="text-sm text-muted-foreground">
							Official scripting documentation for Second Life
						</p>
					</div>
					<Icon
						icon="solar:arrow-right-up-linear"
						class="h-6 w-6 text-primary"
					/></div></a
			><a
				href="https://luau-lang.org/getting-started"
				target="_blank"
				rel="noopener noreferrer"
				class="block p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-colors"
				><div class="flex justify-between items-center">
					<div>
						<h3 class="font-medium text-primary">Luau Documentation</h3>
						<p class="text-sm text-muted-foreground">
							Explore the upcoming Luau language specifications
						</p>
					</div>
					<Icon
						icon="solar:arrow-right-up-linear"
						class="h-6 w-6 text-primary"
					/></div
			></a>
			<a
				href="https://community.secondlife.com/forums/forum/304-lsl-scripting"
				target="_blank"
				rel="noopener noreferrer"
				class="block p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-colors"
				><div class="flex justify-between items-center">
					<div>
						<h3 class="font-medium text-primary">Community Forums</h3>
						<p class="text-sm text-muted-foreground">
							Connect with other scripters in the Second Life community
						</p>
					</div>
					<Icon
						icon="solar:arrow-right-up-linear"
						class="h-6 w-6 text-primary"
					/></div
			></a>
		</div>
	</section>

	<img
		class="max-w-[16ch] absolute bottom-0 right-8 text-red-500"
		src="/assets/hell-yeah.svg"
		alt="hell yeah"
	/>
</template>
