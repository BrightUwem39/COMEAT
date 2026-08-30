// tsx asks Node for a POSIX user ID when creating its temporary directory.
// Windows does not expose getuid/geteuid, and os.userInfo() can fail in some
// restricted environments. Supplying the existing Windows username keeps the
// loader deterministic without changing POSIX behavior.
if (typeof process.geteuid !== "function") {
  Object.defineProperty(process, "geteuid", {
    configurable: true,
    value: () => process.env.USERNAME || "windows",
  });
}
