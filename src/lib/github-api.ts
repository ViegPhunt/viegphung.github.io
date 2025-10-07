import projectsConfig from "../../projects.json";

export type GitHubRepo = {
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    topics: string[];
    stargazers_count: number;
    updated_at: string;
};

export type WriteupDir = {
    name: string;
    path: string;
    html_url: string;
    lastCommitDate?: string;
};

export type TreeNode = {
    name: string;
    path: string;
    type: 'file' | 'dir';
    children?: TreeNode[];
    hasReadme?: boolean;
};

const WRITEUPS_OWNER = 'ViegPhunt';
const WRITEUPS_REPO = 'CTF-WriteUps';
const BASE_API_URL = 'https://api.github.com';

const createHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ViegPhunt'
    };

    if (typeof window === 'undefined') {
        const token = process.env.GITHUB_TOKEN;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

const handleApiResponse = async (response: Response, context: string) => {
    if (response.status === 403) {
        throw new Error(`Rate limit exceeded for ${context}`);
    }
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Invalid JSON response for ${context}`);
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
};

async function fetchRepository(repoName: string): Promise<GitHubRepo | null> {
    try {
        const url = `${BASE_API_URL}/repos/${repoName}`;
        const response = await fetch(url, { headers: createHeaders() });
        
        const data = await handleApiResponse(response, `repository ${repoName}`);
        return data;
    } catch (error) {
        return null;
    }
}

export async function fetchAllRepositories(): Promise<GitHubRepo[]> {
    const repoPromises = projectsConfig.repositories.map(repoName =>
        fetchRepository(repoName)
    );

    const results = await Promise.all(repoPromises);
    const validRepos = results.filter((repo): repo is GitHubRepo => repo !== null);

    return validRepos;
}

async function fetchCommitDate(path: string): Promise<string | null> {
    try {
        const url = `${BASE_API_URL}/repos/${WRITEUPS_OWNER}/${WRITEUPS_REPO}/commits?path=${encodeURIComponent(path)}&per_page=1`;
        const response = await fetch(url, { headers: createHeaders() });

        const commits = await handleApiResponse(response, `commits for ${path}`);
        
        if (commits?.length > 0) {
            return formatDate(commits[0].commit.committer.date);
        }

        return null;
    } catch (error) {
        return null;
    }
}

function sortDirsByDate(dirs: WriteupDir[]): WriteupDir[] {
    return dirs.sort((a, b) => {
        if (!a.lastCommitDate && !b.lastCommitDate) return 0;
        if (!a.lastCommitDate) return 1;
        if (!b.lastCommitDate) return -1;

        const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split(' - ').map(Number);
            return new Date(year, month - 1, day);
        };

        return parseDate(b.lastCommitDate).getTime() - parseDate(a.lastCommitDate).getTime();
    });
}

export async function fetchAllWriteups(): Promise<WriteupDir[]> {
    try {
        const url = `${BASE_API_URL}/repos/${WRITEUPS_OWNER}/${WRITEUPS_REPO}/contents`;
        const response = await fetch(url, { headers: createHeaders() });

        const items = await handleApiResponse(response, 'writeups repository contents');
        if (!items) return [];

        const dirs = items.filter((item: any) => item.type === 'dir');

        const dirsWithDates = await Promise.all(
            dirs.map(async (dir: any) => {
                const lastCommitDate = await fetchCommitDate(dir.path);
                return {
                    name: dir.name,
                    path: dir.path,
                    html_url: dir.html_url,
                    lastCommitDate
                };
            })
        );

        const sortedDirs = sortDirsByDate(dirsWithDates);

        return sortedDirs;
    } catch (error) {
        return [];
    }
}

export async function fetchWriteupTree(): Promise<TreeNode[]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const url = `${BASE_API_URL}/repos/${WRITEUPS_OWNER}/${WRITEUPS_REPO}/git/trees/main?recursive=1`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { 
                headers: createHeaders(),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            const data = await handleApiResponse(response, 'writeups tree structure');
            if (!data?.tree) {
                throw new Error('Invalid response: missing tree data');
            }

            return buildTreeStructure(data.tree);

        } catch (error) {
            lastError = error as Error;
            
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    return [];
}

function buildTreeStructure(treeData: any[]): TreeNode[] {
    const rootNodes: TreeNode[] = [];
    const pathMap = new Map<string, TreeNode>();

    treeData.forEach((item: any) => {
        const parts = item.path.split('/');
        const node: TreeNode = {
            name: parts[parts.length - 1],
            path: item.path,
            type: item.type === 'tree' ? 'dir' : 'file',
            children: item.type === 'tree' ? [] : undefined
        };
        pathMap.set(item.path, node);
    });

    treeData.forEach((item: any) => {
        const parts = item.path.split('/');
        const node = pathMap.get(item.path);
        
        if (!node) return;
        
        if (parts.length === 1) {
            if (node.type === 'dir') {
                rootNodes.push(node);
            }
        } else {
            const parentPath = parts.slice(0, -1).join('/');
            const parent = pathMap.get(parentPath);
            
            if (parent?.children) {
                parent.children.push(node);
                
                if (node.type === 'file' && node.name.toLowerCase() === 'readme.md') {
                    parent.hasReadme = true;
                }
            }
        }
    });

    return rootNodes;
}