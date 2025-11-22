---
title: "Featured Workflows"
description: "How featured posts stay visible."
date: 2024-11-25
tags: ["featured", "workflow"]
featured: true
draft: false
locale: en
translationKey: featured-workflows
---

A boolean frontmatter flag controls what lands in the featured rail.

## Code Snippet Examples

Markdown code fences with a language label automatically pick up Astro's syntax highlighting (via Shiki during build). Drop in the block that matches the workflow you are documenting:

```sql
SELECT title, featured
FROM posts
WHERE featured = true
ORDER BY date DESC
LIMIT 5;
```

```python
def toggle_featured(post, featured=True):
    return {**post, "featured": featured}
```

```rust
pub fn toggle_featured(mut post: Post, featured: bool) -> Post {
    post.featured = featured;
    post
}
```

```go
func ToggleFeatured(post Post, featured bool) Post {
    post.Featured = featured
    return post
}
```

```tsx
export function FeaturedBadge() {
  return <span className="badge badge--featured">Featured</span>;
}
```

Each block renders with highlighting in the post layout, so authors can demonstrate backend filters, scripting helpers, or UI components without extra configuration.
