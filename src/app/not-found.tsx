import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl font-semibold text-primary">404</p>
      <h1 className="text-lg font-medium">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or you do not have access to it.
      </p>
      <Link href="/" className={buttonVariants()}>
        Return home
      </Link>
    </div>
  );
}
