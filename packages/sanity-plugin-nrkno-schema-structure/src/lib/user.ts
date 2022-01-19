// @ts-expect-error it is any anyway
import userStore from 'part:@sanity/base/user';
import { CurrentUser } from '@sanity/types';

let currentUser: CurrentUser | undefined;

function initCurrentUser() {
  userStore.me.subscribe((user: CurrentUser | undefined) => {
    if (user) {
      currentUser = user ?? undefined;
    }
  });
}
initCurrentUser();

export function getCurrentUser(): CurrentUser | undefined {
  return currentUser;
}
