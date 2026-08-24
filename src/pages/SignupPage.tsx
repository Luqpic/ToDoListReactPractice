import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    const nextEmailError = isValidEmail(email) ? "" : "Enter a valid email";
    const nextPasswordError = isValidPassword(password)
      ? ""
      : "Password must be at least 8 characters";
    const nextConfirmError = passwordsMatch(password, confirmPassword)
      ? ""
      : "Passwords do not match";

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    if (nextEmailError || nextPasswordError || nextConfirmError) return;

    setSubmitting(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center px-4 py-12">
      <Card className="w-full max-w-sm h-fit shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Sign up
          </CardTitle>
          <CardDescription>Create an account</CardDescription>
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
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && (
                <span className="text-sm text-destructive">
                  {passwordError}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmError && (
                <span className="text-sm text-destructive">{confirmError}</span>
              )}
            </div>
            {formError && (
              <span className="text-sm text-destructive">{formError}</span>
            )}
            <Button type="submit" className="w-full h-10" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignupPage;
