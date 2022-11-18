/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				"serverbar-bg-dark": "#202225",
				"profile-bg-dark": "#292B2F",
				"sidebar-bg-dark": "#2F3136",
				"foreground-bg-dark": "#36393F",
				"mention-bg": "#5865F24D",
				"msgInput-bg-dark": "#40444B",
				"interactable-bg-dark": "#202225",
				"interactable-selected-bg-dark": "#4F545C99",
				"primary-text-dark": "#DCDDDE",
				"sidebar-text-dark": "#96989D",
				"placeholder-text-dark": "#A3A6AA",
				"interactable-text-dark": "#B9BBBE",
				"link-text": "#00AFF4",
				"strike-text": "#ED4245",
				"add-text": "#3BA55D",
			},
		},
	},
	plugins: [],
};
