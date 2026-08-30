import PrimaryButton from '@/component/button/PrimaryButton';

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-6">
            <h1 className="text-6xl font-bold mb-4 animate-bounce">404 😵</h1>
            <p className="text-xl mb-2">Oops... esta página se fue de vacaciones 🏖️</p>
            <p className="mb-6">Pero no te preocupes, puedes volver a casa sin GPS 👇</p>
            <PrimaryButton className="relative z-10" href="/">
                Volver a inicio
            </PrimaryButton>
            <div className="mt-10 animate-pulse">
                <p className="text-sm">Mientras tanto, intenta no romper más cosas 😅</p>
            </div>
        </div>
    );
}
