import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { api } from "@/lib/apiClient"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";
import { verifyEmail } from "@/features/auth/authThunk"
import { useAppSelector } from "@/app/hooks"
import { Navigate } from "react-router-dom"

export const emailVerificationSchema = z.object({
    token: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

function VerifyEmail() {
    const navigate = useNavigate();
    const {isLoggedIn, isEmailVerified} = useAppSelector((state) => state.auth);
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />
    }
    if (isLoggedIn && isEmailVerified) {
        return <Navigate to="/dashboard" replace />
    }

    const form = useForm<z.infer<typeof emailVerificationSchema>>({
        resolver: zodResolver(emailVerificationSchema),
        defaultValues: {
            token: "",
        },
    })

    const dispatch = useDispatch<AppDispatch>();
    async function onSubmit(data: z.infer<typeof emailVerificationSchema>) {
        try {
            const res = await dispatch(verifyEmail(data.token)).unwrap();
            toast.success(res.data.message);
            navigate("/dashboard", { replace: true });
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    }

    async function handleResendEmail(e: any) {
        e.preventDefault()
        try {
            const res = await api.post("/auth/generate-email-verification-token")
            toast.success(res.data.message)
        } catch (error: any) {
            toast.error(error.response.data.message)
        }
    }

    
        return (
            <div className="w-full flex justify-center h-[90vh] items-center">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6 grid justify-center">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>One-Time Password</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={6} {...field}>
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormDescription>
                                        Please enter the one-time password sent to your phone.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Submit</Button>
                        <Button onClick={handleResendEmail}>Send Email</Button>
                    </form>
                </Form>
            </div>
        )
    }


export default VerifyEmail