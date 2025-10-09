'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up');
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        let ticking = false;

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const maxScroll = 20;
            const progress = Math.min(scrollTop / maxScroll, 1);
            setScrollProgress(progress);

            const isMobile = window.matchMedia('(max-width: 1150px)').matches;
            if (isMobile && Math.abs(scrollTop - lastScrollY) > 50) {
                setScrollDir(scrollTop > lastScrollY ? 'down' : 'up');
                setLastScrollY(scrollTop);
            }

            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [lastScrollY, isMounted]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }, [isMenuOpen]);

    const getLinkClass = (href: string) => {
        const normalizedPathname = pathname.replace(/\/$/, '') || '/';
        const normalizedHref = href.replace(/\/$/, '') || '/';
        return normalizedPathname === normalizedHref ? styles.focusItem : styles.navItem;
    };

    const handleOverlayClick = () => setIsMenuOpen(false);

    return (
        <header
            className={`${styles.siteHeader} ${scrollDir === 'down' ? styles.hide : styles.show}`}
            style={{
                '--scroll-progress': isMounted ? scrollProgress : 0
            } as React.CSSProperties}
            suppressHydrationWarning={true}
        >
            <div className={styles.headerContainer}>
                <Link href="/" className={styles.logo}>ViegPhunt</Link>
                <div
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"/>
                    </svg>
                </div>
                <div
                    ref={overlayRef}
                    className={`${styles.overlay} ${isMenuOpen ? styles.active : ''}`}
                    onClick={handleOverlayClick}
                />
                <nav className={`${styles.navBar} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <div className={styles.navLink}>
                        <Link href="/" className={getLinkClass("/")} onClick={() => setIsMenuOpen(false)}>Home</Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/projects" className={getLinkClass("/projects")} onClick={() => setIsMenuOpen(false)}>Projects</Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/writeup" className={getLinkClass("/writeup")} onClick={() => setIsMenuOpen(false)}>CTF WriteUps</Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/about" className={getLinkClass("/about")} onClick={() => setIsMenuOpen(false)}>About Me</Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}