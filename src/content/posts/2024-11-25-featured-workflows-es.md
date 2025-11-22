---
title: "Flujos de trabajo destacados"
description: "Cómo mantenemos visibles las publicaciones destacadas."
date: 2024-11-25
tags: ["featured", "workflow"]
featured: true
draft: false
locale: es
translationKey: featured-workflows
slug: flujos-destacados
---

Un flag booleano en el frontmatter controla lo que aparece en la franja de destacados.

## Ejemplos de bloques de código

Las vallas de código en Markdown con una etiqueta de lenguaje reciben resaltado automáticamente (Astro usa Shiki durante el build). Solo elige el bloque que corresponda al flujo que estás documentando:

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

Cada bloque se renderiza con resaltado dentro del layout, de modo que los autores pueden mostrar filtros backend, scripts o componentes de UI sin configuración adicional.
