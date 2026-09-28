import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { ProjectCreateForm } from "@/features/projects/project-create-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { Department } from "@/types/models";

export const metadata = { title: "New Project" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("departments").select("*").order("name");

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${dict.common.create}: ${dict.nav.projects}`}
        actions={
          <Link href="/officer/projects" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" /> {dict.common.back}
          </Link>
        }
      />
      <Card>
        <CardContent className="pt-5">
          <ProjectCreateForm departments={(data ?? []) as Department[]} />
        </CardContent>
      </Card>
    </div>
  );
}
