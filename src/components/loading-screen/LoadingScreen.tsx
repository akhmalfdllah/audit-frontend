"use client";

interface LoadingScreenProps {
    message?: string;
    layout?: "vertical" | "horizontal";
}

export default function LoadingScreen({
    message = "Memeriksa akses...",
    layout = "vertical",
}: LoadingScreenProps) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            {layout === "horizontal" ? (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border-4 border-[#f08c00] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">{message}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#f08c00] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">{message}</span>
                </div>
            )}
        </div>
    );
}
