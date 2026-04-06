## Unused/Non-functional Code Cleanup

### পাওয়া গেছে

#### 1. Unused Files (কোথাও import নেই)


| File                                    | Size      | কারণ                                                                                                                                     |
| --------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/Profile.tsx`                 | 639 lines | পুরোনো monolithic profile page — এখন `profile/` subfolder-এ আলাদা pages আছে (PersonalInfoPage, PasswordPage, SecurityPage, SessionsPage) |
| `src/pages/profile/Security2FAPage.tsx` | 5 lines   | কোনো route-এ নেই, শুধু `TwoFactorSetup` render করে যেটা `SecurityPage.tsx`-এ already আছে                                                 |
| `src/hooks/usePageTitle.ts`             | ~70 lines | কোথাও import নেই — `AutoPageTitle` ও `DynamicTitleProvider` এখন title handle করে                                                         |
| `src/hooks/useDynamicTitle.ts`          | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useHomepageSections.ts`      | unused    | কোথাও import নেই — `useSiteContent` এখন homepage sections handle করে                                                                     |
| `src/hooks/useInfiniteScroll.ts`        | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useFailedLoginAttempts.ts`   | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useBlockedIps.ts`            | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useGeoBlockingRules.ts`      | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useIpRateLimits.ts`          | unused    | কোথাও import নেই                                                                                                                         |
| `src/hooks/useLoginVerification.ts`     | unused    | কোথাও import নেই                                                                                                                         |


#### 2. Test placeholder


| File                       | Note                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `src/test/example.test.ts` | শুধু `expect(true).toBe(true)` — placeholder, কোনো কাজ নেই |


### পরিবর্তন

**12 files delete করব:**

1. `src/pages/Profile.tsx` (639 lines — সবচেয়ে বড়)
2. `src/pages/profile/Security2FAPage.tsx`
3. `src/hooks/usePageTitle.ts`
4. `src/hooks/useDynamicTitle.ts`
5. `src/hooks/useHomepageSections.ts`
6. `src/hooks/useInfiniteScroll.ts`
7. `src/hooks/useFailedLoginAttempts.ts`
8. `src/hooks/useBlockedIps.ts`
9. `src/hooks/useGeoBlockingRules.ts`
10. `src/hooks/useIpRateLimits.ts`
11. `src/hooks/useLoginVerification.ts`
12. `src/test/example.test.ts`

### Technical Details

- শুধু delete, কোনো file edit নেই
- কোনো route বা import break হবে না কারণ এগুলো কোথাও ব্যবহার হচ্ছে না
- ~800+ lines dead code remove হবে
- No DB changes

&nbsp;

abar review koro use kora hosse amon kisu delete koiro na 