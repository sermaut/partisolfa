import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidade</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A PARTISOLFA está comprometida com a protecção da privacidade dos seus utilizadores. Esta Política 
              de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as suas informações 
              pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Dados Recolhidos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recolhemos os seguintes tipos de informação:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Dados de registo:</strong> nome completo, endereço de email, palavra-passe encriptada</li>
              <li><strong>Dados de transacção:</strong> histórico de depósitos, créditos utilizados</li>
              <li><strong>Ficheiros submetidos:</strong> áudios, imagens e documentos enviados para processamento</li>
              <li><strong>Dados de utilização:</strong> registos de acesso, páginas visitadas, interacções na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Utilização dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os seus dados são utilizados para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Prestar os serviços solicitados</li>
              <li>Processar pagamentos e gerir a sua conta</li>
              <li>Comunicar sobre o estado das suas solicitações</li>
              <li>Melhorar a qualidade dos nossos serviços</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Armazenamento e Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Os seus dados são armazenados em servidores seguros com encriptação de ponta-a-ponta. Implementamos 
              medidas técnicas e organizacionais apropriadas para proteger os seus dados contra acesso não 
              autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Partilha de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos, alugamos ou partilhamos os seus dados pessoais com terceiros, excepto:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Quando necessário para prestar os serviços (processadores de pagamento)</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Com o seu consentimento expresso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos os seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as 
              quais foram recolhidos. Os ficheiros submetidos são mantidos durante 90 dias após a conclusão do 
              serviço, podendo ser eliminados a pedido do utilizador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O utilizador tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Aceder aos seus dados pessoais</li>
              <li>Rectificar dados incorrectos ou desactualizados</li>
              <li>Solicitar a eliminação dos seus dados</li>
              <li>Exportar os seus dados num formato legível</li>
              <li>Retirar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies estritamente necessários para o funcionamento da plataforma, como manter a sua 
              sessão activa. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Alterações à Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser actualizada periodicamente. As alterações serão publicadas nesta página 
              com a data de actualização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer os seus direitos ou esclarecer dúvidas sobre privacidade, contacte-nos através do email: 
              <a href="mailto:privacidade@partisolfa.com" className="text-primary hover:underline ml-1">
                privacidade@partisolfa.com
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

export default PoliticaPrivacidade;
