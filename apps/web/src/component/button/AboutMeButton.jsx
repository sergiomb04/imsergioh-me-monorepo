import GodButton from "@/component/button/GodButton";

export default function AboutMeButton() {
    return (
        <GodButton
            hexColor="#d946ef"
            href="/about"
            className="mt-10 w-max text-2xl font-semibold hover:scale-105 animate-zoomPulse"
        >
            CONÓCEME MÁS
        </GodButton>
    );
}