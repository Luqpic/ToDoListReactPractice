// src/pages/LoginPage.tsx
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import logo from "../assets/Chatgpt.svg";

function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Only runs once the schema passes. Bad credentials come back as a thrown
  // error from auth.ts and aren't tied to a single field, so they land on
  // the form root.
  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Login failed",
      });
    }
  };

  // Skips authentication entirely and drops straight into the app as Guest.
  const handleGuest = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-12">
      <Card className="w-full max-w-sm h-fit shadow-md">
        <CardHeader>
          <div className="flex flex-row items-center  gap-1">
            <img src={logo} className="w-12 h-12" />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              TODOLIST
            </CardTitle>
          </div>
          <CardDescription>Welcome back</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Email/password form; guest button below is a separate,
              non-submitting action on the same card. */}
          {/* noValidate hands validation to zod: without it the browser's own
              type="email" check fires first and shows its own tooltip. */}
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="flex flex-col gap-1">
              <Input type="email" placeholder="email" {...register("email")} />
              {errors.email && (
                <span className="text-sm text-destructive">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                placeholder="password"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-sm text-destructive">
                  {errors.password.message}
                </span>
              )}
            </div>
            {errors.root && (
              <span className="text-sm text-destructive">
                {errors.root.message}
              </span>
            )}
            <Button
              type="submit"
              className="w-full h-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
            {/* Bypasses auth: see continueAsGuest() in AuthContext. */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              onClick={handleGuest}
            >
              Continue as Guest
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
