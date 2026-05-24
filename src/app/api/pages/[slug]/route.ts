import { NextResponse } from "next/server";
import { getPublishedPage } from "@/lib/publish/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  }

  const { slug: _s, name, blocks, theme } = page;
  return NextResponse.json({ slug: _s, name, blocks, theme });
}
