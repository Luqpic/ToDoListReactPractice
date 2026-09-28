import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "@/lib/schemas";

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // react-hook-form owns the field values, the validation errors and the
  // in-flight flag, so this component keeps no form state of its own.
  // signupSchema is the single source of truth for both the rules and the
  // TypeScript type of `values` below.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  // Only runs once the schema passes, so `values` is already valid here.
  // Failures from signup() itself (e.g. "Email already registered") aren't
  // tied to one field, so they go on the form root.
  const onSubmit = async (values: SignupValues) => {
    try {
      await signup(values.email, values.password);
      navigate("/");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Signup failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-12">
      <Card className="w-full max-w-sm h-fit shadow-md">
        <CardHeader>
          <div className="flex flex-row items-center gap-1">
            <img src={logo} className="w-12 h-12" />
            <CardTitle className="text-2xl font-semibold tracking-tight">
              TODOLIST
            </CardTitle>
          </div>
          <CardDescription>Create an account</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="flex flex-col gap-1">
              <Input
                type="password"
                placeholder="confirm password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span className="text-sm text-destructive">
                  {errors.confirmPassword.message}
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
              {isSubmitting ? "Creating account..." : "Sign up"}
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
