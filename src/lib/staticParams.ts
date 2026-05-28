export function lessonParams() {
  return Array.from({ length: 50 }, (_, u) =>
    Array.from({ length: 4 }, (_, l) => ({ unit: String(u + 1), lesson: String(l + 1) }))
  ).flat()
}
