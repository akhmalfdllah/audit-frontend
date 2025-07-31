// src/components/logout-button.tsx
"use client"

export function LogoutButton() {
    return (
        <button
            onClick={() => {
                document.cookie = "access_token=; Max-Age=0; path=/"
                window.location.href = "/login"
            }}
            className="hover:underline block text-left w-full text-white"
        >
            Logout
        </button>
    )
}
