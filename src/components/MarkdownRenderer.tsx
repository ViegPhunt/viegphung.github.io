'use client';

import React, { memo, useState, Children, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Scrollbar from './Scrollbar';
import styles from '@/styles/components/MarkdownRenderer.module.css';

interface MarkdownRendererProps {
    content: string;
    loading?: boolean;
    error?: boolean;
    githubUrl?: string;
    filePath?: string;
    welcomeMessage?: string;
}

const CodeBlock = ({ children, className, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const codeContainerRef = useRef<HTMLDivElement>(null);
    const [actualScrollContainer, setActualScrollContainer] = useState<HTMLElement | null>(null);
    const actualScrollRef = useRef<HTMLElement | null>(null);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    React.useEffect(() => {
        actualScrollRef.current = actualScrollContainer;
    }, [actualScrollContainer]);

    React.useEffect(() => {
        const findScrollContainer = () => {
            if (!codeContainerRef.current) return;

            const pre = codeContainerRef.current.querySelector('pre');
            if (pre) {
                setActualScrollContainer(pre);
                actualScrollRef.current = pre;
            } else {
                setActualScrollContainer(codeContainerRef.current);
                actualScrollRef.current = codeContainerRef.current;
            }
        };

        const timeoutId = setTimeout(findScrollContainer, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

return match ? (
        <div className={styles.codeWrapper}>
            <div ref={codeContainerRef} className={styles.codeContainer}>
                <SyntaxHighlighter 
                    style={vscDarkPlus}
                    language={language} 
                    customStyle={{
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                        overflowX: 'auto',
                    }}
                >
                    {code}
                </SyntaxHighlighter>
                <button className={styles.copyButton} onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            {actualScrollContainer && (
                <Scrollbar direction="horizontal" containerRef={actualScrollRef} />
            )}
        </div>
    ) : (
        <code className={styles.inlineCode} {...props}>
            {children}
        </code>
    );
};

const DetailsComponent = ({ children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleCopy = async () => {
        const childArray = Children.toArray(children);
        const contentWithoutSummary = childArray.filter((child) => {
            if (React.isValidElement(child)) {
                return child.type !== 'summary';
            }
            return true;
        });
        
        const textContent = contentWithoutSummary.map((child) => {
            if (typeof child === 'string') return child;
            if (React.isValidElement(child)) {
                const el = child as React.ReactElement<{ children?: React.ReactNode }>;
                const extractText = (node: any): string => {
                    if (typeof node === 'string') return node;
                    if (Array.isArray(node)) return node.map(extractText).join(' ');
                    if (React.isValidElement(node)) {
                        const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                        return extractText(element.props.children);
                    }
                    return '';
                };
                return extractText(el.props.children);
            }
            return '';
        }).join(' ').trim();
        
        await navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <details className={'details'} onToggle={handleToggle} {...props}>
            {children}
            {isOpen && (
                <button className={styles.copyButton} onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            )}
        </details>
    );
};

const createSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
};

const HeadingComponent = ({ level, children, ...props }: any) => {
    const text = Children.toArray(children).join('');
    const slug = createSlug(text);
    
    const headingProps = { id: slug, ...props };
    
    switch (level) {
        case 1:
            return <h1 {...headingProps}>{children}</h1>;
        case 2:
            return <h2 {...headingProps}>{children}</h2>;
        case 3:
            return <h3 {...headingProps}>{children}</h3>;
        case 4:
            return <h4 {...headingProps}>{children}</h4>;
        case 5:
            return <h5 {...headingProps}>{children}</h5>;
        case 6:
            return <h6 {...headingProps}>{children}</h6>;
        default:
            return <h1 {...headingProps}>{children}</h1>;
    }
};

function MarkdownRendererComponent({
    content,
    loading = false,
    error = false,
    githubUrl = '',
    filePath = '',
    welcomeMessage,
}: MarkdownRendererProps) {
    const transformImageUrl = (src: string) => {
        if (!filePath || !src) return src;
        if (src.startsWith('http') || src.startsWith('/')) return src;

        const basePath = filePath.substring(0, filePath.lastIndexOf('/'));
        return new URL(`${basePath}/${src}`, 'https://raw.githubusercontent.com/ViegPhunt/CTF-WriteUps/main/').href;
    };

    if (!content && !loading && !error && welcomeMessage) {
        return <div className={styles.welcome}><h2>{welcomeMessage}</h2></div>;
    }

    if (loading) {
        return <div className={styles.loading}>Loading content...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h1>Failed to Load Content</h1>
                {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                        View on GitHub
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className={styles.markdown}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code: CodeBlock,
                    details: DetailsComponent,
                    h1: (props: any) => <HeadingComponent level={1} {...props} />,
                    h2: (props: any) => <HeadingComponent level={2} {...props} />,
                    h3: (props: any) => <HeadingComponent level={3} {...props} />,
                    h4: (props: any) => <HeadingComponent level={4} {...props} />,
                    h5: (props: any) => <HeadingComponent level={5} {...props} />,
                    h6: (props: any) => <HeadingComponent level={6} {...props} />,
                    a: ({ href, children, ...props }) => {
                        const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
                        const isVideoLink = href && (
                            href.includes('github.com/user-attachments/assets/') ||
                            videoExtensions.some(ext => 
                                href.toLowerCase().includes(ext) || 
                                (typeof children === 'string' && children.toLowerCase().includes(ext))
                            )
                        );
                        
                        if (isVideoLink) {
                            return (
                                <video src={href} controls>
                                    Your browser does not support the video tag.
                                </video>
                            );
                        }
                        
                        const isInternalLink = href?.startsWith('#') || 
                                                href?.startsWith('/') || 
                                                (!href?.startsWith('http') && !href?.startsWith('mailto:'));
                        
                        if (isInternalLink) {
                            return (
                                <a href={href} {...props}>
                                    {children}
                                </a>
                            );
                        }
                        
                        return (
                            <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    img: ({ src, alt, ...props }) => {
                        const imageUrl = transformImageUrl(typeof src === 'string' ? src : '');
                        if (!imageUrl || imageUrl.trim() === '') return null;

                        return (
                            <img
                                src={imageUrl}
                                alt={alt}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                style={{ maxWidth: '100%', height: 'auto' }}
                                {...props}
                            />
                        );
                    },
                    table: ({ children }) => (
                        <table className={styles.table}>{children}</table>
                    ),
                    blockquote({ children, ...props }) {
                        const childArray = Children.toArray(children);

                        const firstText = childArray
                            .map((child) => {
                                if (typeof child === 'string') return child.trim();
                                if (React.isValidElement(child)) {
                                    const el = child as React.ReactElement<{ children?: React.ReactNode }>;
                                    const inner = el.props.children;
                                    if (typeof inner === 'string') return inner.trim();
                                    if (Array.isArray(inner))
                                        return inner.map((c) => (typeof c === 'string' ? c.trim() : '')).join(' ');
                                }
                                return '';
                            })
                            .find((txt) => txt.length > 0) || '';

                        const match = firstText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
                        if (!match) {
                            return (
                                <blockquote className={styles.blockquote} {...props}>
                                    {children}
                                </blockquote>
                            );
                        }

                        const alertType = match[1].toUpperCase();

                        const cleanedChildren = childArray.map((child) => {
                            if (typeof child === 'string') {
                                return child.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
                            }

                            if (React.isValidElement(child)) {
                                const el = child as React.ReactElement<{ children?: React.ReactNode }>;
                                const inner = el.props.children;
                                let newChildren = inner;

                                if (typeof inner === 'string') {
                                    newChildren = inner.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
                                } else if (Array.isArray(inner)) {
                                    newChildren = inner.map((c: any) =>
                                        typeof c === 'string'
                                            ? c.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '')
                                            : c
                                    );
                                }

                                return React.cloneElement(el, { ...el.props, children: newChildren });
                            }

                            return child;
                        });

                        return (
                            <blockquote
                                className={`${styles.blockquote} ${styles[`blockquote-${alertType.toLowerCase()}`] || ''}`}
                                data-alert-type={alertType}
                                {...props}
                            >
                                <strong className={styles.alertLabel}>{alertType}</strong>{' '}
                                {cleanedChildren.map((child, i) => (
                                    <React.Fragment key={i}>{child}</React.Fragment>
                                ))}
                            </blockquote>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

const MarkdownRenderer = memo(MarkdownRendererComponent);

export default MarkdownRenderer;