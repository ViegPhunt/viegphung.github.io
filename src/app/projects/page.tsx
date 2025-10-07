'use client';

import { useState, useEffect } from 'react';
import { AnimatedBox } from '@/components/ChangePage';
import { GitHubRepo, formatDate } from '@/lib/github-api';
import { getRepositories } from '@/lib/static-loader';
import { useMarkdownFetcher } from '@/hooks/useMarkdownFetcher';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import styles from "@/styles/pages/projects.module.css";

export default function Projects() {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

    const readmeUrl = selectedRepo
        ? `https://raw.githubusercontent.com/${selectedRepo}/main/README.md`
        : null;

    const { content, loading: markdownLoading, error: markdownError, githubUrl } = useMarkdownFetcher({
        url: readmeUrl || undefined
    });

    useEffect(() => {
        let mounted = true;

        const loadRepos = async () => {
            try {
                setLoading(true);
                setError(null);

                const repositories = await getRepositories();

                if (mounted) {
                    setRepos(repositories);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || 'Failed to load projects');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadRepos();
        return () => { mounted = false; };
    }, []);

    const handleProjectClick = (repoFullName: string) => {
        if (selectedRepo === repoFullName) {
            setSelectedRepo(null);
        } else {
            setSelectedRepo(repoFullName);
        }
    };

    const renderProjects = () => {
        if (error || (repos.length === 0 && !loading)) {
            return (
                <div className='error'>
                    Failed to load projects. Please try again later.
                </div>
            );
        }

        return (
            <AnimatedBox trigger={!loading && repos.length > 0}>
                <div className={styles.projectsList}>
                    {repos.map((repo) => {
                        const isSelected = selectedRepo === repo.full_name;

                        return (
                            <div key={repo.full_name} className={styles.projectWrapper}>
                                <div
                                    className={`${styles.projectItem} ${isSelected ? styles.projectItemActive : ''}`}
                                >
                                    <div className={styles.projectHeader}>
                                        <div className={styles.projectTitle}>
                                            {repo.name}
                                        </div>
                                        <span className={styles.projectStarCount}>⭐ {repo.stargazers_count}</span>
                                        <span className={styles.projectUpdatedAt}>Updated: {formatDate(repo.updated_at)}</span>
                                    </div>
                                    <p className={styles.projectBody}>
                                        {repo.description || '...'}
                                    </p>
                                    <div className={styles.tagList}>
                                        {repo.topics?.slice(0, 3).map((topic) => (
                                            <span key={topic} className={styles.tagItem}>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.buttonGroup}>
                                        <button
                                            className={styles.viewButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProjectClick(repo.full_name);
                                            }}
                                        >
                                            {isSelected ? 'Collapse' : 'View'}
                                        </button>
                                        <a
                                            href={`https://github.com/${repo.full_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.githubButton}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            GitHub
                                        </a>
                                    </div>

                                    {isSelected && (
                                        <div className={styles.readmeContainer}>
                                            <MarkdownRenderer
                                                content={content}
                                                loading={markdownLoading}
                                                error={markdownError}
                                                githubUrl={githubUrl}
                                                filePath={'README.md'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </AnimatedBox>
        );
    };

    return (
        <AnimatedBox>
            <div className='container'>
                { loading && <p className='loading'>Loading...</p> }

                { renderProjects() }
            </div>
        </AnimatedBox>
    );
}