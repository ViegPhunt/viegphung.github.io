'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../styles/components/Scrollbar.module.css';

interface ScrollbarProps {
    direction?: 'vertical' | 'horizontal';
    containerRef?: React.RefObject<HTMLElement | null>;
}

const Scrollbar: React.FC<ScrollbarProps> = ({ 
    direction = 'vertical', 
    containerRef 
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollHeight, setScrollHeight] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);
    const [clientHeight, setClientHeight] = useState(0);
    const [clientWidth, setClientWidth] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const isHorizontal = direction === 'horizontal';

    const updateScrollbar = useCallback(() => {
        if (isHorizontal && containerRef?.current) {
            const container = containerRef.current;
            if (!container) return;
            
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const scrollLeft = container.scrollLeft;
            
            setScrollLeft(scrollLeft);
            setScrollWidth(scrollWidth);
            setClientWidth(clientWidth);
            setIsVisible(scrollWidth > clientWidth + 1);
        } else if (!isHorizontal) {
            const docElement = document.documentElement;
            const body = document.body;
            
            const scrollHeight = Math.max(
                body.scrollHeight, 
                body.offsetHeight,
                docElement.clientHeight, 
                docElement.scrollHeight, 
                docElement.offsetHeight
            );
            
            const clientHeight = window.innerHeight || docElement.clientHeight;
            const scrollTop = Math.round(window.pageYOffset || docElement.scrollTop || body.scrollTop || 0);
            
            setScrollTop(scrollTop);
            setScrollHeight(scrollHeight);
            setClientHeight(clientHeight);
        }
    }, [isHorizontal, containerRef]);

    const handleScroll = useCallback(() => {
        updateScrollbar();
    }, [updateScrollbar]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const thumbElement = thumbRef.current;
        const scrollbarElement = scrollbarRef.current;
        
        if (!thumbElement || !scrollbarElement) return;
        
        setIsDragging(true);
        
        if (isHorizontal && containerRef?.current) {
            const container = containerRef.current;
            const thumbRect = thumbElement.getBoundingClientRect();
            const scrollbarRect = scrollbarElement.getBoundingClientRect();
            const clickOffset = e.clientX - thumbRect.left;
            
            const handleMouseMove = (e: MouseEvent) => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
                
                rafRef.current = requestAnimationFrame(() => {
                    const newThumbLeft = e.clientX - scrollbarRect.left - clickOffset;
                    const trackWidth = scrollbarElement.clientWidth;
                    const thumbWidth = Math.max((clientWidth / scrollWidth) * trackWidth, 30);
                    const maxThumbLeft = trackWidth - thumbWidth;
                    const clampedThumbLeft = Math.max(0, Math.min(maxThumbLeft, newThumbLeft));
                    
                    const scrollRatio = maxThumbLeft > 0 ? clampedThumbLeft / maxThumbLeft : 0;
                    const scrollableWidth = scrollWidth - clientWidth;
                    const newScrollLeft = Math.round(scrollRatio * scrollableWidth);
                    
                    container.scrollLeft = newScrollLeft;
                });
            };
            
            const handleMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            const thumbRect = thumbElement.getBoundingClientRect();
            const clickOffset = e.clientY - thumbRect.top;
            
            const trackHeight = clientHeight;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 30);
            const maxThumbTop = trackHeight - thumbHeight;
            const scrollableHeight = scrollHeight - clientHeight;
            
            const handleMouseMove = (e: MouseEvent) => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
                
                rafRef.current = requestAnimationFrame(() => {
                    const scrollbarRect = scrollbarElement.getBoundingClientRect();
                    const newThumbTop = e.clientY - scrollbarRect.top - clickOffset;
                    const clampedThumbTop = Math.max(0, Math.min(maxThumbTop, newThumbTop));
                    
                    const scrollRatio = maxThumbTop > 0 ? clampedThumbTop / maxThumbTop : 0;
                    const newScrollTop = Math.round(scrollRatio * scrollableHeight);
                    
                    window.scrollTo(0, newScrollTop);
                });
            };
            
            const handleMouseUp = () => {
                setIsDragging(false);
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    }, [isHorizontal, containerRef, clientWidth, scrollWidth, clientHeight, scrollHeight]);

    const handleTrackClick = useCallback((e: React.MouseEvent) => {
        if (e.target === thumbRef.current) return;
        
        const rect = scrollbarRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        if (isHorizontal && containerRef?.current) {
            const container = containerRef.current;
            const clickX = e.clientX - rect.left;
            const trackWidth = rect.width;
            const thumbWidth = Math.max((clientWidth / scrollWidth) * trackWidth, 30);
            
            const targetThumbLeft = Math.max(0, Math.min(trackWidth - thumbWidth, clickX - thumbWidth / 2));
            const scrollRatio = trackWidth - thumbWidth > 0 ? targetThumbLeft / (trackWidth - thumbWidth) : 0;
            const newScrollLeft = Math.round(scrollRatio * (scrollWidth - clientWidth));
            
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        } else {
            const clickY = e.clientY - rect.top;
            const trackHeight = rect.height;
            const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 30);
            
            const targetThumbTop = Math.max(0, Math.min(trackHeight - thumbHeight, clickY - thumbHeight / 2));
            const scrollRatio = trackHeight - thumbHeight > 0 ? targetThumbTop / (trackHeight - thumbHeight) : 0;
            const newScrollTop = Math.round(scrollRatio * (scrollHeight - clientHeight));
            
            window.scrollTo({
                top: newScrollTop,
                behavior: 'smooth'
            });
        }
    }, [isHorizontal, containerRef, clientWidth, scrollWidth, clientHeight, scrollHeight]);

    useEffect(() => {
        updateScrollbar();
        
        if (isHorizontal && containerRef?.current) {
            const container = containerRef.current;
            container.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', updateScrollbar, { passive: true });
            
            const resizeObserver = new ResizeObserver(() => {
                updateScrollbar();
            });
            
            resizeObserver.observe(container);
            
            const timer = setTimeout(() => {
                updateScrollbar();
            }, 100);
            
            const timer2 = setTimeout(() => {
                updateScrollbar();
            }, 500);
            
            return () => {
                container.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', updateScrollbar);
                resizeObserver.disconnect();
                clearTimeout(timer);
                clearTimeout(timer2);
                
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', updateScrollbar, { passive: true });
            
            const resizeObserver = new ResizeObserver(() => {
                updateScrollbar();
            });
            
            if (document.body) {
                resizeObserver.observe(document.body);
            }
            
            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', updateScrollbar);
                resizeObserver.disconnect();
                
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        }
    }, [handleScroll, updateScrollbar, isHorizontal, containerRef]);

    if (isHorizontal) {
        if (!isVisible || !clientWidth || !scrollWidth) return null;
    } else {
        if (scrollHeight <= clientHeight + 1) return null;
    }

    const trackSize = isHorizontal ? clientWidth : clientHeight;
    const contentSize = isHorizontal ? scrollWidth : scrollHeight;
    const currentScroll = isHorizontal ? scrollLeft : scrollTop;
    
    const thumbSize = Math.max(
        Math.min((trackSize / contentSize) * trackSize, trackSize - 20), 
        30
    );
    
    const maxScroll = contentSize - trackSize;
    const maxThumbPosition = trackSize - thumbSize;
    const thumbPosition = maxScroll > 0 ? Math.round((currentScroll / maxScroll) * maxThumbPosition) : 0;

    const scrollbarClasses = `${styles.scrollbar} ${isHorizontal ? styles.horizontal : ''} ${isDragging ? styles.dragging : ''}`;
    const scrollbarStyle = isHorizontal ? { width: clientWidth } : {};
    const thumbStyle = isHorizontal 
        ? { width: thumbSize, transform: `translateX(${thumbPosition}px)` }
        : { height: thumbSize, transform: `translateY(${thumbPosition}px)` };

    return (
        <div
            ref={scrollbarRef}
            className={scrollbarClasses}
            style={scrollbarStyle}
            onClick={handleTrackClick}
        >
            <div
                ref={thumbRef}
                className={styles.thumb}
                style={thumbStyle}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default Scrollbar;