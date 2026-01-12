import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AvisoLegal = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Aviso Legal</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Identificação</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA é uma plataforma digital de serviços musicais, operando em território angolano 
              sob a legislação vigente da República de Angola.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Objecto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este website tem como objectivo a prestação de serviços de aperfeiçoamento de partituras 
              musicais e criação de arranjos musicais, mediante sistema de créditos pré-pagos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo deste website, incluindo mas não limitado a textos, gráficos, logótipos, 
              ícones, imagens e software, é propriedade da PARTISOLFA ou dos seus licenciadores e está 
              protegido pelas leis de propriedade intelectual aplicáveis.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              É expressamente proibida a reprodução, distribuição, comunicação pública ou transformação 
              de qualquer conteúdo sem autorização prévia e por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Responsabilidade sobre Conteúdos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O utilizador é o único responsável pelos ficheiros e conteúdos que submete à plataforma. 
              Ao submeter qualquer material, o utilizador declara que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Possui os direitos necessários sobre o material submetido</li>
              <li>O material não viola direitos de terceiros</li>
              <li>O material não contém conteúdo ilegal, difamatório ou ofensivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Isenção de Garantias</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os serviços são prestados "tal como estão" e "conforme disponíveis". A PARTISOLFA não 
              garante que os serviços serão ininterruptos, oportunos, seguros ou isentos de erros. 
              A qualidade dos resultados pode variar conforme a qualidade dos materiais originais fornecidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              Em nenhuma circunstância a PARTISOLFA será responsável por quaisquer danos directos, 
              indirectos, incidentais, especiais, consequenciais ou punitivos, incluindo mas não 
              limitado a perda de lucros, dados, uso ou outras perdas intangíveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Lei Aplicável e Jurisdição</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este aviso legal rege-se pela legislação da República de Angola. Para a resolução de 
              quaisquer litígios emergentes da utilização deste website, as partes acordam submeter-se 
              à jurisdição exclusiva dos tribunais angolanos competentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Política de Reembolso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os créditos adquiridos não são reembolsáveis após a confirmação do depósito. Em casos 
              excepcionais de falha na prestação do serviço por responsabilidade da PARTISOLFA, poderá 
              ser emitido crédito equivalente na conta do utilizador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Força Maior</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA não será responsável por qualquer atraso ou falha no cumprimento das suas 
              obrigações quando tal resulte de circunstâncias fora do seu controlo razoável, incluindo 
              mas não limitado a desastres naturais, guerra, terrorismo, greves ou falhas de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões legais ou reclamações, contacte-nos através do email: 
              <a href="mailto:legal@partisolfa.com" className="text-primary hover:underline ml-1">
                legal@partisolfa.com
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

export default AvisoLegal;
