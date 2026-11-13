"use client";

import { useRouter } from "next/navigation";
import Pagination from "@/components/videos/Pagination";

interface Props {
  page: number;
  totalPages: number;
}

export default function ModelsPagination({ page, totalPages }: Props) {
  const router = useRouter();

  const goToPage = (nextPage: number) => {
    router.push(nextPage === 1 ? "/models" : `/models?page=${nextPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <Pagination page={page} totalPages={totalPages} onChange={goToPage} />;
}
