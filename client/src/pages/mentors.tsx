import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mentors = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/mentors"],
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      // This would normally create a session request
      // For now, we'll just show a success message
      return { success: true, mentorId };
    },
    onSuccess: (data) => {
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de agendamento foi enviada ao mentor.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a solicitação de agendamento.",
      });
    },
  });

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      mentor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesArea = selectedArea === "all" || mentor.area === selectedArea;

    return matchesSearch && matchesArea;
  });

  const areas = Array.from(new Set(mentors.map(mentor => mentor.area)));

  const getStarRating = (rating: number) => {
    const stars = Math.floor(rating / 10);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  const formatRating = (rating: number, reviewCount: number) => {
    return `${(rating / 10).toFixed(1)} (${reviewCount} avaliações)`;
  };

  const handleBookSession = (mentorId: string) => {
    bookSessionMutation.mutate(mentorId);
  };

  return (
    <div className="space-y-8" data-testid="mentors-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="title-mentors">
          Mentores Disponíveis
        </h1>
        <p className="text-muted-foreground mt-2">
          Encontre mentores especializados nas suas áreas de interesse.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar mentores por nome ou especialidade..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-mentors"
                />
              </div>
            </div>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-area-filter">
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => {/* Trigger search */}} 
              data-testid="button-search"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </div>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-muted rounded-full w-16"></div>
                  <div className="h-6 bg-muted rounded-full w-20"></div>
                  <div className="h-6 bg-muted rounded-full w-12"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="h-10 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center" data-testid="no-mentors-found">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum mentor encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca ou procure por outras palavras-chave.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card 
              key={mentor.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              data-testid={`mentor-card-${mentor.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src={mentor.avatarUrl || ""} 
                      alt={`${mentor.firstName} ${mentor.lastName}`} 
                    />
                    <AvatarFallback>
                      {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`mentor-name-${mentor.id}`}>
                      {mentor.firstName} {mentor.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mentor.area} • {mentor.userType === 'mentor' ? 'Mentor' : 'Estudante'}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {getStarRating(mentor.rating || 45)}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatRating(mentor.rating || 45, mentor.reviewCount || 12)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`mentor-bio-${mentor.id}`}>
                  {mentor.bio || "Mentor experiente pronto para ajudar em sua jornada profissional."}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(mentor.skills || []).slice(0, 3).map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="text-xs"
                      data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {(mentor.skills || []).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(mentor.skills || []).length - 3} mais
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground" data-testid={`mentor-rate-${mentor.id}`}>
                    {mentor.hourlyRate ? `R$ ${mentor.hourlyRate}/hora` : "Gratuito"}
                  </span>
                  <Button 
                    onClick={() => handleBookSession(mentor.id)}
                    disabled={bookSessionMutation.isPending}
                    className="group-hover:shadow-sm transition-shadow"
                    data-testid={`button-book-${mentor.id}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {bookSessionMutation.isPending ? "Enviando..." : "Agendar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
