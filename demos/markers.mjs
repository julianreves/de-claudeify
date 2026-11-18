// What the showcase points at on each "before" page. sel is a CSS selector in before.html.
// at: where the number sits. "in" is inside the element, near its top left. "left" is in the margin to its left.
export const MARKERS = {
  landing: [
    { sel: '.badge', at: 'left', label: 'A pill badge with a pulsing dot', rules: ['badge', 'status-dot', 'emoji'] },
    { sel: '.eyebrow', at: 'left', label: 'An eyebrow joined by dots', rules: ['eyebrow', 'dotted-meta', 'tracked-caps'] },
    { sel: 'h1 em', at: 'left', label: 'One italic word in the headline', rules: ['heading-italic'] },
    { sel: '.sub', at: 'left', label: 'Stock phrases and a "not X, it’s Y" sentence', rules: ['ai-phrase', 'contrast-formula'] },
    { sel: '.btn.primary', at: 'left', label: 'A gradient button with an arrow', rules: ['gradient', 'shadow', 'arrow-link'] },
    { sel: '.featured', at: 'left', label: 'Press logos nobody gave you', rules: ['invented-proof'] },
    { sel: '.section-title', at: 'left', label: 'A Title Case heading that names a topic', rules: ['heading-case', 'topic-heading'] },
    { sel: '.feature-card', at: 'in', label: 'A bordered, shadowed card with an emoji in a tile', rules: ['card-box', 'shadow', 'icon-tile', 'emoji'] },
    { sel: '.wine-card .tag', at: 'in', label: 'A "Best Seller" pill', rules: ['badge'] },
    { sel: '.stats', at: 'in', label: 'Three invented numbers in a row', rules: ['invented-proof', 'stat-row'] },
    { sel: '.testimonial', at: 'in', label: 'A colored left bar and a quote nobody said', rules: ['accent-bar', 'shadow'] },
    { sel: '.cta', at: 'in', label: 'The gradient closing band', rules: ['gradient', 'cta-band'] },
    { sel: 'hr', at: 'in', label: 'A rule that separates nothing', rules: ['section-rule'] },
  ],
  dashboard: [
    { sel: 'aside .logo', at: 'in', label: 'A logo filled with a gradient', rules: ['gradient-text'] },
    { sel: 'aside a:nth-of-type(2)', at: 'in', label: 'Emoji standing in for icons', rules: ['emoji'] },
    { sel: '.top h1', at: 'in', label: 'A greeting with an emoji', rules: ['emoji'] },
    { sel: '.live', at: 'in', label: 'A pill with a pulsing dot', rules: ['badge', 'status-dot'] },
    { sel: '.stat-card', at: 'in', label: 'Cards with a border, radius, shadow and a gradient tile', rules: ['card-box', 'shadow', 'icon-tile', 'gradient'] },
    { sel: '.stat-card .badge', at: 'in', label: 'Percent change in a pill', rules: ['badge'] },
    { sel: '.panel .sub', at: 'in', label: 'A subtitle joined by dots', rules: ['dotted-meta'] },
    { sel: '.bars div', at: 'in', label: 'Bars with a gradient and rounded tops', rules: ['gradient'] },
    { sel: '.progress .fill', at: 'in', label: 'Rounded progress bars with a gradient', rules: ['gradient', 'radius'] },
    { sel: '.attention', at: 'in', label: 'A tinted box with an emoji', rules: ['callout-box', 'emoji'] },
    { sel: 'th', at: 'in', label: 'Gridlines on every cell, headers in capitals', rules: ['rule-line', 'tracked-caps'] },
    { sel: '.callout', at: 'in', label: 'A tinted callout with a left bar', rules: ['callout-box', 'accent-bar', 'emoji'] },
  ],
  slide: [
    { sel: '.eyebrow', at: 'in', label: 'An eyebrow joined by dots', rules: ['eyebrow', 'dotted-meta', 'tracked-caps'] },
    { sel: '.cover h1', at: 'in', label: 'A gradient headline', rules: ['gradient-text'] },
    { sel: '.cover .subtitle', at: 'in', label: 'A subtitle joined by dots', rules: ['dotted-meta'] },
    { sel: '.pill', at: 'in', label: 'A pill with an emoji', rules: ['badge', 'emoji'] },
    { sel: '.card', at: 'in', label: 'A glass card with a border, blur and shadow', rules: ['card-box', 'glass', 'shadow'] },
    { sel: '.icon', at: 'in', label: 'An emoji in a rounded tile', rules: ['icon-tile', 'emoji'] },
    { sel: '.card:nth-child(3) p', at: 'in', label: 'Stock marketing words', rules: ['ai-phrase'] },
    { sel: '.panel', at: 'in', label: 'A chart inside a glass card', rules: ['card-box', 'glass', 'shadow'] },
    { sel: '.bars div', at: 'in', label: 'Bars with a gradient and rounded tops', rules: ['gradient'] },
    { sel: '.insight', at: 'in', label: 'A tinted callout with a left bar and an emoji', rules: ['callout-box', 'accent-bar', 'emoji'] },
    { sel: '.footer', at: 'in', label: 'A rule and an em dash in the footer', rules: ['section-rule', 'em-dash'] },
  ],
};

export const TITLES = { landing: 'Page', dashboard: 'Dashboard', slide: 'Slide' };
