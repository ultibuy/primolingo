const modules = import.meta.glob('./rules/*.json', { eager: true });
export const allRules = Object.values(modules).map(m => m.default);
