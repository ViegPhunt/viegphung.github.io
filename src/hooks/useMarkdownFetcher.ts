import { useState, useEffect, useCallback } from 'react';

interface UseMarkdownFetcherOptions {
    url?: string | null;
    path?: string | null;
    repo?: string;
    autoFetch?: boolean;
}

interface UseMarkdownFetcherResult {
    content: string;
    loading: boolean;
    error: boolean;
    githubUrl: string;
    refetch: () => void;
}

const DEFAULT_REPO = 'ViegPhunt/CTF-WriteUps';
const BASE_WEB_URL = 'https://github.com';

export function useMarkdownFetcher(options: UseMarkdownFetcherOptions): UseMarkdownFetcherResult {
    const { url, path, repo = DEFAULT_REPO, autoFetch = true } = options;
    
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [githubUrl, setGithubUrl] = useState<string>('');

    const convertToRawUrl = useCallback((inputUrl: string): string => {
        if (inputUrl.includes('raw.githubusercontent.com')) {
            return inputUrl;
        }

        const webMatch = inputUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
        if (webMatch) {
            const [, owner, repoName, branch, filePath] = webMatch;
            return 'https://raw.githubusercontent.com/' + owner + '/' + repoName + '/' + branch + '/' + filePath;
        }

        return inputUrl;
    }, []);

    const generateWebUrl = useCallback((repoName: string, filePath: string): string => {
        return BASE_WEB_URL + '/' + repoName + '/blob/main/' + filePath;
    }, []);

    const fetchContent = useCallback(async () => {
        if (!url && (!path || !path.trim())) {
            setError(true);
            return;
        }

        let apiUrl = '';
        let webUrl = '';

        try {
            if (url) {
                const rawUrl = convertToRawUrl(url);
                if (url.includes('/blob/')) {
                    webUrl = url;
                    const blobMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/);
                    if (blobMatch) {
                        const [, owner, repoName, branch, filePath] = blobMatch;
                        apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}?ref=${branch}`;
                    }
                } else if (rawUrl.includes('raw.githubusercontent.com')) {
                    const rawMatch = rawUrl.match(/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/);
                    if (rawMatch) {
                        const [, owner, repoName, branch, filePath] = rawMatch;
                        webUrl = generateWebUrl(owner + '/' + repoName, filePath);
                        apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}?ref=${branch}`;
                    }
                }
            } else if (path) {
                const [owner, repoName] = repo.split('/');
                webUrl = generateWebUrl(repo, path);
                apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}?ref=main`;
            }

            if (!apiUrl) {
                throw new Error('Unable to generate API URL');
            }

            setLoading(true);
            setError(false);
            setGithubUrl(webUrl);

            const headers: Record<string, string> = {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'ViegPhunt'
            };

            if (typeof window === 'undefined' && process.env.GITHUB_TOKEN) {
                headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
            }

            const response = await fetch(apiUrl, { headers });

            if (!response.ok) {
                throw new Error('GitHub Error: ' + response.statusText + ' (' + response.status + ')');
            }

            const data = await response.json();
            
            if (data.content) {
                const content = atob(data.content);
                setContent(content);
            } else {
                throw new Error('No content found');
            }

        } catch (err) {
            setError(true);
            setContent('');
        } finally {
            setLoading(false);
        }
    }, [url, path, repo, convertToRawUrl, generateWebUrl]);

    const resetState = useCallback(() => {
        setContent('');
        setError(false);
        setLoading(false);
        setGithubUrl('');
    }, []);

    useEffect(() => {
        if (autoFetch) {
            if (url || (path && path.trim())) {
                fetchContent();
            } else {
                resetState();
            }
        }
    }, [autoFetch, fetchContent, resetState, url, path]);

    return {
        content,
        loading,
        error,
        githubUrl,
        refetch: fetchContent
    };
}
