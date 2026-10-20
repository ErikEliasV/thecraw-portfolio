export type Project = {
  slug: string;
  /** Short name used on cards ("Allce"). */
  name: string;
  /** Headline used on the featured slider and project page. */
  title: string;
  client: string;
  category: string;
  year: string;
  cover: string;
  thumbnail: string;
};

export type Service = {
  number: string;
  title: string;
  description: string;
  deliverables: readonly [readonly string[], readonly string[]];
};
