import { getCollection, type CollectionEntry } from 'astro:content';
export type Project = CollectionEntry<'projects'>;
export const projectSlug = (project: Project) => project.data.slug ?? project.id;
export const projectUrl = (project: Project) => `/projects/${projectSlug(project)}/`;
export async function getProjects() {
  const projects = (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => a.data.priority - b.data.priority || a.data.title.localeCompare(b.data.title));
  const slugs = new Set<string>();
  for (const project of projects) {
    const slug = projectSlug(project);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid project slug: ${slug}`);
    if (slugs.has(slug)) throw new Error(`Duplicate project slug: ${slug}`);
    slugs.add(slug);
  }
  return projects;
}
