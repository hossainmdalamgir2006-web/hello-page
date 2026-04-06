

## MyAccount Layout — Admin Panel-এর সাথে Match করা

### সমস্যা
Admin panel-এর content area full-width stretch করে (`transition-all duration-300`, কোনো `max-w` constraint নেই), কিন্তু MyAccount panel-এ `max-w-6xl mx-auto` constraint আছে যেটা content area ছোট করে দিচ্ছে। Screenshot-এ ডান দিকে বড় empty space দেখাচ্ছে।

### পরিবর্তন

#### `src/layouts/CustomerAccountLayout.tsx`
1. Main content div-এ `transition-all duration-300` add করব (Admin-এর মতো smooth sidebar transition)
2. `max-w-6xl mx-auto` wrapper **remove** করব — content full-width হবে Admin panel-এর মতো
3. `animate-fade-in` সরাসরি `<main>`-এ move করব

```text
Before:
  <div className={cn(collapsed ? "lg:ml-[68px]" : "lg:ml-64")}>
    ...
    <main>
      <div className="mx-auto max-w-6xl animate-fade-in">
        <AccountPageHeader ... />
        <Outlet />
      </div>
    </main>

After:
  <div className={cn("transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-64")}>
    ...
    <main className="p-3 sm:p-4 md:p-6">
      <AccountPageHeader ... />
      {children || <Outlet />}
    </main>
```

### Technical Details
- 1 file modified: `CustomerAccountLayout.tsx`
- `max-w-6xl` ও `mx-auto` constraint remove → full-width content like Admin
- `transition-all duration-300` add → smooth sidebar collapse animation
- Suspense fallback রাখা হবে, শুধু wrapper div remove

