'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedBox } from '@/components/ChangePage';
import { useMarkdownFetcher } from '@/hooks/useMarkdownFetcher';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { fetchWriteupTree, TreeNode } from '@/lib/github-api';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import styles from "@/styles/pages/writeup.module.css";

function Portal({ children }: { children: React.ReactNode }) {
    if (typeof window === 'undefined') return null;
    return createPortal(children, document.body);
}

export default function CTFWriteUp() {
    const [selectedReadme, setSelectedReadme] = useState<string | null>(null);
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [treeLoading, setTreeLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [headerVisible, setHeaderVisible] = useState(true);

    useEffect(() => {
        const waitForHeader = () => {
            const header = document.querySelector('[class*="siteHeader"]');
            if (!header) {
                requestAnimationFrame(waitForHeader);
                return;
            }

            const updateHeaderVisibility = () => {
                const classList = Array.from(header.classList);
                const isHidden = classList.some(c => c.includes('hide'));
                setHeaderVisible(!isHidden);
            };

            updateHeaderVisibility();

            const observer = new MutationObserver(updateHeaderVisibility);
            observer.observe(header, { attributes: true, attributeFilter: ['class'] });

            return () => observer.disconnect();
        };

        waitForHeader();
    }, []);

    const { content, loading: markdownLoading, error, githubUrl } = useMarkdownFetcher({
        path: selectedReadme, repo: 'ViegPhunt/CTF-WriteUps', autoFetch: selectedReadme !== null
    });

    useEffect(() => {
        const loadTree = async () => {
            try { setTreeLoading(true); setTree(await fetchWriteupTree()); }
            finally { setTreeLoading(false); }
        };
        loadTree();
    }, []);

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 1150px)');
        const apply = () => setIsMobile(mql.matches);
        apply();
        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', apply);
            return () => mql.removeEventListener('change', apply);
        } else {
            mql.addListener(apply);
            return () => mql.removeListener(apply);
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }, [isMenuOpen]);

    const handleOverlayClick = () => setIsMenuOpen(false);

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const s = new Set(prev);
            s.has(path) ? s.delete(path) : s.add(path);
            return s;
        });
    };

    const handleFolderClick = (node: TreeNode) => {
        if (node.hasReadme) {
            setSelectedReadme(`${node.path}/README.md`);
        } else {
            toggleFolder(node.path);
        }
    };

    const handlePageClick = (node: TreeNode) => {
        setSelectedReadme(`${node.path}/README.md`);
        if (isMobile && isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        const hasChildren = node.children && node.children.length > 0;
        
        const isPage = node.type === 'dir' && node.hasReadme;
        const isFolder = node.type === 'dir' && !node.hasReadme;
        
        return (
            <div key={node.path} className={styles.treeNode}>
                <div 
                    className={`${styles.nodeItem} ${isPage || isFolder ? styles.clickable : ''}`}
                    style={{ paddingLeft: `${level * 20 + 10}px` }}
                    onClick={() => isPage ? handlePageClick(node) : isFolder ? handleFolderClick(node) : undefined}
                >
                    {isFolder && (
                        <span className={styles.folderIcon}>
                            {hasChildren ? (
                                isExpanded ? 
                                <FolderOpen size={20} color="#ede0d4" /> : 
                                <Folder size={20} color="#ede0d4" />
                            ) : (
                                <Folder size={20} color="#ede0d4" />
                            )}
                        </span>
                    )}
                    {isPage && (
                        <FileText size={20} className={styles.pageIcon} color="#89b4fa" />
                    )}
                    <span className={styles.nodeName}>
                        {node.name}
                    </span>
                </div>
                
                {isFolder && isExpanded && hasChildren && (
                    <div className={styles.children}>
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const sidebarInner = treeLoading
        ? <div className={styles.loading}>Loading folder structure...</div>
        : (
        <div className={styles.treeContainer}>
            <div className={styles.treeHeader}>CTF WriteUps</div>
            <div className={styles.treeContent}>{tree.map(n => renderNode(n))}</div>
        </div>
        );

    return (
        <AnimatedBox>
            <div className={`container ${styles.writeupContainer}`}>
                {isMobile && (
                    <Portal>
                        <div className={`${styles.menuButton} ${headerVisible ? styles.withHeader : styles.noHeader}`} 
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

                        <div 
                            className={`
                                ${styles.sidebar}
                                ${isMenuOpen ? styles.sidebarOpen : ''}
                                ${headerVisible ? styles.withHeader : styles.noHeader}
                            `}
                        >
                            {sidebarInner}
                        </div>
                    </Portal>
                )}

                <div className={styles.twoColumnLayout}>
                    {!isMobile && (
                        <aside className={styles.sidebar}>
                            {sidebarInner}
                        </aside>
                    )}
                    
                    <div className={styles.mainContent}>
                        <MarkdownRenderer
                            content={content}
                            loading={markdownLoading}
                            error={error}
                            githubUrl={githubUrl}
                            filePath={selectedReadme || ''}
                            welcomeMessage={'CTF WriteUps'}
                        />
                    </div>
                </div>
            </div>
        </AnimatedBox>
    );
}