import { GitHubRepo, WriteupDir, fetchAllRepositories, fetchAllWriteups } from '@/lib/github-api';

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const REPOS_CACHE_KEY = 'github_repos_cache';
const WRITEUPS_CACHE_KEY = 'github_writeups_cache';

type CacheData<T> = {
    data: T[];
    timestamp: number;
};

function getCachedData<T>(key: string): T[] | null {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const parsedCache: CacheData<T> = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
        
        if (isExpired) {
            localStorage.removeItem(key);
            return null;
        }

        return parsedCache.data;
    } catch (error) {
        return null;
    }
}

function setCachedData<T>(key: string, data: T[]): void {
    const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

export async function getRepositories(): Promise<GitHubRepo[]> {
    try {
        const cached = getCachedData<GitHubRepo>(REPOS_CACHE_KEY);
        if (cached) {
            return cached;
        }

        const repos = await fetchAllRepositories();
        
        setCachedData(REPOS_CACHE_KEY, repos);
        
        return repos;
    } catch (error) {
        return [];
    }
}

export async function getWriteups(): Promise<WriteupDir[]> {
    try {
        const cached = getCachedData<WriteupDir>(WRITEUPS_CACHE_KEY);
        if (cached) {
            return cached;
        }

        const writeups = await fetchAllWriteups();
        
        setCachedData(WRITEUPS_CACHE_KEY, writeups);
        
        return writeups;
    } catch (error) {
        return [];
    }
}

export function clearCache(): void {
    localStorage.removeItem(REPOS_CACHE_KEY);
    localStorage.removeItem(WRITEUPS_CACHE_KEY);
}

export function getCacheStatus(): { repos: boolean; writeups: boolean } {
    return {
        repos: getCachedData<GitHubRepo>(REPOS_CACHE_KEY) !== null,
        writeups: getCachedData<WriteupDir>(WRITEUPS_CACHE_KEY) !== null
    };
}