'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '@/styles/components/Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const maxScroll = 20;
            const progress = Math.min(scrollTop / maxScroll, 1);
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMounted]);

    const getLinkClass = (href: string) => {
        const normalizedPathname = pathname.replace(/\/$/, '') || '/';
        const normalizedHref = href.replace(/\/$/, '') || '/';
        
        return normalizedPathname === normalizedHref ? styles.focusItem : styles.navItem;
    };

    return (
        <header 
            className={styles.siteHeader}
            style={{
                '--scroll-progress': isMounted ? scrollProgress : 0
            } as React.CSSProperties}
            suppressHydrationWarning={true}
        >
            <div className={styles.headerContainer}>
                <Link href="/" className={styles.logo}>
                    ViegPhunt
                </Link>
                <nav className={styles.navbar}>
                    <div className={styles.navLink}>
                        <Link href="/" className={getLinkClass("/")}>
                            Home
                        </Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/projects" className={getLinkClass("/projects")}>
                            Projects
                        </Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/writeup" className={getLinkClass("/writeup")}>
                            CTF WriteUps
                        </Link>
                    </div>
                    <div className={styles.navLink}>
                        <Link href="/about" className={getLinkClass("/about")}>
                            About Me
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}