"use client";

import { useEffect, useRef, useState } from "react";

export default function ArticleAnimation({ children }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const currentRef = ref.current; 
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting); 
            },
            { threshold: 0.2 }
        );

        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div 
            ref={ref}
            className={`transition-all duration-700 ${
                isVisible 
                    ? "opacity-100 translate-y-0 animate-fadeUp" 
                    : "opacity-0 translate-y-4"
            }`}
        >
            {children}
        </div>
    );
}