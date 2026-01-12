import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermosUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Termos de Uso</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao aceder e utilizar a plataforma PARTISOLFA, o utilizador concorda em cumprir e estar vinculado a estes 
              Termos de Uso. Se não concordar com algum destes termos, não deverá utilizar os nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Descrição dos Serviços</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA oferece serviços profissionais de aperfeiçoamento de partituras musicais e criação de 
              arranjos musicais. Os serviços incluem:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Aperfeiçoamento e correcção de partituras existentes</li>
              <li>Criação de arranjos musicais personalizados</li>
              <li>Transcrição e adaptação de músicas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Conta de Utilizador</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar os nossos serviços, é necessário criar uma conta. O utilizador é responsável por:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Fornecer informações precisas e actualizadas</li>
              <li>Manter a confidencialidade das suas credenciais de acesso</li>
              <li>Notificar imediatamente qualquer uso não autorizado da sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Sistema de Créditos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os serviços são pagos através de um sistema de créditos. Os créditos podem ser adquiridos mediante 
              transferência bancária e são não-reembolsáveis após a confirmação do depósito.
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>1 Crédito = 150 Kz</li>
              <li>Os créditos não expiram</li>
              <li>Os créditos não são transferíveis entre contas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              O utilizador mantém todos os direitos sobre os ficheiros originais submetidos. Os trabalhos finalizados 
              pela PARTISOLFA são propriedade do utilizador após a conclusão do serviço. A PARTISOLFA reserva-se o 
              direito de utilizar exemplos anónimos para fins promocionais, salvo indicação contrária do utilizador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Prazos de Entrega</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os prazos de entrega variam conforme a complexidade do trabalho solicitado. A PARTISOLFA compromete-se 
              a informar o prazo estimado aquando da aceitação da solicitação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA não se responsabiliza por danos indirectos, incidentais ou consequenciais resultantes 
              da utilização ou impossibilidade de utilização dos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Alterações aos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA reserva-se o direito de modificar estes termos a qualquer momento. As alterações entram 
              em vigor imediatamente após a sua publicação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas com estes Termos de Uso, entre em contacto através do email: 
              <a href="mailto:suporte@partisolfa.com" className="text-primary hover:underline ml-1">
                suporte@partisolfa.com
              </a>
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8 pt-4 border-t border-border">
            Última actualização: Janeiro de 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;
