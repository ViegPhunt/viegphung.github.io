'use client';

import { useState, useEffect } from 'react';
import { AnimatedBox } from '@/components/ChangePage';
import { useMarkdownFetcher } from '@/hooks/useMarkdownFetcher';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { fetchWriteupTree, TreeNode } from '@/lib/github-api';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import styles from "@/styles/pages/writeup.module.css";

export default function CTFWriteUp() {
    const [selectedReadme, setSelectedReadme] = useState<string | null>(null);
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [treeLoading, setTreeLoading] = useState(true);

    const { content, loading: markdownLoading, error, githubUrl } = useMarkdownFetcher({
        path: selectedReadme,
        repo: 'ViegPhunt/CTF-WriteUps',
        autoFetch: selectedReadme !== null
    });

    useEffect(() => {
        const loadTree = async () => {
            try {
                setTreeLoading(true);
                const treeData = await fetchWriteupTree();
                setTree(treeData);
            } finally {
                setTreeLoading(false);
            }
        };
        
        loadTree();
    }, []);

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
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
                    onClick={() => {
                        if (isPage) {
                            handlePageClick(node);
                        } else if (isFolder) {
                            handleFolderClick(node);
                        }
                    }}
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

    return (
        <AnimatedBox>
            <div className='container'>
                <div className={styles.twoColumnLayout}>
                    <div className={styles.sidebar}>
                        {treeLoading ? (
                            <div className={styles.loading}>Loading folder structure...</div>
                        ) : (
                            <div className={styles.treeContainer}>
                                <div className={styles.treeHeader}>
                                    CTF WriteUps
                                </div>
                                <div className={styles.treeContent}>
                                    {tree.map(node => renderNode(node))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.mainContent}>
                        <MarkdownRenderer
                            content={content}
                            loading={markdownLoading}
                            error={error}
                            githubUrl={githubUrl}
                            filePath={selectedReadme || ''}
                            welcomeMessage={'This page contains my CTF WriteUps'}
                        />
                    </div>
                </div>
            </div>
        </AnimatedBox>
    );
}