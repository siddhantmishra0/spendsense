/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
	    colors: {"outline":"#6c7a71","on-secondary-fixed":"#07006c","background":"#f7f9fb","on-primary":"#ffffff","error":"#ba1a1a","surface-bright":"#f7f9fb","surface-dim":"#d8dadc","error-container":"#ffdad6","secondary-fixed":"#e1e0ff","on-primary-fixed":"#002113","on-tertiary":"#ffffff","on-primary-container":"#00422b","tertiary-fixed-dim":"#4cd7f6","on-tertiary-fixed":"#001f26","primary-container":"#10b981","inverse-primary":"#4edea3","secondary-container":"#6063ee","on-error-container":"#93000a","on-background":"#191c1e","primary-fixed-dim":"#4edea3","surface":"#f7f9fb","tertiary-fixed":"#acedff","surface-container-high":"#e6e8ea","tertiary-container":"#00b2d0","secondary":"#4648d4","surface-container-low":"#f2f4f6","on-surface-variant":"#3c4a42","on-secondary":"#ffffff","surface-container-highest":"#e0e3e5","primary":"#006c49","surface-container-lowest":"#ffffff","on-error":"#ffffff","surface-variant":"#e0e3e5","inverse-surface":"#2d3133","surface-tint":"#006c49","on-secondary-fixed-variant":"#2f2ebe","on-surface":"#191c1e","primary-fixed":"#6ffbbe","outline-variant":"#bbcabf","on-tertiary-container":"#003f4b","surface-container":"#eceef0","secondary-fixed-dim":"#c0c1ff","on-secondary-container":"#fffbff","inverse-on-surface":"#eff1f3","on-tertiary-fixed-variant":"#004e5c","tertiary":"#00687a","on-primary-fixed-variant":"#005236"},
	    borderRadius: {"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},
	    spacing: {"unit":"8px","margin-desktop":"32px","gutter":"24px","margin-mobile":"16px","container-max":"1280px"},
	    fontFamily: {"label-sm":["Inter"],"headline-lg":["Plus Jakarta Sans"],"body-md":["Inter"],"body-lg":["Inter"],"headline-md":["Plus Jakarta Sans"],"display-lg":["Plus Jakarta Sans"]},
	    fontSize: {"label-sm":["12px",{"lineHeight":"16px","letterSpacing":"0.05em","fontWeight":"600"}],"headline-lg":["32px",{"lineHeight":"40px","letterSpacing":"-0.02em","fontWeight":"700"}],"body-md":["16px",{"lineHeight":"24px","letterSpacing":"0em","fontWeight":"400"}],"body-lg":["18px",{"lineHeight":"28px","letterSpacing":"0em","fontWeight":"400"}],"headline-md":["24px",{"lineHeight":"32px","letterSpacing":"-0.01em","fontWeight":"600"}],"display-lg":["48px",{"lineHeight":"56px","letterSpacing":"-0.02em","fontWeight":"700"}]}
	  },
	},
	darkMode: "class",
	plugins: [require('@tailwindcss/typography')],
  }
  
  