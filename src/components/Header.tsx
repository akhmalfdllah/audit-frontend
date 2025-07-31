"use client"

export default function Header() {
    return (
        <header className="bg-[#635d40] px-6 py-3 shadow-sm">
            <div className="flex items-center justify-end">
                <input
                    type="text"
                    placeholder="Search User"
                    className="w-full max-w-sm px-4 py-2 rounded-lg text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
                />
            </div>
        </header>
    )
}
