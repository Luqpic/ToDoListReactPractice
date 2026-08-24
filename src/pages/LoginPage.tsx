// src/pages/LoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    const nextEmailError = isValidEmail(email) ? "" : "Enter a valid email";
    setEmailError(nextEmailError);
    if (nextEmailError) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center px-4 py-12">
      <Card className="w-full max-w-sm h-fit shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Log in
          </CardTitle>
          <CardDescription>Welcome back</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <Input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <span className="text-sm text-destructive">{emailError}</span>
              )}
            </div>
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {formError && (
              <span className="text-sm text-destructive">{formError}</span>
            )}
            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
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
