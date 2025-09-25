import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KanbanItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColumns = [
  { id: "backlog", title: "Product Backlog", color: "bg-gray-400" },
  { id: "todo", title: "To Do", color: "bg-red-400" },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-400" },
  { id: "done", title: "Done", color: "bg-green-400" },
];

const typeColors = {
  epic: "bg-purple-100 text-purple-700",
  story: "bg-blue-100 text-blue-700",
  feature: "bg-green-100 text-green-700",
  task: "bg-yellow-100 text-yellow-700",
  bug: "bg-red-100 text-red-700",
  setup: "bg-gray-100 text-gray-700",
  design: "bg-purple-100 text-purple-700",
};

export default function KanbanPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<KanbanItem[]>({
    queryKey: ["/api/kanban"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<KanbanItem> }) => {
      const response = await fetch(`/api/kanban/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update item");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kanban"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o item.",
      });
    },
  });

  const getItemsByStatus = (status: string) =>
    items.filter((item) => item.status === status);

  const getStatusCounts = () => {
    const counts = statusColumns.reduce((acc, column) => {
      acc[column.id] = getItemsByStatus(column.id).length;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const handleStatusChange = (item: KanbanItem, newStatus: string) => {
    updateItemMutation.mutate({
      id: item.id,
      data: { status: newStatus },
    });
  };

  const statusCounts = getStatusCounts();
  const totalItems = items.length;
  const completedItems = getItemsByStatus("done").length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="h-32 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="kanban-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="title-kanban">
          Kanban SCRUM - Sprint 1
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o progresso das funcionalidades da plataforma usando metodologia SCRUM.
        </p>
      </div>

      {/* Sprint Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Sprint Atual</h3>
              <p className="text-sm text-muted-foreground" data-testid="sprint-name">
                Sprint 1 - MVP Básico
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                10/12 - 24/12 (2 semanas)
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Product Owner</h3>
              <p className="text-sm text-muted-foreground">Maria Fernanda</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Scrum Master</h3>
              <p className="text-sm text-muted-foreground">Pedro Oliveira</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Progresso</h3>
              <div className="flex items-center space-x-2">
                <Progress value={progressPercentage} className="flex-1" />
                <span className="text-sm text-muted-foreground" data-testid="sprint-progress">
                  {progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <Card key={column.id} className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-base">
                <div className={`w-3 h-3 ${column.color} rounded-full mr-2`}></div>
                {column.title}
                <Badge variant="secondary" className="ml-auto" data-testid={`count-${column.id}`}>
                  {statusCounts[column.id]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[500px]">
              {getItemsByStatus(column.id).map((item) => (
                <div
                  key={item.id}
                  className={`bg-background p-3 rounded-lg border border-border cursor-pointer hover:shadow-sm transition-shadow ${
                    item.status === "in_progress" ? "border-l-4 border-l-yellow-400" : ""
                  } ${item.status === "done" ? "border-l-4 border-l-green-400" : ""}`}
                  data-testid={`kanban-item-${item.id}`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${typeColors[item.type as keyof typeof typeColors] || typeColors.task}`}
                      data-testid={`item-type-${item.id}`}
                    >
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground" data-testid={`item-points-${item.id}`}>
                      {item.points}pts
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-foreground mb-1" data-testid={`item-title-${item.id}`}>
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2" data-testid={`item-description-${item.id}`}>
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground" data-testid={`item-assignee-${item.id}`}>
                      {item.assignee}
                    </span>
                    <div className="flex items-center space-x-1">
                      {item.status === "done" && (
                        <i className="fas fa-check text-xs text-green-600"></i>
                      )}
                      {item.status === "in_progress" && (
                        <i className="fas fa-code text-xs text-primary"></i>
                      )}
                    </div>
                  </div>

                  {item.status === "in_progress" && item.progress !== null && item.progress !== undefined && item.progress > 0 && (
                    <div className="mt-2">
                      <Progress value={item.progress} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Drop zone for each column */}
              <div
                className="border-2 border-dashed border-muted rounded-lg p-4 text-center text-muted-foreground opacity-0 hover:opacity-100 transition-opacity"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary", "opacity-100");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-primary", "opacity-100");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary", "opacity-100");
                  
                  const itemId = e.dataTransfer.getData("text/plain");
                  const item = items.find((i) => i.id === itemId);
                  
                  if (item && item.status !== column.id) {
                    handleStatusChange(item, column.id);
                  }
                }}
                data-testid={`drop-zone-${column.id}`}
              >
                <Plus className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Solte aqui</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint Retrospective */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Retrospective - Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-accent mb-3">O que funcionou bem</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Comunicação eficaz durante as dailies</li>
                <li>• Bom refinamento do backlog</li>
                <li>• Colaboração entre design e desenvolvimento</li>
                <li>• Entregas incrementais funcionais</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-destructive mb-3">O que precisa melhorar</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Estimativas mais precisas de story points</li>
                <li>• Definição mais clara de critérios de aceite</li>
                <li>• Testes automatizados desde o início</li>
                <li>• Documentação técnica</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-3">Ações para próxima sprint</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Implementar planning poker para estimativas</li>
                <li>• Criar templates de User Stories</li>
                <li>• Setup de CI/CD pipeline</li>
                <li>• Sessões de pair programming</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
