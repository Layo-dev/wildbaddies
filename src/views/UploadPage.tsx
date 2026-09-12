"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadVideo } from "@/lib/videos";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { listModels, type ModelRecord } from "@/lib/models";
import TagAutocomplete, { type SelectedTag } from "@/components/tags/TagAutocomplete";
import ModelMultiSelect from "@/components/models/ModelMultiSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

const UploadPage = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedModels, setSelectedModels] = useState<ModelRecord[]>([]);
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  const [progress, setProgress] = useState(0);
  const [lastVideoId, setLastVideoId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const authorized = isAuthenticated && isAdmin;

  useEffect(() => {
    if (!isLoading && !authorized) router.replace("/");
  }, [isLoading, authorized, router]);

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    enabled: authorized,
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
    enabled: authorized,
  });

  const { data: models = [], isLoading: modelsLoading, isError: modelsError } = useQuery({
    queryKey: ["models"],
    queryFn: listModels,
    enabled: authorized,
  });

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required.");
      if (!file) throw new Error("Video file is required.");

      setProgress(0);

      return uploadVideo({
        title: title.trim(),
        file,
        categoryIds: Array.from(selectedIds),
        modelIds: selectedModels.map((m) => m.id),
        tags: selectedTags.map((t) => t.name),
        tagIds: selectedTags.map((t) => t.id).filter((id): id is string => Boolean(id)),
        onProgress: setProgress,
      });
    },
    onSuccess: (result) => {
      setLastVideoId(result.videoId);
      setTitle("");
      setFile(null);
      setSelectedIds(new Set());
      setSelectedModels([]);
      setSelectedTags([]);
      setProgress(0);
      toast.success("Video uploaded to Bunny and queued for processing.");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (error) => {
      setProgress(0);
      const message = error instanceof Error ? error.message : "Upload failed.";
      toast.error(message);
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    uploadMutation.mutate();
  };

  const isPending = uploadMutation.isPending;

  if (isLoading || !authorized) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="container py-10 lg:py-14 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <UploadIcon className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide uppercase">
            Upload Video
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <section className="lg:col-span-2 space-y-8">
            <form onSubmit={onSubmit} className="space-y-5 rounded-md border border-primary/40 bg-secondary/20 p-5">
              <label className="block space-y-2">
                <span className="font-bold tracking-wider uppercase">Video title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type your title"
                  disabled={isPending}
                  className="w-full rounded-md border border-primary/40 bg-secondary/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </label>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="block font-bold tracking-wider uppercase">Categories</span>
                  <span className="block text-sm text-muted-foreground">Select all that apply</span>
                </div>

                {categoriesLoading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-md" />
                    ))}
                  </div>
                )}

                {categoriesError && (
                  <p className="text-sm text-destructive">Failed to load categories.</p>
                )}

                {!categoriesLoading && !categoriesError && categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories available.</p>
                )}

                {!categoriesLoading && categories.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {categories.map((cat) => {
                        const checked = selectedIds.has(cat.id);
                        return (
                          <label
                            key={cat.id}
                            data-state={checked ? "checked" : "unchecked"}
                            className="flex items-center gap-2 rounded-md border border-primary/40 bg-secondary/30 px-3 py-2.5 cursor-pointer transition-colors hover:border-primary hover:bg-primary/10"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleCategory(cat.id)}
                              disabled={isPending}
                            />
                            <span className="text-sm text-foreground truncate">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedIds.size > 0 && (
                      <p className="text-xs text-muted-foreground">{selectedIds.size} selected</p>
                    )}
                  </>
                )}
              </div>

              <ModelMultiSelect
                available={models}
                value={selectedModels}
                onChange={setSelectedModels}
                disabled={isPending}
                loading={modelsLoading}
              />

              {modelsError && (
                <p className="text-sm text-destructive">Failed to load models.</p>
              )}

              <TagAutocomplete
                available={tags}
                value={selectedTags}
                onChange={setSelectedTags}
                disabled={isPending}
                loading={tagsLoading}
              />

              <div className="space-y-2">
                <span className="font-bold tracking-wider uppercase">Video file</span>
                <div className="flex items-center gap-3 rounded-md border border-primary/40 bg-secondary/30 p-2">
                  <label className="cursor-pointer rounded-full bg-gradient-purple2 px-5 py-2 text-sm font-bold uppercase tracking-wider text-white transition-shadow">
                    Choose file
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={isPending}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      required
                    />
                  </label>
                  <span className="text-muted-foreground truncate">
                    {file?.name ?? "No file chosen"}
                  </span>
                </div>
              </div>

              {/* Progress bar — shown during upload */}
              {isPending && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress < 100 ? "Uploading to Bunny…" : "Processing…"}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-purple2 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-80 rounded-full bg-gradient-purple2 py-3.5 font-bold uppercase tracking-widest text-white hover:opacity-95 transition-opacity disabled:opacity-60"
              >
                {isPending ? "Uploading…" : "Upload video"}
              </button>
            </form>

            {lastVideoId && (
              <div className="rounded-md border border-primary/40 bg-secondary/20 px-4 py-3 text-sm">
                <p className="font-bold text-white">Upload submitted</p>
                <p className="text-muted-foreground">Bunny videoId: {lastVideoId}</p>
                <p className="text-muted-foreground">Status: processing — will appear once Bunny finishes encoding.</p>
              </div>
            )}
          </section>

          {/* Rules */}
          <aside className="space-y-4">
            <h2 className="text-xl font-bold tracking-wider uppercase">Upload Rules</h2>
            <p className="text-foreground/90">
              Before uploading, please make sure that your content meets the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Contains sex, masturbation, or nudity</li>
              <li>Is at least one minute long</li>
              <li>Is not attributed to the wrong model</li>
              <li>Is not already featured on the website</li>
            </ul>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
