/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				//bg-dark
				"dc-serverbar-bg-dark": "#202225",
				"dc-profile-bg-dark": "#292B2F",
				"dc-sidebar-bg-dark": "#2F3136",
				"dc-foreground-bg-dark": "#36393F",
				"dc-msgInput-bg-dark": "#40444B",
				"dc-interactable-bg-dark": "#202225",
				"dc-interactable-selected-bg-dark": "#4F545C99",
				"dc-msg-selected-dark": "#04040512",
				//text-dark
				"dc-primary-text-dark": "#DCDDDE",
				"dc-sidebar-text-dark": "#96989D",
				"dc-placeholder-text-dark": "#A3A6AA",
				"dc-interactable-text-dark": "#B9BBBE",
				//bg-light
				"dc-serverbar-bg": "#E3E5E8",
				"dc-profile-bg": "#EBEDEF",
				"dc-sidebar-bg": "#F2F3F5",
				"dc-foreground-bg": "#FFFFFF",
				//misc
				"dc-mention-bg": "#5865F24D",
				"dc-link-text": "#00AFF4",
				"dc-strike-text": "#ED4245",
				"dc-add-text": "#3BA55D",
			},
		},
	},
	plugins: [],
};
