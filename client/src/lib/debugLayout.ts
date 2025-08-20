export function isDebugLayoutEnabled(): boolean {
	try {
		const fromQuery = new URLSearchParams(window.location.search).get('debugLayout');
		if (fromQuery === '1' || fromQuery === 'true') {
			localStorage.setItem('debugLayout', '1');
			return true;
		}
		if (fromQuery === '0' || fromQuery === 'false') {
			localStorage.removeItem('debugLayout');
			return false;
		}
		return localStorage.getItem('debugLayout') === '1';
	} catch {
		return false;
	}
}

export function measureElement(el: HTMLElement | null) {
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return {
		w: Math.round(r.width),
		h: Math.round(r.height),
		t: Math.round(r.top),
		l: Math.round(r.left),
	};
}


