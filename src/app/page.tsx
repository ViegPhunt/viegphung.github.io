'use client'

import Link from 'next/link'
import { AnimatedBox } from '@/components/ChangePage'
import styles from '@/styles/pages/home.module.css'

export default function HomePage() {
    return (
        <AnimatedBox delay={100}>
            <div className={`container ${styles.homeContainer}`}>
                <div className={styles.pageHeading}>
                    <div className={styles.pageHeadingContent}>
                        <h1 className={styles.homeName}>ViegPhunt</h1>
                        <h2 className={styles.homeTitle}>Welcome to my personal website!</h2>
                        <p className={styles.homeDescription}>
                            A collection of projects, CTF write-ups, and technology notes I’ve gathered through my learning process.
                        </p>
                    </div>
                </div>

                <div className="divider"></div>

                <div className={styles.quickLinks}>
                    <AnimatedBox delay={300}>
                        <Link href="/projects" className={styles.linkCard}>
                        <div className={styles.linkIcon}>💻</div>
                        <div className={styles.linkContent}>
                            Projects
                        </div>
                        </Link>
                    </AnimatedBox>

                    <AnimatedBox delay={400}>
                        <Link href="/writeup" className={styles.linkCard}>
                        <div className={styles.linkIcon}>🛡️</div>
                        <div className={styles.linkContent}>
                            CTF Writeups
                        </div>
                        </Link>
                    </AnimatedBox>

                    <AnimatedBox delay={500}>
                        <Link href="/about" className={styles.linkCard}>
                        <div className={styles.linkIcon}>👋</div>
                        <div className={styles.linkContent}>
                            About Me
                        </div>
                        </Link>
                    </AnimatedBox>
                </div>
            </div>
        </AnimatedBox>
    )
}