import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="text-primary text-xl" />
              <span className="font-bold text-foreground">MentorConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Conectando estudantes e mentores para um futuro melhor.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-how-it-works">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-mentors-footer">
                  Mentores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-students-footer">
                  Estudantes
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-help">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-faq">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 MentorConnect. Projeto Acadêmico - Metodologia SCRUM.</p>
        </div>
      </div>
    </footer>
  );
}
