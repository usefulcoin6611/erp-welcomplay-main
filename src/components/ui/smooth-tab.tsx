"use client";

/**
 * @author: @dorian_baffier (adapted for Reports)
 * @description: Smooth Tab Component with improved performance and accessibility
 * @version: 1.1.0
 * @license: MIT
 */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TabItem {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface SmoothTabProps {
    items: TabItem[];
    defaultTabId?: string;
    value?: string;
    className?: string;
    activeColor?: string;
    onChange?: (tabId: string) => void;
    onTabPreload?: (tabId: string) => void;
}

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
        filter: "blur(4px)",
        scale: 0.98,
    }),
    center: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 50 : -50,
        opacity: 0,
        filter: "blur(4px)",
        scale: 0.98,
    }),
};

export function SmoothTab({
    items,
    defaultTabId,
    value,
    className,
    activeColor = "bg-cyan-600",
    onChange,
    onTabPreload,
}: SmoothTabProps) {
    const isControlled = typeof value === 'string';
    const [uncontrolled, setUncontrolled] = React.useState<string>(
        defaultTabId || items[0]?.id
    );
    const selected = isControlled ? value : uncontrolled;
    const [direction, setDirection] = React.useState(0);
    const [dimensions, setDimensions] = React.useState({ width: 0, left: 0 });
    const [isMounted, setIsMounted] = React.useState(false);

    // Reference for the selected button
    const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Sync with external defaultTabId changes (from URL)
    React.useEffect(() => {
        if (!isControlled && defaultTabId && defaultTabId !== uncontrolled) {
            const currentIndex = items.findIndex((item) => item.id === uncontrolled);
            const newIndex = items.findIndex((item) => item.id === defaultTabId);
            setDirection(newIndex > currentIndex ? 1 : -1);
            setUncontrolled(defaultTabId);
        }
    }, [defaultTabId, items, uncontrolled, isControlled]);

    // Mark component as mounted
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Update dimensions whenever selected tab changes or on mount
    React.useLayoutEffect(() => {
        const updateDimensions = () => {
            const selectedButton = buttonRefs.current.get(selected);
            const container = containerRef.current;

            if (selectedButton && container) {
                const rect = selectedButton.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Account for horizontal scroll position
                const scrollLeft = container.scrollLeft;

                setDimensions({
                    width: rect.width,
                    left: rect.left - containerRect.left + scrollLeft,
                });
            }
        };

        // Initial update with delay for proper rendering
        const timeoutId = setTimeout(updateDimensions, 50);

        // Update on resize with debounce
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateDimensions, 100);
        };

        // Update on scroll (for mobile horizontal scroll)
        const container = containerRef.current;
        const handleScroll = () => {
            updateDimensions();
        };

        window.addEventListener("resize", handleResize);
        container?.addEventListener("scroll", handleScroll);
        
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", handleResize);
            container?.removeEventListener("scroll", handleScroll);
        };
    }, [selected, isMounted]);

    const handleTabClick = React.useCallback((tabId: string) => {
        if (tabId === selected) return;
        const currentIndex = items.findIndex((item) => item.id === selected);
        const newIndex = items.findIndex((item) => item.id === tabId);
        setDirection(newIndex > currentIndex ? 1 : -1);
        if (!isControlled) setUncontrolled(tabId);
        onChange?.(tabId);
        setTimeout(() => {
            const selectedButton = buttonRefs.current.get(tabId);
            const container = containerRef.current;
            if (selectedButton && container) {
                const buttonRect = selectedButton.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
                    selectedButton.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        }, 50);
    }, [selected, items, onChange, isControlled]);

    const handleKeyDown = React.useCallback((
        e: React.KeyboardEvent<HTMLButtonElement>,
        tabId: string
    ) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTabClick(tabId);
        } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const currentIndex = items.findIndex((item) => item.id === selected);
            const nextIndex = e.key === "ArrowRight" 
                ? (currentIndex + 1) % items.length 
                : (currentIndex - 1 + items.length) % items.length;
            handleTabClick(items[nextIndex].id);
        }
    }, [handleTabClick, items, selected]);

    const selectedItem = React.useMemo(
        () => items.find((item) => item.id === selected),
        [items, selected]
    );

    return (
        <div className="flex flex-col w-full gap-2">
            {/* Tab Navigation */}
            <div
                ref={containerRef}
                role="tablist"
                aria-label="Report tabs"
                className={cn(
                                                "flex items-center justify-start gap-1 p-1 relative",
                                                "bg-gray-100 dark:bg-gray-800 rounded-xl",
                                                "overflow-x-auto overflow-y-hidden scrollbar-hide",
                                                "transition-all duration-200",
                                                "w-fit max-w-full",
                                                className
                                            )}
                style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
                                    >
                {/* Sliding Background */}
                {dimensions.width > 0 && (
                    <motion.div
                        className={cn(
                            "absolute rounded-lg z-[1] pointer-events-none",
                            activeColor
                        )}
                        initial={false}
                        animate={{
                            width: dimensions.width - 8,
                            x: dimensions.left + 4,
                            opacity: 1,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                        }}
                        style={{ 
                            height: "calc(100% - 8px)", 
                            top: "4px",
                        }}
                    />
                )}

                {/* Tab Buttons */}
                {items.map((item) => {
                        const isSelected = selected === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                ref={(el) => {
                                    if (el) buttonRefs.current.set(item.id, el);
                                    else buttonRefs.current.delete(item.id);
                                }}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                aria-controls={`panel-${item.id}`}
                                id={`tab-${item.id}`}
                                tabIndex={isSelected ? 0 : -1}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTabClick(item.id);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, item.id)}
                                onMouseEnter={() => onTabPreload?.(item.id)}
                                onFocus={() => onTabPreload?.(item.id)}
                                className={cn(
                                    "relative flex items-center justify-center rounded-lg z-[10]",
                                    "py-2 text-xs sm:text-sm font-medium leading-none min-w-fit",
                                    "transition-colors duration-200 whitespace-nowrap cursor-pointer flex-shrink-0",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
                                    "disabled:pointer-events-none disabled:opacity-50",
                                    isSelected
                                        ? "text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-xs pl-5 pr-3"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3"
                                )}
                                style={{ pointerEvents: 'auto', position: 'relative', touchAction: 'manipulation' }}
                                whileHover={!isSelected ? { scale: 1.02 } : undefined}
                            >
                                {item.title}
                            </motion.button>
                        );
                    })}
            </div>

            {/* Content Area with Animation - min-w-0 agar konten lebar (e.g. tabel) bisa scroll horizontal */}
            <div className="flex-1 relative w-full min-w-0 overflow-visible">
                <AnimatePresence
                    initial={false}
                    mode="wait"
                    custom={direction}
                >
                    <motion.div
                        key={`content-${selected}`}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            duration: 0.3,
                            ease: [0.32, 0.72, 0, 1] as any,
                        }}
                        className="w-full min-w-0 will-change-transform"
                    >
                        {selectedItem ? (
                            selectedItem.content
                        ) : (
                            <div>No content for tab: {selected}</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
