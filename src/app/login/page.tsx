"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginInput } from "@/lib/validation"
import { login } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginInput) => {
        const success = await login(data)
        if (success) {
            router.push("/dashboard")
        }
    }

    return (
            <div className="flex items-center justify-center h-screen bg-[#f8f5f0]">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 w-80 p-6 rounded-xl shadow-md bg-white border border-[#e0dacf]"
                >
                    <h2 className="text-xl font-bold text-[#635d40] text-center">Login Audit System</h2>
                    <div>
                        <Input placeholder="Email" {...register("email")} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                        <Input type="password" placeholder="Password" {...register("password")} />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#f08c00] hover:bg-[#d87a00] text-white"
                    >
                        {isSubmitting ? "Memproses..." : "Login"}
                    </Button>
                </form>
            </div>
    )
}
