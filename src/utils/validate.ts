export default async function validate(
  fn: () => Promise<boolean>,
  message: () => void
) {
  const passed = await fn();
  if (!passed) {
    message();
    process.exit(0);
  }
}
