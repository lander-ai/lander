import { createQuery, CreateQueryOptions } from "@tanstack/solid-query";
import { Thread } from "~/models";
import { ThreadService } from "~/services/thread.service";

export const useArchive = (
  opts?: CreateQueryOptions<Thread[], unknown, Thread[], () => string[]>
) => {
  const archive = createQuery(
    () => ["archive"],
    () => ThreadService.shared.getAll(),
    opts
  );

  return archive;
};
