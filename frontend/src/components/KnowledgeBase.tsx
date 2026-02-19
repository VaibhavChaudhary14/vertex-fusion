import { useState } from "react";
import { Search, BookOpen, Shield, Cpu, Network, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { KnowledgeArticle } from "@shared/schema";

interface KnowledgeBaseProps {
  articles: KnowledgeArticle[];
  onArticleSelect: (article: KnowledgeArticle) => void;
  selectedArticle?: KnowledgeArticle | null;
}

const categoryIcons: Record<string, typeof BookOpen> = {
  attacks: Shield,
  gnn: Cpu,
  protocols: Network,
  general: FileText,
};

const categoryColors: Record<string, string> = {
  attacks: "bg-critical/10 text-critical",
  gnn: "bg-primary/10 text-primary",
  protocols: "bg-warning/10 text-warning",
  general: "bg-muted text-muted-foreground",
};

export function KnowledgeBase({ articles, onArticleSelect, selectedArticle }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const groupedArticles = filteredArticles.reduce(
    (acc, article) => {
      const category = article.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(article);
      return acc;
    },
    {} as Record<string, KnowledgeArticle[]>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Knowledge Base</CardTitle>
            <CardDescription>
              Learn about attacks, GNN models, and smart grid protocols
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-knowledge"
              />
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {Object.entries(groupedArticles).map(([category, categoryArticles]) => {
                  const Icon = categoryIcons[category] || BookOpen;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {categoryArticles.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {categoryArticles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => onArticleSelect(article)}
                            className={`w-full text-left rounded-md p-2 hover-elevate transition-colors ${
                              selectedArticle?.id === article.id
                                ? "bg-primary/10"
                                : ""
                            }`}
                            data-testid={`article-${article.id}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium line-clamp-1">
                                {article.title}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            {article.subcategory && (
                              <span className="text-xs text-muted-foreground">
                                {article.subcategory}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {Object.keys(groupedArticles).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p className="text-sm">No articles found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-6">
            {selectedArticle ? (
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={categoryColors[selectedArticle.category]}>
                    {selectedArticle.category}
                  </Badge>
                  {selectedArticle.subcategory && (
                    <Badge variant="outline">{selectedArticle.subcategory}</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>
                <Separator className="mb-6" />
                <div
                  className="text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Tags:</span>
                      {selectedArticle.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Select an article</p>
                <p className="text-sm">
                  Choose an article from the left panel to read its contents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
