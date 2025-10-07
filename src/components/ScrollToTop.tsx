'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/components/ScrollToTop.module.css';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [footerHeight, setFooterHeight] = useState(0);
    const [bottomOffset, setBottomOffset] = useState(50);

    useEffect(() => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const updateFooterHeight = () => {
            const rect = footer.getBoundingClientRect();
            setFooterHeight(rect.height);
            document.documentElement.style.setProperty('--height-footer', `${rect.height}px`);
        };

        updateFooterHeight();

        const resizeObserver = new ResizeObserver(updateFooterHeight);
        resizeObserver.observe(footer);

        window.addEventListener('resize', updateFooterHeight);

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            setIsVisible(scrollY > 500);

            const footerTop = docHeight - footerHeight;
            const overlap = Math.max(0, scrollY + windowHeight - footerTop);
            const ratio = Math.min(overlap / footerHeight, 1);

            const newBottom = 50 + ratio * footerHeight;
            setBottomOffset(newBottom);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateFooterHeight);
            resizeObserver.disconnect();
        };
    }, [footerHeight]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
            style={{ bottom: `${bottomOffset}px` }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}