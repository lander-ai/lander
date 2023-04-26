import { createQuery, CreateQueryOptions } from "@tanstack/solid-query";
import { User } from "~/models";
import { NetworkService } from "~/services/network.service";

export const useUser = (
  opts?: CreateQueryOptions<User, unknown, User, () => string[]>
) => {
  const user = createQuery(
    () => ["user"],
    () =>
      NetworkService.shared
        .load(User, User.requests.whoami())
        .then((result) => result.data),
    opts
  );

  return user;
};
