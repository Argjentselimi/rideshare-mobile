import { notFound, redirect } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";

export default async function Kerkesa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let udhetim;
  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    throw new Error("Udhëtimi nuk mund të lexohet nga databaza.");
  }

  if (!udhetim) {
    notFound();
  }

  redirect(`/udhetimi/${id}`);
}
