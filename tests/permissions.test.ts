import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditRestaurant } from "../src/utils/permissions.ts";
import type { AppUser } from "../src/types/auth.ts";
import type { Restaurant } from "../src/types/index.ts";

const user = (id: string, userType: AppUser["userType"], isActive = true) =>
  ({ id, userType, isActive }) as AppUser;
const restaurant = (ownerId: string | null) => ({ id: 1, ownerId }) as Restaurant;

test("비회원은 수정할 수 없다", () => assert.equal(canEditRestaurant(null, restaurant("a")), false));
test("회원은 본인이 등록한 맛집만 수정할 수 있다", () => {
  assert.equal(canEditRestaurant(user("a", "user"), restaurant("a")), true);
  assert.equal(canEditRestaurant(user("b", "user"), restaurant("a")), false);
  assert.equal(canEditRestaurant(user("a", "user"), restaurant(null)), false);
});
test("관리자는 모든 맛집을 수정할 수 있다", () => {
  assert.equal(canEditRestaurant(user("z", "admin"), restaurant("a")), true);
  assert.equal(canEditRestaurant(user("z", "admin"), restaurant(null)), true);
});
test("비활성 계정은 수정할 수 없다", () =>
  assert.equal(canEditRestaurant(user("a", "user", false), restaurant("a")), false));
