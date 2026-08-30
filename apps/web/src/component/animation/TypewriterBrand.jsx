"use client";
import { useState, useEffect } from "react";

export default function TypewriterBrand() {
    const text = "SERGIOHUB LAB";
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [speed, setSpeed] = useState(90);

    useEffect(() => {
        const handleType = () => {
            if (!isDeleting) {
                // Escribiendo: añade una letra
                setCurrentText(text.substring(0, currentText.length + 1));
                setSpeed(90); // Velocidad al escribir

                // Si terminó de escribir, pausa antes de borrar
                if (currentText === text) {
                    setIsDeleting(true);
                    setSpeed(2000); // Pausa de 2 segundos completado
                }
            } else {
                // Borrando: quita una letra
                setCurrentText(text.substring(0, currentText.length - 1));
                setSpeed(75); // Más rápido al borrar para que no aburra

                // Si terminó de borrar, pausa antes de volver a escribir
                if (currentText === "") {
                    setIsDeleting(false);
                    setSpeed(500); // Pausa de medio segundo vacío
                }
            }
        };

        const timer = setTimeout(handleType, speed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, speed]);

    return (
        <div className="text-white font-extrabold text-lg tracking-wider hidden sm:flex items-center">
            <span>{currentText}</span>
            {/* Puntero parpadeante estilo consola */}
            <span className="inline-block w-2.5 h-5 bg-white ml-1 animate-[flicker_1s_steps(2,start)_infinite]" />
            
            <style jsx global>{`
                @keyframes flicker {
                    to { visibility: hidden; }
                }
            `}</style>
        </div>
    );
}