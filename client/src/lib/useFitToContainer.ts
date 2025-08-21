import { useEffect } from 'react';

export function isIOS(): boolean {
	if (typeof navigator === 'undefined') return false;
	const ua = navigator.userAgent || '';
	const platform = (navigator as any).platform || '';
	// iPhone, iPad, iPod, and iPadOS on Safari (MacIntel with touch)
	const isiOSUA = /iP(hone|od|ad)/.test(ua);
	const isIPadOS = /MacIntel/.test(platform) && (navigator as any).maxTouchPoints > 1;
	return isiOSUA || isIPadOS;
}

type Options = {
	padding?: number;
	enabled?: boolean;
};

export function useFitToContainer(
	wrapperRef: React.RefObject<HTMLElement>,
	targetRef: React.RefObject<HTMLElement>,
	{ padding = 4, enabled = true }: Options = {}
) {
	useEffect(() => {
		if (!enabled) return;
		const wrapper = wrapperRef.current as HTMLElement | null;
		const target = targetRef.current as HTMLElement | null;
		if (!wrapper || !target) return;

		// Ensure readable font-size to avoid iOS auto-zoom
		(target as HTMLElement).style.fontSize = '16px';
		(target as HTMLElement).style.transformOrigin = 'left center';

		const ro = new ResizeObserver(() => {
			fit();
		});
		try {
			ro.observe(wrapper);
			ro.observe(target);
		} catch {}

		const fit = () => {
			const wRect = wrapper.getBoundingClientRect();
			const tRect = target.getBoundingClientRect();
			if (!wRect.width || !tRect.width) return;
			const availableW = Math.max(0, wRect.width - padding);
			const availableH = Math.max(0, wRect.height - padding);
			const scaleW = availableW / tRect.width;
			const scaleH = availableH > 0 ? availableH / tRect.height : 1;
			const scale = Math.min(1, scaleW, scaleH);
			if (scale < 0.999) {
				(target as HTMLElement).style.transform = `scale(${scale})`;
			} else {
				(target as HTMLElement).style.transform = '';
			}
		};

		const raf = requestAnimationFrame(fit);
		window.addEventListener('orientationchange', fit);
		window.addEventListener('resize', fit);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('orientationchange', fit);
			window.removeEventListener('resize', fit);
			try {
				ro.disconnect();
			} catch {}
		};
	}, [wrapperRef, targetRef, padding, enabled]);
}




